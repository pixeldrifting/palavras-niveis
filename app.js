let words = [];
let currentPage = 1;
const pageSize = 10;

const input = document.getElementById("wordInput");
const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("list");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

addBtn.onclick = () => {
  const w = input.value.trim();
  if (!w) return;

  words.push({ word: w, level: 0 });
  input.value = "";
  sortWords();
  updateList();
};

// 🔥 Função que organiza automaticamente
function sortWords() {
  words.sort((a, b) => {
    // Primeiro ordena pelo nível (maior nível primeiro)
    if (b.level !== a.level) return b.level - a.level;

    // Depois ordena alfabeticamente se o nível for igual
    return a.word.localeCompare(b.word, "pt-BR");
  });
}

function updateList() {
  sortWords(); // sempre organiza antes de mostrar

  listEl.innerHTML = "";

  const totalPages = Math.max(1, Math.ceil(words.length / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const items = words.slice(start, start + pageSize);

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <div class="item-left">
        <div class="word-pill">${item.word}</div>
      </div>
      <div class="controls">
        <div class="ctrl-btn minus">-</div>
        <div class="level-display">${item.level}</div>
        <div class="ctrl-btn plus">+</div>
      </div>
    `;

    const realIndex = start + index;

    div.querySelector(".minus").onclick = () => {
      if (words[realIndex].level > 0) {
        words[realIndex].level--;
        sortWords();
        updateList();
      }
    };

    div.querySelector(".plus").onclick = () => {
      words[realIndex].level++;
      sortWords();
      updateList();
    };

    listEl.appendChild(div);
  });

  pageInfo.textContent = `${currentPage} / ${totalPages}`;
}

prevBtn.onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    updateList();
  }
};

nextBtn.onclick = () => {
  const totalPages = Math.ceil(words.length / pageSize);
  if (currentPage < totalPages) {
    currentPage++;
    updateList();
  }
};

updateList();
