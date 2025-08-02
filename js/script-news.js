document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".tag-buttons button");
  const newsItems = document.querySelectorAll(".news-item");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter");

      newsItems.forEach(item => {
        const tagAttr = item.getAttribute("data-tags");
        const tags = tagAttr ? tagAttr.split(/[\s,、/]+/) : [];

        const shouldShow =
          filter === "all" || tags.includes(filter);

        item.style.display = shouldShow ? "block" : "none";
      });
    });
  });
});
