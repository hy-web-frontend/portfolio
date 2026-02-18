/*github 経由 */

const BASE =
  "https://raw.githubusercontent.com/hy-web-frontend/site-data/main/data";

const API = {
  casts: `${BASE}/casts.json`,
  today: `${BASE}/today.json`,
  weekly: `${BASE}/weekly.json`,
  images: `${BASE}/images.json`,
  profile: `${BASE}/profiles.json`,
};

const loadData = async () => {
  try {
    const [casts, today, weekly, images, profiles] = await Promise.all([
      fetch(API.casts).then((r) => r.json()),
      fetch(API.today).then((r) => r.json()),
      fetch(API.weekly).then((r) => r.json()),
      fetch(API.images).then((r) => r.json()),
      fetch(API.profile).then((r) => r.json()),
    ]);

    const page = document.body.dataset.page;

    if (page === "home" && typeof initHome === "function") {
      initHome(casts, today, weekly, images);
    }

    if (page === "working" && typeof initWorking === "function") {
      initWorking(casts, weekly, images);
    }

    if (page === "girls" && typeof initGirls === "function") {
      initGirls(casts, images);
    }

    if (page === "profile" && typeof initProfile === "function") {
      initProfile(casts, images, profiles, weekly);
    }
  } catch (e) {
    console.error("Static JSON Load Error:", e);
  }
};

document.addEventListener("DOMContentLoaded", loadData);
