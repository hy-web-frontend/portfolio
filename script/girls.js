/* =================================================
   実行処理まとめ
================================================= */
const initGirls = (casts, images) => {
  if (!Array.isArray(casts) || !Array.isArray(images)) return;

  originalGirls = buildCastWithImage(casts, images);

  // 初期描画（分割描画）
  renderGirls(originalGirls);

  // フィルター初期化
  bindGirlsFilter();
};

/* =================================================
   casts + image 統合
================================================= */
const buildCastWithImage = (casts, images) =>
  casts
    .map((cast) => {
      const img = images.find((row) => String(row.id) === String(cast.id));

      return {
        ...cast,
        main_photo: img?.main_photo || "",
      };
    })
    .filter((cast) => cast.id);


/* =================================================
   状態保持（元データ）
================================================= */
let originalGirls = [];

/* =================================================
   在籍カード描画（分割描画）
================================================= */
const renderGirls = (casts) => {
  const container = document.querySelector(".g-cards");
  if (!container) return;

  container.innerHTML = "";

  const CHUNK_SIZE = 12;
  let index = 0;

  const renderChunk = () => {
    const slice = casts.slice(index, index + CHUNK_SIZE);

    const html = slice
      .map((cast) => {
        const uniqueHtml = [cast.unique_1, cast.unique_2, cast.unique_3]
          .filter(Boolean)
          .map((u, i) => `<span class="unique-${i + 1}">${u}</span>`)
          .join("");

        return `
          <a href="Profile.html?id=${cast.id}" class="g-card">
            <div class="g-img">
              <img
                src="${cast.main_photo}"
                alt="${cast.name}"
                width="240"
                height="320"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div class="g-text">
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
          </a>
        `;
      })
      .join("");

    container.insertAdjacentHTML("beforeend", html);

    index += CHUNK_SIZE;
    if (index < casts.length) {
      requestAnimationFrame(renderChunk);
    }
  };

  requestAnimationFrame(renderChunk);
};

/* =================================================
   フィルター実行（後効き）
================================================= */
const bindGirlsFilter = () => {
  const btn = document.getElementById("applyFilter");
  if (!btn) return;

  btn.addEventListener("click", () => {
    let result = [...originalGirls];

    /* ▼ カップ */
    const cupRange = document.getElementById("filterCup")?.value;
    if (cupRange) {
      result = result.filter((cast) => isCupInRange(cast.size, cupRange));
    }

    /* ▼ 年齢 */
    const ageRange = document.getElementById("filterAge")?.value;
    if (ageRange) {
      const [min, max] = ageRange.split("-").map(Number);
      result = result.filter((cast) => cast.age >= min && cast.age <= max);
    }

    /* ▼ 身長 */
    const heightRange = document.getElementById("filterHeight")?.value;
    if (heightRange) {
      const [min, max] = heightRange.split("-").map(Number);
      result = result.filter(
        (cast) => cast.height >= min && cast.height <= max,
      );
    }

    // フィルター後も分割描画
    requestAnimationFrame(() => renderGirls(result));
  });
};

/* =================================================
   カップ → 数値変換 & 判定
================================================= */
const isCupInRange = (size, range) => {
  if (!size) return false;

  const cupOrder = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    F: 6,
    G: 7,
    H: 8,
    I: 9,
    J: 10,
  };

  const letter = size.replace(/[^A-Z]/g, "");
  const value = cupOrder[letter];
  if (!value) return false;

  const [min, max] = range.split("-").map(Number);
  return value >= min && value <= max;
};
