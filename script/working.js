/* ===============================
   実行処理まとめ
================================ */
function initWorking(casts, weekly, images) {
  const castsWithImage = buildCastWithImage(casts, images);

  const days = buildWeeklySchedule(castsWithImage, weekly);
  renderWeeklyTabs(days);

  const defaultCode = weekly.today_code || days[0]?.code;
  if (!defaultCode) return;

  // 初期表示（分割描画）
  renderByDay(defaultCode, days);
  setActiveDay(defaultCode);
  bindDayClick(days);
}

/* ===============================
   casts + image 統合
================================ */
const buildCastWithImage = (casts, images) => {
  const imageMap = new Map(
    images.map((img) => [String(img.id), img.main_photo]),
  );

  return casts.map((cast) => ({
    ...cast,
    main_photo: imageMap.get(String(cast.id)) || "",
  }));
};

/* ===============================
   ユーティリティ
================================ */
const formatDate = (iso) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const formatWeek = (iso) => {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
  });
};

/* ===============================
   週間データ構築
================================ */
function buildWeeklySchedule(casts, weekly) {
  const { date_map, list } = weekly;

  return Object.entries(date_map)
    .map(([code, iso]) => {
      const dayCasts = list
        .filter(
          (row) =>
            (row.is_active === true || row.is_active === "TRUE") &&
            row.date === code,
        )
        .map((row) => {
          const profile = casts.find((c) => String(c.id) === String(row.id));

          return profile
            ? { ...profile, start: row.start, end: row.end }
            : null;
        })
        .filter(Boolean);

      return {
        code,
        iso,
        date: formatDate(iso),
        week: formatWeek(iso),
        casts: dayCasts,
      };
    })
    .sort((a, b) => new Date(a.iso) - new Date(b.iso));
}

/* ===============================
   曜日タブ描画
================================ */
function renderWeeklyTabs(days) {
  const weeklyEl = document.querySelector(".weekly");
  if (!weeklyEl) return;

  weeklyEl.innerHTML = days
    .map(
      (d) => `
        <li class="day-list" data-code="${d.code}">
          <p class="day">${d.date}</p>
          <p class="week">${d.week}</p>
        </li>
      `,
    )
    .join("");
}

/* ===============================
   出勤キャスト描画
================================ */
function renderJobCasts(casts) {
  const container = document.querySelector(".j-cards");
  if (!container) return;

  container.innerHTML = "";

  // ★ 最初に表示する枚数（体感優先）
  const first = casts.slice(0, 8);
  const rest = casts.slice(8);

  container.innerHTML = first.map(buildJobCard).join("");

  if (rest.length) {
    requestAnimationFrame(() => {
      container.insertAdjacentHTML(
        "beforeend",
        rest.map(buildJobCard).join(""),
      );
    });
  }
}

const buildJobCard = (cast) => {
  const uniqueHtml = [cast.unique_1, cast.unique_2, cast.unique_3]
    .filter(Boolean)
    .map((u, i) => `<span class="unique-${i + 1}">${u}</span>`)
    .join("");

  return `
    <a href="profile.html?id=${cast.id}" class="j-card">
      <div class="j-img">
        <img
          src="${cast.main_photo}"
          alt="${cast.name}"
          loading="lazy"
          decoding="async"
          width="240"
          height="320"
        />
      </div>

      <div class="job-text">
        <p class="name">
          ${cast.name}（${cast.age}）
          <span class="unique-wrap">${uniqueHtml}</span>
        </p>

        <p class="size">
          T${cast.height}
          B${cast.bust}${cast.size}
          W${cast.waist}
          H${cast.hip}
        </p>

        <p class="time">
          ${cast.start}〜${cast.end}
        </p>
      </div>
    </a>
  `;
};

/* ===============================
   日付切替処理
================================ */
function renderByDay(code, days) {
  const day = days.find((d) => d.code === code);
  if (!day) return;

  performance.mark("render-start");

  requestAnimationFrame(() => {
    renderJobCasts(day.casts);

    requestAnimationFrame(() => {
      performance.mark("render-end");
      performance.measure("all-rendered", "render-start", "render-end");
    });
  });
}

function setActiveDay(code) {
  document.querySelectorAll(".day-list").forEach((li) => {
    li.classList.toggle("is-active", li.dataset.code === code);
  });
}

function bindDayClick(days) {
  document.querySelectorAll(".day-list").forEach((li) => {
    li.addEventListener("click", () => {
      const code = li.dataset.code;
      renderByDay(code, days);
      setActiveDay(code);
    });
  });
}
