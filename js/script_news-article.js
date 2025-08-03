document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "https://script.google.com/macros/s/AKfycbwoMvXkxIb0jmZRwnB_OR6pqe3062ZTv8596akKmDdj9eh3YJ7F0RoB1Y4kuzxWnn4b/exec";
  const loadingMessage = document.getElementById("loading-message");
  const articleElem = document.getElementById("news-article");

  const pathFromRoot = location.pathname.replace(/^\/+/, ''); // 例: news/20250802_test.html
  console.log("🔍 現在のパス:", pathFromRoot);

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // 日時でソート（昇順）
      const sorted = data.sort((a, b) => {
        const dateA = new Date(`${a["日付"]}T${a["時刻"] || "00:00"}`);
        const dateB = new Date(`${b["日付"]}T${b["時刻"] || "00:00"}`);
        return dateA - dateB;
      });

      const currentIndex = sorted.findIndex(item => item["URL"] === pathFromRoot);
      const currentItem = sorted[currentIndex];
      console.log("📦 該当記事:", currentItem);

      if (!currentItem) {
        loadingMessage.textContent = "記事が見つかりませんでした。";
        return;
      }

      // ▼ データ反映 ▼
      document.querySelector(".article-title").textContent = currentItem["タイトル"] || "";
      document.querySelector(".article-category").textContent = currentItem["カテゴリ"] || "";
      document.querySelector(".article-date").textContent = formatDate(currentItem["日付"]);

      const tagElem = document.querySelector(".tag-list");
      if (currentItem["タグ"]) {
        const tags = currentItem["タグ"].split(",").map(t => t.trim());
        tagElem.innerHTML = tags.map(t => `<span>${t}</span>`).join(" / ");
      } else {
        tagElem.textContent = "なし";
      }

      document.title = `${currentItem["タイトル"]} | せきたん公式サイト`;

      // ▼ ナビゲーション設定 ▼
      const prevBtn = document.querySelector(".nav-btn.prev");
      const nextBtn = document.querySelector(".nav-btn.next");

      if (currentIndex > 0) {
        const prev = sorted[currentIndex - 1];
        prevBtn.setAttribute("href", `/${prev["URL"]}`);
      } else {
        prevBtn.style.display = "none";
      }

      if (currentIndex < sorted.length - 1) {
        const next = sorted[currentIndex + 1];
        nextBtn.setAttribute("href", `/${next["URL"]}`);
      } else {
        nextBtn.style.display = "none";
      }

      // ▼ 表示切り替え ▼
      loadingMessage.remove();
      articleElem.style.display = "block";
      document.querySelector(".article-nav")?.removeAttribute("style");
    })
    .catch(err => {
      console.error("❌ 記事情報の取得に失敗しました", err);
      loadingMessage.textContent = "記事の読み込みに失敗しました。";
    });

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }
});
