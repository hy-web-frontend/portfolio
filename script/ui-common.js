/* =========================
   ナビ hover（日⇄英 切替）
   ※ hover可能デバイスのみ
========================= */
if (window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".menu a").forEach((item) => {
    const { en, ja } = item.dataset;

    item.addEventListener("mouseenter", () => {
      item.textContent = ja;
    });

    item.addEventListener("mouseleave", () => {
      item.textContent = en;
    });
  });
}

/* =========================
   nav 固定（CLS対策 完全版）
========================= */
const nav = document.querySelector("nav");
const spacer = document.getElementById("nav-spacer");

let navOffset = nav?.offsetTop ?? 0;
let ticking = false;

function updateNav() {
  const shouldFix = window.scrollY > navOffset;

  nav?.classList.toggle("is-fixed", shouldFix);
  spacer && (spacer.style.display = shouldFix ? "block" : "none");

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

window.addEventListener(
  "resize",
  () => {
    spacer && (spacer.style.display = "none");
    nav?.classList.remove("is-fixed");
    navOffset = nav?.offsetTop ?? 0;
  },
  { passive: true },
);

/* =========================
   ハンバーガーメニュー（完全版）
========================= */
const hamburger = document.getElementById("hamburger");
const shutterMenu = document.getElementById("shutterMenu");
const overlay = document.getElementById("menuOverlay");
const BREAKPOINT = 768;

let scrollY = 0;

function lockBody() {
  scrollY = window.scrollY;
  document.body.classList.add("menu-open");
  document.body.style.top = `-${scrollY}px`;
}

function unlockBody() {
  document.body.classList.remove("menu-open");
  document.body.style.top = "";
  window.scrollTo(0, scrollY);
}

function openMenu() {
  hamburger?.classList.add("active");
  shutterMenu?.classList.add("active");
  overlay?.classList.add("active");
  lockBody();
}

function closeMenu() {
  hamburger?.classList.remove("active");
  shutterMenu?.classList.remove("active");
  overlay?.classList.remove("active");
  unlockBody();
}

hamburger?.addEventListener("click", () => {
  hamburger.classList.contains("active") ? closeMenu() : openMenu();
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
  "home.html": { label: "トップページ", parent: null },
  "girls.html": { label: "在籍一覧", parent: "home.html" },
  "profile.html": { label: "プロフィール", parent: "girls.html" },
  "system.html": { label: "料金システム", parent: "home.html" },
  "concept.html": { label: "コンセプト", parent: "home.html" },
  "working.html": { label: "出勤表", parent: "home.html" },
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

  const currentPage = location.pathname.split("/").pop() || HOME_PAGE;

  const crumbs = [
    { label: SITE_NAME, url: HOME_PAGE },
    ...getBreadcrumbTrail(currentPage),
  ];

  /* Profileページのみ女の子名で上書き */
  if (document.body?.dataset.page === "profile" && window.PROFILE_NAME) {
    crumbs[crumbs.length - 1].label =
      `${window.PROFILE_NAME}さんのプロフィール`;
  }

  list.innerHTML = crumbs
    .map((crumb, i) =>
      i === crumbs.length - 1
        ? `<li class="breadcrumb-item current">${crumb.label}</li>`
        : `<li class="breadcrumb-item"><a href="${crumb.url}">${crumb.label}</a></li>`,
    )
    .join("");
}

/* 初期描画 */
document.addEventListener("DOMContentLoaded", renderBreadcrumb);

/* profile.js など外部から再描画可能に */
window.renderBreadcrumb = renderBreadcrumb;
