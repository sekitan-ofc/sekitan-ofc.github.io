document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "https://script.google.com/macros/s/AKfycbwoMvXkxIb0jmZRwnB_OR6pqe3062ZTv8596akKmDdj9eh3YJ7F0RoB1Y4kuzxWnn4b/exec";

  const pathFromRoot = location.pathname.replace(/^\/+/, ''); // 例: "news/20250802_test.html"

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // 相対パスで比較
      const currentItem = data.find(item => item["URL"] === pathFromRoot);

      if (!currentItem) {
        console.warn("記事データが見つかりませんでした");
        return;
      }

      // タイトルを反映
      const titleElem = document.querySelector(".article-title");
      if (titleElem) titleElem.textContent = currentItem["タイトル"] || "";

      // カテゴリ
      const categoryElem = document.querySelector(".article-category");
      if (categoryElem) categoryElem.textContent = currentItem["カテゴリ"] || "";

      // 日付（フォーマット処理あり）
      const dateElem = document.querySelector(".article-date");
      if (dateElem) dateElem.textContent = formatDate(currentItem["日付"]);

      // タグ
      const tagElem = document.querySelector(".tag-list");
      if (tagElem) {
        if (currentItem["タグ"]) {
          const tags = currentItem["タグ"].split(",").map(t => t.trim());
          tagElem.innerHTML = tags.map(t => `<span>${t}</span>`).join(" / ");
        } else {
          tagElem.textContent = "なし";
        }
      }

      // ページタイトルも書き換え
      document.title = `${currentItem["タイトル"]} | News | せきたん公式サイト`;

    })
    .catch(err => {
      console.error("記事情報の取得に失敗しました", err);
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
