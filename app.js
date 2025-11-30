// app.js - PWA Palavras com paginação
const STORAGE_KEY = 'palavras_niveis_v1';
const MAX_LEVEL = 999;
const MIN_LEVEL = 0;
const ITEMS_PER_PAGE = 10; // ajuste aqui se quiser mudar número por página

let state = {
  items: [], // {id, word, level, createdAt}
  currentPage: 1
};

// ---------- persistência ----------
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try{
      const parsed = JSON.parse(raw);
      state.items = Array.isArray(parsed.items) ? parsed.items : [];
      state.currentPage = parsed.currentPage && Number.isInteger(parsed.currentPage) ? parsed.currentPage : 1;
    }catch(e){
      state = {items: [], currentPage: 1};
    }
  }
}

// ---------- util ----------
function uid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
function sortItems(){
  state.items.sort((a,b)=>{
    if(b.level !== a.level) return b.level - a.level;
    return b.createdAt - a.createdAt;
  });
}
function pageCount(){
  return Math.max(1, Math.ceil(state.items.length / ITEMS_PER_PAGE));
}
function ensureCurrentPageInRange(){
  const pc = pageCount();
  if(state.currentPage > pc) state.currentPage = pc;
  if(state.currentPage < 1) state.currentPage = 1;
}

// ---------- CRUD ----------
function addWord(word){
  if(!word) return;
  const item = { id: uid(), word: word.trim(), level: 0, createdAt: Date.now() };
  state.items.push(item);
  sortItems();

  // se adicionou e o item ficou numa nova página, ajustar para a página onde ele está
  const index = state.items.findIndex(x => x.id === item.id);
  state.currentPage = Math.floor(index / ITEMS_PER_PAGE) + 1;

  saveState();
  render();
}

function changeLevel(id, delta){
  const it = state.items.find(x=>x.id===id);
  if(!it) return;
  it.level = clamp(it.level + delta, MIN_LEVEL, MAX_LEVEL);
  sortItems();

  // tenta manter a mesma página lógica: encontrar índice novo do item e ir para essa página
  const index = state.items.findIndex(x => x.id === id);
  state.currentPage = Math.floor(index / ITEMS_PER_PAGE) + 1;
  ensureCurrentPageInRange();

  saveState();
  render();
}

function removeItem(id){
  const idx = state.items.findIndex(x => x.id === id);
  if(idx === -1) return;
  state.items.splice(idx,1);
  // ajustar página atual caso tenha removido o único item da última página
  ensureCurrentPageInRange();
  saveState();
  render();
}

// ---------- render ----------
function render(){
  const list = document.getElementById('list');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const pageInfo = document.getElementById('pageInfo');

  list.innerHTML = '';

  sortItems();
  ensureCurrentPageInRange();

  const pc = pageCount();
  pageInfo.textContent = `${state.currentPage} / ${pc}`;

  prevBtn.disabled = state.currentPage <= 1;
  nextBtn.disabled = state.currentPage >= pc;

  // calcular slice de itens da página atual
  const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = state.items.slice(start, end);

  if(pageItems.length === 0){
    const el = document.createElement('div');
    el.className = 'small-muted';
    el.textContent = 'Nenhuma palavra nesta página.';
    list.appendChild(el);
    return;
  }

  pageItems.forEach(item => {
    const row = document.createElement('div');
    row.className = 'item';

    const left = document.createElement('div');
    left.className = 'item-left';

    const pill = document.createElement('div');
    pill.className = 'word-pill';
    pill.textContent = item.word;

    left.appendChild(pill);

    const controls = document.createElement('div');
    controls.className = 'controls';

    const minus = document.createElement('button');
    minus.className = 'ctrl-btn';
    minus.textContent = '-';
    minus.addEventListener('click', ()=>changeLevel(item.id, -1));

    const level = document.createElement('div');
    level.className = 'level-display';
    level.textContent = String(item.level);

    const plus = document.createElement('button');
    plus.className = 'ctrl-btn';
    plus.textContent = '+';
    plus.addEventListener('click', ()=>changeLevel(item.id, +1));

    const del = document.createElement('button');
    del.className = 'ctrl-btn';
    del.textContent = '✕';
    del.title = 'Remover';
    del.addEventListener('click', ()=>{ if(confirm('Remover "'+item.word+'"?')) removeItem(item.id); });

    controls.appendChild(minus);
    controls.appendChild(level);
    controls.appendChild(plus);
    controls.appendChild(del);

    row.appendChild(left);
    row.appendChild(controls);
    list.appendChild(row);
  });
}

// ---------- paginação handlers ----------
function goPrev(){
  if(state.currentPage > 1){
    state.currentPage--;
    saveState();
    render();
  }
}
function goNext(){
  if(state.currentPage < pageCount()){
    state.currentPage++;
    saveState();
    render();
  }
}

// ---------- handlers e init ----------
function setupHandlers(){
  const input = document.getElementById('wordInput');
  const addBtn = document.getElementById('addBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  function doAdd(){
    const v = input.value.trim();
    if(!v) return;
    addWord(v);
    input.value = '';
    input.focus();
  }

  addBtn.addEventListener('click', doAdd);
  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') doAdd();
  });

  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);
}

// init
loadState();
sortItems();
document.addEventListener('DOMContentLoaded', ()=>{
  setupHandlers();
  render();
});
