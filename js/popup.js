
// js/popup.js
class SpacedRepetition {
  constructor() {
    this.loadCards();
    this.initializeUI();
    this.bindEvents();
  }

  async loadCards() {
    const { cards } = await chrome.storage.local.get('cards');
    this.cards = cards || [];
    this.currentCard = null;
    this.showNextDueCard();
  }

  initializeUI() {
    this.frontEl = document.querySelector('.front');
    this.backEl = document.querySelector('.back');
    this.cardEl = document.querySelector('.flashcard');
    this.statsEl = {
      due: document.getElementById('cards-due'),
      learned: document.getElementById('cards-learned')
    };
  }

  bindEvents() {
    this.cardEl.addEventListener('click', () => this.flipCard());
    document.getElementById('again').addEventListener('click', () => this.gradeCard(1));
    document.getElementById('good').addEventListener('click', () => this.gradeCard(2));
    document.getElementById('easy').addEventListener('click', () => this.gradeCard(3));
  }

  flipCard() {
    this.cardEl.style.transform = 
      this.cardEl.style.transform === 'rotateY(180deg)' ? '' : 'rotateY(180deg)';
  }

  async gradeCard(grade) {
    if (!this.currentCard) return;

    const now = Date.now();
    const card = this.currentCard;

    // Implement SuperMemo 2 algorithm
    if (!card.repetitions) {
      card.repetitions = 0;
      card.easeFactor = 2.5;
    }

    if (grade >= 2) {
      card.repetitions++;
      card.interval = card.repetitions === 1 ? 1 
        : card.repetitions === 2 ? 6 
        : Math.round(card.interval * card.easeFactor);
      
      card.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
    } else {
      card.repetitions = 0;
      card.interval = 1;
    }

    card.dueDate = now + (card.interval * 24 * 60 * 60 * 1000);
    await this.saveCards();
    this.showNextDueCard();
  }

  async showNextDueCard() {
    const now = Date.now();
    const dueCards = this.cards.filter(card => !card.dueDate || card.dueDate <= now);
    
    this.statsEl.due.textContent = `Cards due: ${dueCards.length}`;
    this.statsEl.learned.textContent = `Learned: ${this.cards.length - dueCards.length}`;

    if (dueCards.length === 0) {
      this.currentCard = null;
      this.frontEl.textContent = 'No cards due!';
      this.backEl.textContent = '';
      return;
    }

    this.currentCard = dueCards[Math.floor(Math.random() * dueCards.length)];
    this.frontEl.textContent = this.currentCard.front;
    this.backEl.textContent = this.currentCard.back;
    this.cardEl.style.transform = '';
  }

  async saveCards() {
    await chrome.storage.local.set({ cards: this.cards });
  }
}

new SpacedRepetition();
