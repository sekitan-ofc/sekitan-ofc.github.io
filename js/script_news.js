// ニュース記事のタグによる絞り込み処理
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.tag-buttons button');
  const newsItems = document.querySelectorAll('.news-item');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // activeクラス切り替え
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.getAttribute('data-filter');

      newsItems.forEach(item => {
        if (filter === 'all') {
          item.style.display = '';
        } else {
          const tags = item.getAttribute('data-tags').split(' ');
          if (tags.includes(filter)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        }
      });
    });
  });
});
