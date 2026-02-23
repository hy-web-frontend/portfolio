/* =================================================
  実行処理まとめ
================================================= */
function initHome(casts, today, weekly, images) {
  /* ---------------------------------------------
     cast + image 結合
  --------------------------------------------- */
  const imageMap = new Map(
    images.map((img) => [String(img.id), img.main_photo]),
  );

  const castsWithImage = casts.map((cast) => ({
    ...cast,
    main_photo: imageMap.get(String(cast.id)) || "",
  }));

  /* ---------------------------------------------
     新人（最大12人）
  --------------------------------------------- */
  const newCasts = castsWithImage.filter((c) => isTrue(c.is_new)).slice(0, 12);

  renderNewCasts(newCasts);

  /* ---------------------------------------------
     今日の出勤
  --------------------------------------------- */
  const todayCasts = buildTodayCasts(
    weekly.list,
    castsWithImage,
    weekly.today_code,
  );

  renderTodayCasts(todayCasts);

  /* ---------------------------------------------
     待機中
  --------------------------------------------- */
  const nowCasts = buildNowCasts(today, castsWithImage);

  renderNowCasts(nowCasts);
}

/* =================================================
   unique（称号付与）生成
================================================= */
const isTrue = (v) => v === true || v === "TRUE";

const buildUniqueHtml = (cast) =>
  [cast.unique_1, cast.unique_2, cast.unique_3]
    .filter(Boolean)
    .map((u, i) => `<span class="unique-${i + 1}">${u}</span>`)
    .join("");

/* =================================================
   待機中キャスト生成
================================================= */
const buildNowCasts = (todayList, castsWithImage) =>
  todayList
    .filter((row) => isTrue(row.is_wait))
    .map((row) => {
      const cast = castsWithImage.find((c) => String(c.id) === String(row.id));
      if (!cast) return null;

      return {
        ...cast,
        wait_time: row.updated_at || "",
      };
    })
    .filter(Boolean);

/* =================================================
   待機中キャスト描画
================================================= */
const renderNowCasts = (casts) => {
  const container = document.querySelector(".w-cards");
  if (!container || !casts.length) return;

  container.innerHTML = casts
    .map((cast, index) => {
      const uniqueHtml = buildUniqueHtml(cast);
      const isLCP = index === 0;

      return `
        <a href="profile.html?id=${cast.id}" class="w-card">
          <div class="w-box">
            <img
              src="${cast.main_photo}"
              alt="${cast.name}"
              width="240"
              height="320"
              decoding="async"
              ${
                isLCP
                  ? 'fetchpriority="high" loading="eager"'
                  : 'loading="lazy"'
              }
            />

            <div class="wait-text">
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
            </div>
          </div>

          <p class="wait-time">${cast.wait_time}〜待機中</p>
        </a>
      `;
    })
    .join("");
};

/* =================================================
   今日の出勤キャスト生成
================================================= */
const buildTodayCasts = (weeklyList, castsWithImage, todayCode) =>
  castsWithImage
    .map((cast) => {
      const schedule = weeklyList.find(
        (row) =>
          String(row.id) === String(cast.id) &&
          row.date === todayCode &&
          isTrue(row.is_active),
      );

      if (!schedule) return null;

      return {
        ...cast,
        start: schedule.start ?? "",
        end: schedule.end ?? "",
        reception: schedule.reception ?? "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const aClosed = isTrue(a.reception);
      const bClosed = isTrue(b.reception);

      if (aClosed !== bClosed) return aClosed - bClosed;

      return (a.start || "99:99").localeCompare(b.start || "99:99");
    });

/* =================================================
   今日の出勤キャスト描画
================================================= */
const renderTodayCasts = (casts) => {
  const container = document.querySelector(".t-cards");
  if (!container) return;

  container.innerHTML = casts
    .map((cast) => {
      const uniqueHtml = buildUniqueHtml(cast);
      const isClosed = isTrue(cast.reception);

      return `
        <a href="profile.html?id=${cast.id}"
           class="t-card ${isClosed ? "is-closed" : ""}">

          <div class="t-img">
            <img
              src="${cast.main_photo}"
              alt="${cast.name}"
              loading="lazy"
              decoding="async"
              width="240"
              height="320"
            />
          </div>

          <div class="today-text">
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

            ${
              isClosed
                ? `<p class="closed">受付終了</p>`
                : `
                  <p class="open">予約受付中</p>
                  <p class="time">${cast.start}〜${cast.end}</p>
                `
            }
          </div>
        </a>
      `;
    })
    .join("");
};

/*入店日　早い順　opening を「月日 → 数値」に変換して sort*/
const sortByOpening = (casts) => {
  return [...casts].sort((a, b) => {
    if (!a.opening && !b.opening) return 0;
    if (!a.opening) return 1;
    if (!b.opening) return -1;

    const toNum = (str) => {
      const m = str.match(/(\d+)月(\d+)日/);
      return m ? Number(m[1]) * 100 + Number(m[2]) : 9999;
    };

    return toNum(a.opening) - toNum(b.opening);
  });
};


/* =================================================
   新人キャスト描画
================================================= */

const renderNewCasts = (casts) => {
  const container = document.querySelector(".n-cards");
  if (!container) return;

  const sorted = sortByOpening(casts);

  container.innerHTML = sorted
    .map((cast) => {
      const uniqueHtml = buildUniqueHtml(cast);

      return `
        <a href="profile.html?id=${cast.id}" class="n-card">
          <div class="n-img">
            <img
              src="${cast.main_photo}"
              alt="${cast.name}"
              loading="lazy"
            />
          </div>

          <div class="new-text">
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

            <p class="op-day">${cast.opening}入店</p>
          </div>
        </a>
      `;
    })
    .join("");
};
