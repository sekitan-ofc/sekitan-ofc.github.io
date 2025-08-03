"use strict";

// APIエンドポイント（Apps Scriptの公開URL）
const API_URL = "https://script.google.com/macros/s/AKfycby-3GvzF2LXa6yUm9akvKkWEZvYkegIxOOhlW0vKSpP9e0RztoeXmbtk8JVAPj1KJZB/exec";

// DOM要素
const newsListElem = document.getElementById("news-list");
const filterCategoryElem = document.getElementById("filter-category");
const filterTagElem = document.getElementById("filter-tag");
const filterYearElem = document.getElementById("filter-year");
const filterMonthElem = document.getElementById("filter-month");
const clearFiltersBtn = document.getElementById("clear-filters");

// フィルター状態
let selectedCategories = new Set();
let selectedTags = new Set();
let selectedYear = "";
let selectedMonth = "";

// データ格納
let newsData = [];
let categories = [];
let tags = [];

// 初期化
function init() {
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      newsData = data.map((item) => ({
        id: item.ID,
        title: item.タイトル,
        url: item.URL,
        date: item.日付,
        category: item.カテゴリ,
        tags: item.タグ.split(",").map((t) => t.trim())
      }));

      // カテゴリ・タグの一覧を抽出して一意に
      categories = Array.from(new Set(newsData.map(item => item.category))).sort();
      tags = Array.from(
        new Set(newsData.flatMap(item => item.tags))
      ).sort();

      renderFilters();
      renderNewsList(newsData);
      populateYearOptions();
      setupEventListeners();
    })
    .catch((err) => {
      console.error("データ取得エラー:", err);
      newsListElem.innerHTML = "<p>ニュースデータの取得に失敗しました。</p>";
    });
}

// ニュースリスト描画
function renderNewsList(list) {
  if (!list.length) {
    newsListElem.innerHTML = "<p>該当するニュースがありません。</p>";
    return;
  }
  newsListElem.innerHTML = "";
  list.forEach((item) => {
    const a = document.createElement("a");
    a.href = item.url;
    a.className = "news-item";
    a.innerHTML = `
      <div class="news-summary">
        <time class="date">${formatDate(item.date)}</time>
        <span class="news-category">${item.category}</span>
        <h3>${item.title}</h3>
      </div>
    `;
    newsListElem.appendChild(a);
  });
}

// フィルターUI描画
function renderFilters() {
  // カテゴリ
  categories.forEach((cat) => {
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

  // タグ
  tags.forEach((tag) => {
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

// 年セレクトオプション生成
function populateYearOptions() {
  const yearsSet = new Set(newsData.map((item) => item.date.slice(0, 4)));
  const years = Array.from(yearsSet).sort((a, b) => b - a);
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    filterYearElem.appendChild(option);
  });
}

// イベント登録
function setupEventListeners() {
  filterCategoryElem.addEventListener("change", (e) => {
    if (e.target.tagName !== "INPUT") return;
    e.target.checked
      ? selectedCategories.add(e.target.value)
      : selectedCategories.delete(e.target.value);
    filterNews();
  });

  filterTagElem.addEventListener("change", (e) => {
    if (e.target.tagName !== "INPUT") return;
    e.target.checked
      ? selectedTags.add(e.target.value)
      : selectedTags.delete(e.target.value);
    filterNews();
  });

  filterYearElem.addEventListener("change", (e) => {
    selectedYear = e.target.value;
    if (!selectedYear) {
      selectedMonth = "";
      filterMonthElem.value = "";
      filterMonthElem.disabled = true;
    } else {
      filterMonthElem.disabled = false;
    }
    filterNews();
  });

  filterMonthElem.addEventListener("change", (e) => {
    selectedMonth = e.target.value;
    filterNews();
  });

  clearFiltersBtn.addEventListener("click", () => {
    selectedCategories.clear();
    selectedTags.clear();
    selectedYear = "";
    selectedMonth = "";

    filterCategoryElem.querySelectorAll("input").forEach((i) => (i.checked = false));
    filterTagElem.querySelectorAll("input").forEach((i) => (i.checked = false));
    filterYearElem.value = "";
    filterMonthElem.value = "";
    filterMonthElem.disabled = true;

    filterNews();
  });
}

// フィルター適用処理
function filterNews() {
  const filtered = newsData.filter((item) => {
    if (selectedCategories.size > 0 && !selectedCategories.has(item.category))
      return false;
    if (
      selectedTags.size > 0 &&
      !item.tags.some((tag) => selectedTags.has(tag))
    )
      return false;
    if (selectedYear && !item.date.startsWith(selectedYear)) return false;
    if (selectedMonth) {
      const month = item.date.slice(5, 7);
      if (month !== selectedMonth) return false;
    }
    return true;
  });

  renderNewsList(filtered);
}

// 日付フォーマット変換
function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

// 起動
document.addEventListener("DOMContentLoaded", init);
