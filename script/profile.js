/* =========================================================
   profile.js  完全版（パンくず名前反映 + サムネ委譲 + 安全化）
========================================================= */

/* ===============================
   サムネ → メイン画像切替（イベント委譲）
   ※ innerHTML後でも確実に動く
================================ */
function initThumbSwitch() {
  const container = document.querySelector(".detail-box");
  if (!container) return;

  container.addEventListener("click", (e) => {
    const img = e.target.closest(".thumb-list img");
    if (!img) return;

    const main = container.querySelector(".main-photo");
    if (!main) return;

    main.src = img.src;
  });
}

/* ===============================
   スクロールトップ制御
================================ */
function initScrollTopButton() {
  const btn = document.getElementById("scrollTop");
  if (!btn) return;

  const toggle = () => {
    btn.classList.toggle("is-visible", window.scrollY > 50);
  };

  window.addEventListener("scroll", toggle, { passive: true });
  toggle();

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ===============================
   前後ナビゲーション（id順）
================================ */
function initProfileNavigation(allCasts) {
  const prevBtn = document.querySelector(".side-btn.prev");
  const nextBtn = document.querySelector(".side-btn.next");
  if (!prevBtn || !nextBtn) return;

  const params = new URLSearchParams(location.search);
  const currentId = params.get("id");
  if (!currentId) return;

  const sorted = [...allCasts].sort((a, b) => Number(a.id) - Number(b.id));
  const currentIndex = sorted.findIndex(
    (c) => String(c.id) === String(currentId),
  );
  if (currentIndex === -1) return;

  const prev = sorted[currentIndex - 1];
  const next = sorted[currentIndex + 1];

  if (prev) {
    prevBtn.href = `profile.html?id=${prev.id}`;
    prevBtn.classList.remove("disabled");
  } else {
    prevBtn.removeAttribute("href");
    prevBtn.classList.add("disabled");
  }

  if (next) {
    nextBtn.href = `profile.html?id=${next.id}`;
    nextBtn.classList.remove("disabled");
  } else {
    nextBtn.removeAttribute("href");
    nextBtn.classList.add("disabled");
  }
}

/* ===============================
   profileキーの空白対策
================================ */
const normalizeKeys = (obj) => {
  const normalized = {};
  Object.entries(obj || {}).forEach(([key, value]) => {
    const cleanKey = String(key).replace(/[\s　]+/g, "");
    normalized[cleanKey] = value;
  });
  return normalized;
};

/* ===============================
   cast + images + profiles 結合
================================ */
const buildCastFullData = (casts, images, profiles) =>
  casts.map((cast) => {
    const img = images.find((r) => String(r.id) === String(cast.id)) || {};
    const rawProfile =
      profiles.find((r) => String(r.id) === String(cast.id)) || {};
    const profile = normalizeKeys(rawProfile);

    return {
      ...cast,

      // image
      main_photo: img.main_photo || "",
      sub1_photo: img.sub1_photo || "",
      sub2_photo: img.sub2_photo || "",
      sub3_photo: img.sub3_photo || "",
      sub4_photo: img.sub4_photo || "",
      sub5_photo: img.sub5_photo || "",

      // profile
      alcohol: profile.alcohol || "",
      smoke: profile.smoke || "",
      body_type: profile.body_type || "",
      looks_type: profile.looks_type || "",
      play_type: profile.play_type || "",
      hair: profile.hair || "",
      personality: profile.personality || "",
      like: profile.like || "",
      present: profile.present || "",
      explanation: profile.explanation || "",
      self_promotion: profile.self_promotion || "",
    };
  });

const hasAnyProfileData = (cast) =>
  [
    cast.alcohol,
    cast.smoke,
    cast.body_type,
    cast.looks_type,
    cast.play_type,
    cast.hair,
    cast.personality,
    cast.like,
    cast.present,
    cast.explanation,
    cast.self_promotion,
  ].some((v) => v != null && String(v).replace(/[\s　]+/g, "") !== "");

/* ===============================
   日付ユーティリティ
================================ */
const formatDate = (iso) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const formatWeek = (iso) =>
  new Date(iso).toLocaleDateString("ja-JP", { weekday: "short" });

/* ===============================
   女の子用 週間スケジュール
   ※ weekly が null のときも落ちない
================================ */
const isTrue = (v) =>
  String(v ?? "")
    .trim()
    .toUpperCase() === "TRUE";

function buildGirlWeeklySchedule(castId, weekly) {
  if (!weekly || !weekly.date_map || !weekly.list) return [];

  const { date_map, list } = weekly;

  return Object.entries(date_map)
    .map(([code, iso]) => {
      const row = list.find(
        (r) =>
          String(r.id) === String(castId) && String(r.date) === String(code),
      );

      return {
        code,
        iso,
        date: formatDate(iso),
        week: formatWeek(iso),
        is_active: isTrue(row?.is_active),
        start: row?.start || "",
        end: row?.end || "",
        reception: isTrue(row?.reception),
      };
    })
    .sort((a, b) => new Date(a.iso) - new Date(b.iso));
}

/* ===============================
   スケジュール描画
================================ */
const renderSchedulePC = (days) => `
  <div class="schedule-row schedule-head">
    ${days.map((d) => `<div>${d.date}(${d.week})</div>`).join("")}
  </div>
  <div class="schedule-row schedule-body">
    ${days
      .map(
        (d) => `
      <div>
        ${
          d.is_active
            ? `<span class="work-time">${d.start}<br>｜<br>${d.end}</span>
               <span class="status">${d.reception ? "受付終了" : "予約受付中"}</span>`
            : ""
        }
      </div>`,
      )
      .join("")}
  </div>
`;

const renderScheduleSP = (days) =>
  days
    .map(
      (d) => `
    <div class="schedule-item">
      <div class="day-date">${d.date}(${d.week})</div>
      ${
        d.is_active
          ? `<div class="sp-work-time">${d.start}〜${d.end}</div>
             <div class="status">${d.reception ? "受付終了" : "予約受付中"}</div>`
          : ""
      }
    </div>`,
    )
    .join("");

function renderDlRow(label, value) {
  const v = value ?? "";
  return `
    <dt>${label}</dt>
    <dd>${v}</dd>
  `;
}

/* ===============================
   プロフィール描画（dt/dd 復活版）
================================ */
function renderJobCasts(casts, weekly) {
  const container = document.querySelector(".detail-box");
  if (!container || !casts.length) return;

  const cast = casts[0];

  const days = buildGirlWeeklySchedule(cast.id, weekly);
  const todayCode = weekly?.today_code;
  const isTodayWorking = days.some((d) => d.code === todayCode && d.is_active);

  const uniqueHtml = [cast.unique_1, cast.unique_2, cast.unique_3]
    .filter(Boolean)
    .map((u) => `<span class="badge badge-honor">${u}</span>`)
    .join("");

  const thumbs = [
    cast.sub1_photo,
    cast.sub2_photo,
    cast.sub3_photo,
    cast.sub4_photo,
    cast.sub5_photo,
  ].filter(Boolean);

  const thumbHtml = thumbs.length
    ? thumbs
        .map(
          (src) =>
            `<li><img src="${src}" alt="${cast.name}" loading="lazy" decoding="async"></li>`,
        )
        .join("")
    : `<li class="thumb-empty"></li>`;

  const detailRows = `
    ${renderDlRow("スタイル", cast.body_type)}
    ${renderDlRow("ルックスタイプ", cast.looks_type)}
    ${renderDlRow("SかMか", cast.play_type)}
    ${renderDlRow("アンダーヘア", cast.hair)}
    ${renderDlRow("タバコ", cast.smoke)}
    ${renderDlRow("お酒", cast.alcohol)}
    ${renderDlRow("性格", cast.personality)}
    ${renderDlRow("好きなもの", cast.like)}
    ${renderDlRow("嬉しい差し入れ", cast.present)}
  `.trim();

  const commentRows = `
    ${renderDlRow("お店コメント", cast.explanation)}
    ${renderDlRow("女の子コメント", cast.self_promotion)}
  `.trim();

  const detailHtml = detailRows
    ? `<dl class="detail-data">${detailRows}</dl>`
    : "";
  const commentHtml = commentRows
    ? `<dl class="detail-data">${commentRows}</dl>`
    : "";

  container.innerHTML = `
    <div class="profile-media">
      <img class="main-photo" src="${cast.main_photo}" alt="${cast.name}" loading="lazy" decoding="async">
      <ul class="thumb-list">${thumbHtml}</ul>
    </div>

    <div class="profile-info">
      <div class="main-data">
        <h2 class="girl-name">
          ${cast.name}
          <span class="age">（${cast.age}）</span>
          ${uniqueHtml}
        </h2>

        ${isTodayWorking ? `<p class="work-status badge badge-working">本日出勤</p>` : ""}

        <p class="body-sizes">
          T${cast.height}
          B${cast.bust}${cast.size}
          W${cast.waist}
          H${cast.hip}
        </p>
      </div>

      ${detailHtml}
      ${commentHtml}
    </div>

    <section class="work-sheet">
      <div class="title">
        <h2 class="main-title">
          Schedule
          <span class="sub-title">〜出勤情報〜</span>
        </h2>
      </div>

      <div class="schedule-pc">${renderSchedulePC(days)}</div>
      <div class="schedule-sp">${renderScheduleSP(days)}</div>
    </section>
  `;
}

function setProfileTitle(cast) {
  if (!cast || !cast.name) return;

  document.title = `${cast.name}さんのプロフィール`;

  window.PROFILE_NAME = cast.name;
  document.body.dataset.page = "profile";

  // ★ パンくずを再描画
  window.renderBreadcrumb?.();
}

/* ===============================
   実行処理まとめ
================================ */
function initProfile(casts, images, profiles, weekly = null) {
  initScrollTopButton();
  initThumbSwitch();

  if (
    !Array.isArray(casts) ||
    !Array.isArray(images) ||
    !Array.isArray(profiles)
  ) {
    console.warn("initProfile: 引数不足", { casts, images, profiles });
    return;
  }

  const merged = buildCastFullData(casts, images, profiles);
  if (!merged.length) {
    console.warn("結合後データが空です");
    return;
  }

  const params = new URLSearchParams(location.search);
  const targetId = params.get("id");

  const targetCasts = targetId
    ? merged.filter((c) => String(c.id) === String(targetId))
    : merged.filter(hasAnyProfileData);

  if (!targetCasts.length) {
    console.warn("指定IDの女の子が見つかりません:", targetId);
    return;
  }

  const cast = targetCasts[0];

  setProfileTitle(cast);
  renderJobCasts(targetCasts, weekly);

  if (targetId) initProfileNavigation(merged);
}

/* 外から呼べるように（念のため） */
window.initProfile = initProfile;
