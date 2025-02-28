class Settings {
    constructor() {
      this.loadCards();
      this.bindEvents();
    }
  
    async loadCards() {
      const { cards } = await chrome.storage.local.get('cards');
      this.cards = cards || [];
      this.renderCards();
    }
  
    bindEvents() {
      document.getElementById('add-card-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.addCard();
      });
  
      document.getElementById('export').addEventListener('click', () => this.exportCards());
      document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import').click();
      });
  
      document.getElementById('import').addEventListener('change', (e) => {
        this.importCards(e.target.files[0]);
      });
    }
  
    async addCard() {
      const front = document.getElementById('front').value;
      const back = document.getElementById('back').value;
  
      this.cards.push({
        front,
        back,
        createdAt: Date.now()
      });
  
      await this.saveCards();
      this.renderCards();
      
      document.getElementById('front').value = '';
      document.getElementById('back').value = '';
    }
  
    async deleteCard(index) {
      this.cards.splice(index, 1);
      await this.saveCards();
      this.renderCards();
    }
  
    renderCards() {
      const container = document.getElementById('cards');
      container.innerHTML = '';
  
      this.cards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.innerHTML = `
          <button class="delete">×</button>
          <div><strong>${card.front}</strong></div>
          <div>${card.back}</div>
        `;
  
        cardEl.querySelector('.delete').addEventListener('click', () => {
          this.deleteCard(index);
        });
  
        container.appendChild(cardEl);
      });
    }
  
    exportCards() {
      const dataStr = JSON.stringify(this.cards, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportEl = document.createElement('a');
      exportEl.setAttribute('href', dataUri);
      exportEl.setAttribute('download', 'flashcards.json');
      exportEl.click();
    }
  
    async importCards(file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedCards = JSON.parse(e.target.result);
          this.cards = [...this.cards, ...importedCards];
          await this.saveCards();
          this.renderCards();
        } catch (error) {
          console.error('Error importing cards:', error);
          alert('Error importing cards. Please make sure the file is valid JSON.');
        }
      };
      reader.readAsText(file);
    }
  
    async saveCards() {
      await chrome.storage.local.set({ cards: this.cards });
    }
  }
  
  new Settings();
  