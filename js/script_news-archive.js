document.addEventListener("DOMContentLoaded", () => {
  const newsListElem = document.getElementById("news-list");
  const filterCategoryElem = document.getElementById("filter-category");
  const filterTagElem = document.getElementById("filter-tag");
  const filterYearElem = document.getElementById("filter-year");
  const filterMonthElem = document.getElementById("filter-month");
  const clearFiltersBtn = document.getElementById("clear-filters");
  const searchBox = document.getElementById("search-title");

  const apiUrl = "https://script.google.com/macros/s/AKfycbwoMvXkxIb0jmZRwnB_OR6pqe3062ZTv8596akKmDdj9eh3YJ7F0RoB1Y4kuzxWnn4b/exec";

  let allNewsData = [];
  let selectedCategories = new Set();
  let selectedTags = new Set();

  const now = new Date();

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      allNewsData = data.filter(item => {
        if (!item["日付"] || !item["時刻"]) return true;
        const pubDate = toDateTimeJST(item["日付"], item["時刻"]);
        return pubDate <= now;
      }).sort((a, b) => {
        const aDate = toDateTimeJST(a["日付"], a["時刻"]);
        const bDate = toDateTimeJST(b["日付"], b["時刻"]);
        return bDate - aDate;
      });

      setupFiltersFromData(allNewsData);
      setupYearMonthFilters(allNewsData);
      renderNewsList(allNewsData);
      setupEventListeners();
    })
    .catch(error => {
      newsListElem.innerHTML = "<p>ニュースを取得できませんでした。</p>";
      console.error("データ取得エラー:", error);
    });

  function renderNewsList(newsArray) {
    newsListElem.innerHTML = "";

    const description = document.createElement("p");
    description.className = "news-description";
    description.innerHTML = "過去に公開されたニュースの一覧です。<br>各見出しをタップすると詳細をご覧いただけます。";
    newsListElem.appendChild(description);

    if (!newsArray.length) {
      const noNews = document.createElement("p");
      noNews.textContent = "該当するニュースがありません。";
      newsListElem.appendChild(noNews);
      return;
    }

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

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }

  function toDateTimeJST(dateStr, timeStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = timeStr.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm);
  }

  function setupFiltersFromData(data) {
    const categorySet = new Set();
    const tagSet = new Set();

    data.forEach(item => {
      if (item["カテゴリ"]) categorySet.add(item["カテゴリ"]);
      if (item["タグ"]) item["タグ"].split(",").map(t => t.trim()).forEach(t => tagSet.add(t));
    });

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

  function setupYearMonthFilters(data) {
    const yearSet = new Set();
    data.forEach(item => {
      if (item["日付"] && item["時刻"]) {
        const d = toDateTimeJST(item["日付"], item["時刻"]);
        yearSet.add(d.getFullYear());
      }
    });
    Array.from(yearSet).sort((a, b) => b - a).forEach(year => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = `${year}年`;
      filterYearElem.appendChild(option);
    });
  }

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

    filterYearElem.addEventListener("change", () => {
      const year = filterYearElem.value;
      filterMonthElem.disabled = !year;
      filterAndRender();
    });

    filterMonthElem.addEventListener("change", filterAndRender);
    searchBox.addEventListener("input", filterAndRender);

    clearFiltersBtn.addEventListener("click", () => {
      selectedCategories.clear();
      selectedTags.clear();
      filterCategoryElem.querySelectorAll("input").forEach(i => i.checked = false);
      filterTagElem.querySelectorAll("input").forEach(i => i.checked = false);
      filterYearElem.value = "";
      filterMonthElem.value = "";
      filterMonthElem.disabled = true;
      searchBox.value = "";
      renderNewsList(allNewsData);
    });
  }

  function filterAndRender() {
    const year = filterYearElem.value;
    const month = filterMonthElem.value;
    const keyword = searchBox.value.trim().toLowerCase();

    const filtered = allNewsData.filter(item => {
      if (selectedCategories.size > 0 && !selectedCategories.has(item["カテゴリ"])) return false;
      if (selectedTags.size > 0) {
        if (!item["タグ"]) return false;
        const itemTags = item["タグ"].split(",").map(t => t.trim());
        if (!itemTags.some(t => selectedTags.has(t))) return false;
      }
      if (year || month) {
        if (!item["日付"] || !item["時刻"]) return false;
        const d = toDateTimeJST(item["日付"], item["時刻"]);
        if (year && d.getFullYear().toString() !== year) return false;
        if (month && String(d.getMonth() + 1).padStart(2, '0') !== month) return false;
      }
      if (keyword && !item["タイトル"].toLowerCase().includes(keyword)) return false;
      return true;
    });

    renderNewsList(filtered);
  }
});
