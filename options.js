function loadFlashcards() {
    const flashcards = localStorage.getItem("flashcards");
    return flashcards ? JSON.parse(flashcards) : [];
  }
  
  function saveFlashcards(flashcards) {
    localStorage.setItem("flashcards", JSON.stringify(flashcards));
  }
  
  function updateList() {
    const flashcards = loadFlashcards();
    const list = document.getElementById("flashcard-list");
    list.innerHTML = "";
    flashcards.forEach(card => {
      const li = document.createElement("li");
      li.textContent = `${card.word} ➝ ${card.translation}`;
      list.appendChild(li);
    });
  }
  
  document.getElementById("add").addEventListener("click", () => {
    const wordInput = document.getElementById("word");
    const translationInput = document.getElementById("translation");
    const word = wordInput.value.trim();
    const translation = translationInput.value.trim();
    if (word && translation) {
      let flashcards = loadFlashcards();
      flashcards.push({
        word,
        translation,
        efactor: 2.5,
        interval: 1,
        repetitions: 0,
        lastReviewed: 0
      });
      saveFlashcards(flashcards);
      wordInput.value = "";
      translationInput.value = "";
      updateList();
    }
  });
  
  document.addEventListener("DOMContentLoaded", updateList);
  