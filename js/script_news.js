document.addEventListener('DOMContentLoaded', () => {
  const newsList = document.getElementById('news-list');
  const apiUrl = 'https://script.google.com/macros/s/AKfycbwoMvXkxIb0jmZRwnB_OR6pqe3062ZTv8596akKmDdj9eh3YJ7F0RoB1Y4kuzxWnn4b/exec';

  const now = new Date(new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const filtered = data.filter(item => {
        if (!item["公開日時"]) return true;
        const pubDate = new Date(item["公開日時"].replace(" ", "T") + ":00+09:00");
        return pubDate <= now;
      }).sort((a, b) => new Date(b["公開日時"]) - new Date(a["公開日時"]))
        .slice(0, 5);

      newsList.innerHTML = ""; // ← 読み込み中メッセージを消す

      if (filtered.length === 0) {
        newsList.innerHTML = '<p>現在お知らせはありません。</p>';
        return;
      }

      filtered.forEach(item => {
        const a = document.createElement('a');
        a.href = item["URL"];
        a.className = "news-item";
        a.innerHTML = `
          <div class="news-summary">
            <p class="date">${formatDate(item["日付"])}</p>
            <span class="news-category">${item["カテゴリ"]}</span>
            <h3>${item["タイトル"]}</h3>
          </div>
        `;
        newsList.appendChild(a);
      });
    })
    .catch(error => {
      newsList.innerHTML = "<p>ニュースを取得できませんでした。</p>";
      console.error("取得エラー:", error);
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
