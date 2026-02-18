/* =========================
   ナビ hover（日⇄英 切替）
   ※ UI必須・問題なし
========================= */
document.querySelectorAll(".menu a").forEach((item) => {
  const { en, ja } = item.dataset;

  item.addEventListener("mouseenter", () => {
    item.textContent = ja;
  });

  item.addEventListener("mouseleave", () => {
    item.textContent = en;
  });
});

/* =========================
   nav 固定（CLS対策 完全版）
========================= */
const nav = document.querySelector("nav");
const spacer = document.getElementById("nav-spacer");

let navOffset = nav.offsetTop;
let ticking = false;

function updateNav() {
  const shouldFix = window.scrollY > navOffset;

  nav.classList.toggle("is-fixed", shouldFix);

  // ★ CLS対策の核心
  spacer.style.display = shouldFix ? "block" : "none";

  ticking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  },
  { passive: true },
);

/* リサイズ時に基準点を再計算 */
window.addEventListener(
  "resize",
  () => {
    spacer.style.display = "none";
    nav.classList.remove("is-fixed");
    navOffset = nav.offsetTop;
  },
  { passive: true },
);

/* =========================
   ハンバーガーメニュー
========================= */
const hamburger = document.getElementById("hamburger");
const shutterMenu = document.getElementById("shutterMenu");
const overlay = document.getElementById("menuOverlay");
const BREAKPOINT = 768;

function closeMenu() {
  hamburger.classList.remove("active");
  shutterMenu.classList.remove("active");
  overlay.classList.remove("active");
}

hamburger?.addEventListener("click", () => {
  const isOpen = hamburger.classList.toggle("active");
  shutterMenu.classList.toggle("active", isOpen);
  overlay.classList.toggle("active", isOpen);
});

overlay?.addEventListener("click", closeMenu);

shutterMenu?.addEventListener("click", (e) => {
  if (e.target.closest("a")) closeMenu();
});

window.addEventListener(
  "resize",
  () => {
    if (window.innerWidth > BREAKPOINT) {
      closeMenu();
    }
  },
  { passive: true },
);

/* =========================
   サイト情報
========================= */
const SITE_NAME = "Demo Site Store";
const HOME_PAGE = "Home.html";

/* =========================
   パンくず定義
========================= */
const breadcrumbMap = {
  "Home.html": { label: "トップページ", parent: null },
  "Girls.html": { label: "在籍一覧", parent: "Home.html" },
  "Profile.html": { label: "プロフィール", parent: "Girls.html" },
  "System.html": { label: "料金システム", parent: "Home.html" },
  "Concept.html": { label: "コンセプト", parent: "Home.html" },
  "Working.html": { label: "出勤表", parent: "Home.html" },
};

/* =========================
   パンくず生成
========================= */
function getBreadcrumbTrail(page) {
  const trail = [];

  while (page && breadcrumbMap[page]) {
    trail.unshift({
      label: breadcrumbMap[page].label,
      url: page,
    });
    page = breadcrumbMap[page].parent;
  }

  return trail;
}

/* =========================
   パンくず描画
========================= */
function renderBreadcrumb() {
  const list = document.getElementById("breadcrumbList");
  if (!list) return;

  const currentPage =
    location.pathname.split("/").pop() || HOME_PAGE;

  const crumbs = [
    { label: SITE_NAME, url: HOME_PAGE },
    ...getBreadcrumbTrail(currentPage),
  ];

  /* ===== Profileページのみ女の子名で上書き ===== */
  if (
    document.body?.dataset.page === "profile" &&
    window.PROFILE_NAME
  ) {
    crumbs[crumbs.length - 1].label =
      `${window.PROFILE_NAME}さんのプロフィール`;
  }

  list.innerHTML = crumbs
    .map((crumb, i) =>
      i === crumbs.length - 1
        ? `<li class="breadcrumb-item current">${crumb.label}</li>`
        : `<li class="breadcrumb-item"><a href="${crumb.url}">${crumb.label}</a></li>`
    )
    .join("");
}

/* ===== 初期描画 ===== */
document.addEventListener("DOMContentLoaded", renderBreadcrumb);

/* ★ これが超重要：profile.js から呼べるようにする */
window.renderBreadcrumb = renderBreadcrumb;