if (window.wordReplacer) {
  console.log('WordReplacer already initialized');
} else {
  console.log('Initializing WordReplacer for the first time');

  class WordReplacer {
    constructor() {
      console.log('WordReplacer constructor called');
      this.processedNodes = new WeakSet();
      this.observer = null;
      this.loadCards();
      this.setupHoverStyles();
      this.setupObserver();
    }

    setupObserver() {
      console.log('Setting up MutationObserver');
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          // Process only added nodes
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // ELEMENT_NODE
              this.processNode(node);
            }
          });
        });
      });

      // Start observing the document with the configured parameters
      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      console.log('MutationObserver started');
    }

    async loadCards() {
      try {
        const result = await chrome.storage.local.get('cards');
        this.cards = result.cards || [];
        console.log('Loaded cards:', this.cards);
        
        // Process the page once the DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, processing page');
            this.processNode(document.body);
          });
        } else {
          console.log('DOM already loaded, processing page');
          this.processNode(document.body);
        }
      } catch (error) {
        console.error('Error loading cards:', error);
      }
    }

    processNode(node) {
      if (this.processedNodes.has(node)) {
        return;
      }

      const textNodes = this.findTextNodes(node);
      console.log(`Found ${textNodes.length} text nodes in:`, node);
      
      if (textNodes.length > 0) {
        const dueCards = this.getDueCards();
        console.log('Processing with cards:', dueCards);
        
        textNodes.forEach(textNode => {
          let text = textNode.textContent;
          let modified = false;

          dueCards.forEach(card => {
            const regex = new RegExp(`\\b${this.escapeRegExp(card.front)}\\b`, 'gi');
            if (regex.test(text)) {
              modified = true;
              text = text.replace(regex, match => {
                return `<span class="contextual-lingo-word" data-translation="${card.front}">${card.back}</span>`;
              });
            }
          });

          if (modified) {
            console.log('Replacing text:', textNode.textContent, 'with:', text);
            const span = document.createElement('span');
            span.innerHTML = text;
            textNode.parentNode.replaceChild(span, textNode);
          }
        });
      }

      this.processedNodes.add(node);
    }

    findTextNodes(element) {
      const textNodes = [];
      const walk = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            // Skip script and style elements, and avoid already processed nodes
            if (
              node.parentElement &&
              (node.parentElement.tagName === 'SCRIPT' ||
               node.parentElement.tagName === 'STYLE' ||
               node.parentElement.classList.contains('contextual-lingo-word'))
            ) {
              return NodeFilter.FILTER_REJECT;
            }
            return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        },
        false
      );

      let currentNode;
      while (currentNode = walk.nextNode()) {
        textNodes.push(currentNode);
      }
      return textNodes;
    }

    getDueCards() {
      // For testing, simply return all cards.
      return this.cards;
    }

    escapeRegExp(string) {
      // Escapes special regex characters in the given string
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    setupHoverStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .contextual-lingo-word {
          position: relative;
          text-decoration: underline dotted;
          cursor: help;
        }
        .contextual-lingo-word:hover::after {
          content: attr(data-translation);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 8px;
          background: #333;
          color: white;
          border-radius: 4px;
          font-size: 14px;
          white-space: nowrap;
          z-index: 1000;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Initialize WordReplacer
  window.wordReplacer = new WordReplacer();
}
