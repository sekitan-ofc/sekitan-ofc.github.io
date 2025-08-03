document.addEventListener("DOMContentLoaded", () => {
  const newsListElem = document.getElementById("news-list");
  const filterCategoryElem = document.getElementById("filter-category");
  const filterTagElem = document.getElementById("filter-tag");
  const clearFiltersBtn = document.getElementById("clear-filters");

  const apiUrl = "https://script.google.com/macros/s/AKfycbyRg-JFYrFEoCjXbJgpuyo-6HLx-IKqvdMT_Hiev7U7f9-xk8axN3otU6ULDHmFKHsq/exec";

  let allNewsData = [];
  let selectedCategories = new Set();
  let selectedTags = new Set();

  // 日本時間で現在日時を取得
  const now = new Date(new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));

  // APIからニュースを取得
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      allNewsData = data.filter(item => {
        if (!item["公開日時"]) return true; // 公開日時ないなら表示
        // 公開日時フォーマット "YYYY-MM-DD HH:mm"
        const pubDate = new Date(item["公開日時"].replace(" ", "T") + ":00+09:00");
        return pubDate <= now; // 現在日時以前のみ表示
      });

      setupFiltersFromData(allNewsData);
      renderNewsList(allNewsData);
      setupEventListeners();
    })
    .catch(error => {
      newsListElem.innerHTML = "<p>ニュースを取得できませんでした。</p>";
      console.error("データ取得エラー:", error);
    });

  // ニュースリスト描画
  function renderNewsList(newsArray) {
    if (!newsArray.length) {
      newsListElem.innerHTML = "<p>該当するニュースがありません。</p>";
      return;
    }

    newsListElem.innerHTML = "";
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
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  }

  // データからカテゴリ・タグを抽出してフィルターUIを生成
  function setupFiltersFromData(data) {
    const categorySet = new Set();
    const tagSet = new Set();

    data.forEach(item => {
      if (item["カテゴリ"]) categorySet.add(item["カテゴリ"]);
      if (item["タグ"]) {
        item["タグ"].split(",").map(t => t.trim()).forEach(t => tagSet.add(t));
      }
    });

    // カテゴリ生成
    categorySet.forEach(cat => {
      const id = `cat_${cat}`;
      const label = document.createElement("label");
      label.htmlFor = id;
      label.textContent = cat;

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = id;
      input.value = cat;

      label.prepend(input);
      filterCategoryElem.appendChild(label);
    });

    // タグ生成
    tagSet.forEach(tag => {
      const id = `tag_${tag}`;
      const label = document.createElement("label");
      label.htmlFor = id;
      label.textContent = tag;

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = id;
      input.value = tag;

      label.prepend(input);
      filterTagElem.appendChild(label);
    });
  }

  // イベントリスナー設定
  function setupEventListeners() {
    filterCategoryElem.addEventListener("change", e => {
      if (e.target.tagName !== "INPUT") return;
      if (e.target.checked) selectedCategories.add(e.target.value);
      else selectedCategories.delete(e.target.value);
      filterAndRender();
    });

    filterTagElem.addEventListener("change", e => {
      if (e.target.tagName !== "INPUT") return;
      if (e.target.checked) selectedTags.add(e.target.value);
      else selectedTags.delete(e.target.value);
      filterAndRender();
    });

    clearFiltersBtn.addEventListener("click", () => {
      selectedCategories.clear();
      selectedTags.clear();
      filterCategoryElem.querySelectorAll("input").forEach(i => i.checked = false);
      filterTagElem.querySelectorAll("input").forEach(i => i.checked = false);
      renderNewsList(allNewsData);
    });
  }

  // フィルターを適用してニュース再描画
  function filterAndRender() {
    const filtered = allNewsData.filter(item => {
      // カテゴリが選択されている場合、含まれるものだけ
      if (selectedCategories.size > 0 && !selectedCategories.has(item["カテゴリ"])) return false;
      // タグが選択されている場合、どれか一つでも含まれていればOK
      if (selectedTags.size > 0) {
        if (!item["タグ"]) return false;
        const itemTags = item["タグ"].split(",").map(t => t.trim());
        if (!itemTags.some(t => selectedTags.has(t))) return false;
      }
      return true;
    });
    renderNewsList(filtered);
  }
});
