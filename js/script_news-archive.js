document.addEventListener("DOMContentLoaded", () => {
  const newsListElem = document.getElementById("news-list");
  const apiUrl = "https://script.google.com/macros/s/AKfycbyRg-JFYrFEoCjXbJgpuyo-6HLx-IKqvdMT_Hiev7U7f9-xk8axN3otU6ULDHmFKHsq/exec";

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // 成功したら描画
      renderNewsList(data);
    })
    .catch(error => {
      newsListElem.innerHTML = "<p>ニュースを取得できませんでした。</p>";
      console.error("データ取得エラー:", error);
    });

  function renderNewsList(newsArray) {
    if (!newsArray.length) {
      newsListElem.innerHTML = "<p>ニュースはまだありません。</p>";
      return;
    }

    newsListElem.innerHTML = ""; // 初期化

    newsArray.forEach(item => {
      const a = document.createElement("a");
      a.href = item["URL"];
      a.className = "news-item";
      a.innerHTML = `
        <div class="news-summary">
          <time class="date">${formatDate(item["日付"])}</time>
          <span class="news-category">${item["カテゴリ"]}</span>
          <h3>${item["タイトル"]}</h3>
        </div>
      `;
      newsListElem.appendChild(a);
    });
  }

  // 日付を "YYYY.MM.DD" に整形
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }
});
