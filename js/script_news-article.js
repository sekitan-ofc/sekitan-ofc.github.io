document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "https://script.google.com/macros/s/AKfycbwoMvXkxIb0jmZRwnB_OR6pqe3062ZTv8596akKmDdj9eh3YJ7F0RoB1Y4kuzxWnn4b/exec";

  const pathFromRoot = location.pathname.replace(/^\/+/, ''); // 例: "news/20250802_test.html"

  const titleElem = document.querySelector(".article-title");
  const categoryElem = document.querySelector(".article-category");
  const dateElem = document.querySelector(".article-date");
  const tagElem = document.querySelector(".tag-list");
  const articleBodyElem = document.getElementById("article-body");
  const loadingMessageElem = document.getElementById("loading-message");
  const newsArticleElem = document.getElementById("news-article");

  // 最初は本文も含め非表示にする
  if(newsArticleElem) newsArticleElem.style.display = "none";

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const currentItem = data.find(item => item["URL"] === pathFromRoot);

      if (!currentItem) {
        loadingMessageElem.textContent = "記事データが見つかりませんでした。";
        return;
      }

      // タイトル
      if (titleElem) titleElem.textContent = currentItem["タイトル"] || "";

      // カテゴリ
      if (categoryElem) categoryElem.textContent = currentItem["カテゴリ"] || "";

      // 日付
      if (dateElem) dateElem.textContent = formatDate(currentItem["日付"]);

      // タグ
      if (tagElem) {
        if (currentItem["タグ"]) {
          const tags = currentItem["タグ"].split(",").map(t => t.trim());
          tagElem.innerHTML = tags.map(t => `<span>${t}</span>`).join(" / ");
        } else {
          tagElem.textContent = "なし";
        }
      }

      // 本文（HTMLを使う場合はここでinnerHTMLにするなど）
      if(articleBodyElem) {
        articleBodyElem.style.display = ""; // 表示する
        // もし本文をAPIから取るならここでセット
        // 例: articleBodyElem.innerHTML = currentItem["本文HTML"];
      }

      // ページタイトルも書き換え
      document.title = `${currentItem["タイトル"]} | News | せきたん公式サイト`;

      // 読み込み中メッセージ非表示
      if (loadingMessageElem) loadingMessageElem.style.display = "none";

      // 全体記事表示
      if(newsArticleElem) newsArticleElem.style.display = "";
    })
    .catch(err => {
      if (loadingMessageElem) loadingMessageElem.textContent = "ニュース情報を取得できませんでした。";
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
