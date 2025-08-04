document.addEventListener('DOMContentLoaded', () => {
  const newsList = document.getElementById('news-list');
  const apiUrl = 'https://script.google.com/macros/s/AKfycbwoMvXkxIb0jmZRwnB_OR6pqe3062ZTv8596akKmDdj9eh3YJ7F0RoB1Y4kuzxWnn4b/exec';

  const now = new Date(); // JSTローカルマシン時間

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // 未来日時の記事を除外し、降順ソート／先頭5件
      const filtered = data
        .filter(item => {
          if (!item["日付"] || !item["時刻"]) return true;
          const pubDate = toDateTimeJST(item["日付"], item["時刻"]);
          return pubDate <= now;
        })
        .sort((a, b) => {
          const aDate = toDateTimeJST(a["日付"], a["時刻"]);
          const bDate = toDateTimeJST(b["日付"], b["時刻"]);
          return bDate - aDate;
        })
        .slice(0, 5);

      // 「読み込み中…」を説明文に置き換え
      newsList.innerHTML = '';
      const description = document.createElement('p');
      description.className = 'news-description';
      description.innerHTML = 
        '最新のニュース5件が表示されます。<br>' +
        '見出しをタップすると詳細をご覧いただけます。';
      newsList.appendChild(description);

      // 記事がない場合
      if (filtered.length === 0) {
        const noNews = document.createElement('p');
        noNews.textContent = '現在お知らせはありません。';
        newsList.appendChild(noNews);
        return;
      }

      // 記事リストを描画
      filtered.forEach(item => {
        const a = document.createElement('a');
        a.href = item["URL"];
        a.className = 'news-item';
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
      newsList.innerHTML = '<p>ニュースを取得できませんでした。</p>';
      console.error('取得エラー:', error);
    });

  // 日付＋時刻文字列を JS Date に変換
  function toDateTimeJST(dateStr, timeStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = timeStr.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm);
  }

  // yyyy-mm-dd を yyyy.mm.dd に整形
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const y = d.getFullYear();
    const M = String(d.getMonth() + 1).padStart(2, '0');
    const D = String(d.getDate()).padStart(2, '0');
    return `${y}.${M}.${D}`;
  }
});
