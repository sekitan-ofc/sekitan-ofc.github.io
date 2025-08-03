document.addEventListener('DOMContentLoaded', () => {
  const newsList = document.getElementById('news-list');
  const apiUrl = 'https://script.google.com/macros/s/AKfycbwoMvXkxIb0jmZRwnB_OR6pqe3062ZTv8596akKmDdj9eh3YJ7F0RoB1Y4kuzxWnn4b/exec';

  const now = new Date(); // JSTローカルマシン時間でOK

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const filtered = data.filter(item => {
        if (!item["日付"] || !item["時刻"]) return true;

        const pubDate = toDateTimeJST(item["日付"], item["時刻"]);
        return pubDate <= now;
      }).sort((a, b) => {
        const aDate = toDateTimeJST(a["日付"], a["時刻"]);
        const bDate = toDateTimeJST(b["日付"], b["時刻"]);
        return bDate - aDate;
      }).slice(0, 5);

      newsList.innerHTML = "";

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

  function toDateTimeJST(dateStr, timeStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = timeStr.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm); // JST扱い
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }
});
