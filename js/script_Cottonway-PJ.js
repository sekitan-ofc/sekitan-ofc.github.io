document.addEventListener('DOMContentLoaded', () => {
    // スムーズスクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Q&Aアコーディオン
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionContent = header.nextElementSibling;

            // 他のアコーディオンを閉じる（任意）
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header && otherHeader.classList.contains('active')) {
                    otherHeader.classList.remove('active');
                    otherHeader.nextElementSibling.style.maxHeight = null;
                    otherHeader.nextElementSibling.style.paddingBottom = '0';
                }
            });

            header.classList.toggle('active');
            if (accordionContent.style.maxHeight) {
                accordionContent.style.maxHeight = null;
                accordionContent.style.paddingBottom = '0';
            } else {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
                accordionContent.style.paddingBottom = '20px'; // コンテンツのpaddingに合わせて調整
            }
        });
    });

    // 今後、画像スライダーやNewsフィードの動的読み込みなどの機能を追加できます。
});

document.addEventListener('DOMContentLoaded', () => {
    // --- 汎用ニュース表示関数（news.jsからコピーしてくるか、モジュール化してインポートする） ---
    // ここでは、シンプルにするため news.js の関数をそのままコピーします。
    // 理想的には、共通のJavaScriptファイルとして管理し、両ページでインポートする形が望ましいです。

    const apiUrl = 'https://script.google.com/macros/s/AKfycbwoMvXkxIb0jmZRwnB_OR6pqe3062ZTv8596akKmDdj9eh3YJ7F0RoB1Y4kuzxWnn4b/exec';

    function fetchAndDisplayNews(targetElement, categoryFilter = null, limit = null) {
        targetElement.innerHTML = '<p class="loading">読み込み中です...</p>';
        const now = new Date();

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                let filtered = data
                    .filter(item => {
                        if (!item["日付"] || !item["時刻"]) return true;
                        const pubDate = toDateTimeJST(item["日付"], item["時刻"]);
                        return pubDate <= now;
                    })
                    .sort((a, b) => {
                        const aDate = toDateTimeJST(a["日付"], a["時刻"]);
                        const bDate = toDateTimeJST(b["日付"], b["時刻"]);
                        return bDate - aDate;
                    });

                if (categoryFilter) {
                    filtered = filtered.filter(item => item["カテゴリ"] === categoryFilter);
                }

                if (limit !== null) {
                    filtered = filtered.slice(0, limit);
                }

                targetElement.innerHTML = ''; // ロードメッセージをクリア

                if (filtered.length === 0) {
                    const noNews = document.createElement('p');
                    noNews.textContent = '現在、BVE真岡線に関するお知らせはありません。';
                    targetElement.appendChild(noNews);
                    return;
                }

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
                    targetElement.appendChild(a);
                });
            })
            .catch(error => {
                targetElement.innerHTML = '<p>お知らせを取得できませんでした。</p>';
                console.error('取得エラー:', error);
            });
    }

    function toDateTimeJST(dateStr, timeStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        const [hh, mm] = timeStr.split(':').map(Number);
        const date = new Date(y, m - 1, d, hh, mm);
        return new Date(Date.UTC(y, m - 1, d, hh, mm - (date.getTimezoneOffset() + 540)));
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        const y = d.getFullYear();
        const M = String(d.getMonth() + 1).padStart(2, '0');
        const D = String(d.getDate()).padStart(2, '0');
        return `${y}.${M}.${D}`;
    }

    // --- ここまで汎用ニュース表示関数 ---

    // BVE真岡線Projectページ用のニュース表示
    const bveNewsFeed = document.getElementById('news-feed');
    if (bveNewsFeed) {
        fetchAndDisplayNews(bveNewsFeed, 'BVE真岡線', 3); // 'BVE真岡線'カテゴリの記事を最大3件表示 (PJページなので少なめに)
    }


    // スムーズスクロール (既存)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Q&Aアコーディオン (既存)
    const qaAccordionHeaders = document.querySelectorAll('#qa .accordion-header');
    qaAccordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionContent = header.nextElementSibling;
            qaAccordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header && otherHeader.classList.contains('active')) {
                    otherHeader.classList.remove('active');
                    otherHeader.nextElementSibling.style.maxHeight = null;
                    otherHeader.nextElementSibling.style.paddingBottom = '0';
                }
            });
            header.classList.toggle('active');
            if (accordionContent.style.maxHeight) {
                accordionContent.style.maxHeight = null;
                accordionContent.style.paddingBottom = '0';
            } else {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
                accordionContent.style.paddingBottom = '20px';
            }
        });
    });

    // 工区説明のアコーディオン (既存)
    const segmentAccordionHeaders = document.querySelectorAll('.accordion-segment .accordion-header');
    segmentAccordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionContent = header.nextElementSibling;
            segmentAccordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header && otherHeader.classList.contains('active')) {
                    otherHeader.classList.remove('active');
                    otherHeader.nextElementSibling.style.maxHeight = null;
                    otherHeader.nextElementSibling.style.paddingBottom = '0';
                }
            });
            header.classList.toggle('active');
            if (accordionContent.style.maxHeight) {
                accordionContent.style.maxHeight = null;
                accordionContent.style.paddingBottom = '0';
            } else {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
                accordionContent.style.paddingBottom = '15px';
            }
        });
    });

    // (オプション) 路線図上の工区をクリックでアコーディオンを開く機能 (既存)
    const mapSegments = document.querySelectorAll('.map-overlay .segment');
    mapSegments.forEach(segment => {
        segment.addEventListener('click', () => {
            const targetSegmentId = segment.dataset.segment;
            const targetAccordionHeader = document.querySelector(`.accordion-segment .accordion-header[data-segment-target="${targetSegmentId}"]`);

            if (targetAccordionHeader) {
                if (!targetAccordionHeader.classList.contains('active')) {
                    targetAccordionHeader.click();
                }
                targetAccordionHeader.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    });
});