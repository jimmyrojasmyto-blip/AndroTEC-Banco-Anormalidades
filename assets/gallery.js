const el = (id) => document.getElementById(id);

const grid = el("grid");
const filterRow = el("filterRow");
const countEl = el("count");
const lightbox = el("lightbox");
const lbImg = el("lbImg");
const lbN = el("lbN");
const lbDiag = el("lbDiag");
const lbClose = el("lbClose");

let state = { data: null, filter: "Todas" };

async function init() {
  const res = await fetch("data/anormalidades.json");
  state.data = await res.json();
  buildFilters();
  render();
  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

function buildFilters() {
  const cats = new Set();
  state.data.fotos.forEach((f) => f.categorias.forEach((c) => cats.add(c)));
  const ordered = ["Todas", ...Array.from(cats).sort()];
  filterRow.innerHTML = ordered
    .map(
      (c) =>
        `<button type="button" class="filter-btn${c === "Todas" ? " active" : ""}" data-cat="${c}">${c}</button>`
    )
    .join("");
  filterRow.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    state.filter = btn.dataset.cat;
    [...filterRow.querySelectorAll(".filter-btn")].forEach((b) =>
      b.classList.toggle("active", b === btn)
    );
    render();
  });
}

function render() {
  const items = state.data.fotos.filter(
    (f) => state.filter === "Todas" || f.categorias.includes(state.filter)
  );
  countEl.textContent = `${items.length} de ${state.data.fotos.length} fotografías`;
  grid.innerHTML = items
    .map(
      (f) => `
      <button type="button" class="card" data-n="${f.n}">
        <img src="${f.archivo}" alt="Fotografía ${f.n}" loading="lazy" />
        <div class="card-body">
          <div class="n">FOTO ${String(f.n).padStart(2, "0")}</div>
          <div class="diag">${escapeHtml(f.diagnostico)}</div>
          <div class="tags">${f.categorias.map((c) => `<span class="tag">${escapeHtml(c)}</span>`).join("")}</div>
        </div>
      </button>`
    )
    .join("");
  [...grid.querySelectorAll(".card")].forEach((card) => {
    card.addEventListener("click", () => openLightbox(Number(card.dataset.n)));
  });
}

function openLightbox(n) {
  const f = state.data.fotos.find((x) => x.n === n);
  if (!f) return;
  lbImg.src = f.archivo;
  lbImg.alt = `Fotografía ${f.n}`;
  lbN.textContent = `FOTO ${String(f.n).padStart(2, "0")}`;
  lbDiag.textContent = f.diagnostico;
  lightbox.classList.add("open");
}

function closeLightbox() {
  lightbox.classList.remove("open");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

init();
