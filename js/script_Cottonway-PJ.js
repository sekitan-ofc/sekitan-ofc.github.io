document.addEventListener('DOMContentLoaded', () => {
    // --- 汎用ニュース表示関数 ---
    // API URL
    const apiUrl = 'https://script.google.com/macros/s/AKfycbwoMvXkxIb0jmZRwnB_OR6pqe3062ZTv8596akKmDdj9eh3YJ7F0RoB1Y4kuzxWnn4b/exec';

    // ニュースを取得して表示する関数
    // targetElement: ニュースを表示するDOM要素
    // categoryFilter: フィルタリングしたいカテゴリ名 (nullの場合は全カテゴリ)
    // limit: 表示する記事数の上限 (nullの場合は全て表示)
    function fetchAndDisplayNews(targetElement, categoryFilter = null, limit = null) {
        targetElement.innerHTML = '<p class="loading">お知らせを読み込み中です...</p>';
        const now = new Date(); // 現在時刻（JST）

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                let filtered = data
                    .filter(item => {
                        // 日付と時刻が両方存在する場合のみ未来日時チェック
                        if (item["日付"] && item["時刻"]) {
                            const pubDate = toDateTimeJST(item["日付"], item["時刻"]);
                            return pubDate <= now; // 未来日時の記事を除外
                        }
                        return true; // 日付か時刻が欠けている場合は表示対象とする
                    })
                    .sort((a, b) => {
                        const aDate = toDateTimeJST(a["日付"], a["時刻"]);
                        const bDate = toDateTimeJST(b["日付"], b["時刻"]); // 修正済
                        return bDate - aDate; // 降順ソート
                    });

                // カテゴリでフィルタリング
                if (categoryFilter) {
                    filtered = filtered.filter(item => item["カテゴリ"] === categoryFilter);
                }

                // 記事数で制限
                if (limit !== null) {
                    filtered = filtered.slice(0, limit);
                }

                targetElement.innerHTML = ''; // ロードメッセージをクリア

                // 記事がない場合
                if (filtered.length === 0) {
                    const noNews = document.createElement('p');
                    noNews.textContent = '現在、BVE真岡線に関するお知らせはありません。';
                    targetElement.appendChild(noNews);
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
                    targetElement.appendChild(a);
                });
            })
            .catch(error => {
                targetElement.innerHTML = '<p>お知らせを取得できませんでした。</p>';
                console.error('ニュース取得エラー:', error);
            });
    }

    // 日付＋時刻文字列を JS Date に変換 (JSTを考慮)
    function toDateTimeJST(dateStr, timeStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        const [hh, mm] = timeStr.split(':').map(Number);
        const date = new Date(Date.UTC(y, m - 1, d, hh, mm));
        return date;
    }

    // yyyy-mm-dd を yyyy.mm.dd に整形
    function formatDate(dateStr) {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr; // 無効な日付の場合は元の文字列を返す
        const y = d.getFullYear();
        const M = String(d.getMonth() + 1).padStart(2, '0');
        const D = String(d.getDate()).padStart(2, '0');
        return `${y}.${M}.${D}`;
    }

    // --- ここまで汎用ニュース表示関数 ---


    // BVE真岡線Projectページ用のニュース表示を実行
    const bveNewsFeed = document.getElementById('news-feed');
    if (bveNewsFeed) {
        fetchAndDisplayNews(bveNewsFeed, 'BVE真岡線', 3); // 'BVE真岡線'カテゴリの最新3件を表示
    }


    // スムーズスクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // ナビゲーションバーの高さのみを考慮してスクロール位置を調整
                const navOffset = document.querySelector('.site-nav').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - navOffset - 20; // 20pxは微調整の余白

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Q&Aアコーディオン
    const qaAccordionHeaders = document.querySelectorAll('#qa .accordion-header');

    qaAccordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionContent = header.nextElementSibling;

            // 他のアコーディオンを閉じる
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

    // 工区説明のアコーディオン
    const segmentAccordionHeaders = document.querySelectorAll('.accordion-segment .accordion-header');

    segmentAccordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionContent = header.nextElementSibling;

            // 他の工区アコーディオンを閉じる
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
                accordionContent.style.paddingBottom = '15px';
            } else {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
                accordionContent.style.paddingBottom = '15px';
            }
        });
    });

    // 路線図上の工区をクリックでアコーディオンを開く機能
    const mapSegments = document.querySelectorAll('.map-overlay .segment');

    mapSegments.forEach(segment => {
        segment.addEventListener('click', () => {
            const targetSegmentId = segment.dataset.segment;
            const targetAccordionHeader = document.querySelector(`.accordion-segment .accordion-header[data-segment-target="${targetSegmentId}"]`);

            if (targetAccordionHeader) {
                // クリックされた工区のアコーディオンが開いていない場合のみ開く
                if (!targetAccordionHeader.classList.contains('active')) {
                    targetAccordionHeader.click(); // アコーディオンのクリックイベントを発火
                }
                // スムーズスクロールで該当箇所までスクロール
                targetAccordionHeader.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center' // 画面中央に表示されるように
                });
            }
        });
    });

    // スクロール時のヘッダー上部表示/非表示制御は不要になったため削除
});