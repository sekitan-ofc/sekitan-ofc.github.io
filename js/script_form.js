// js/script_form.js
(() => {
  // ここにデプロイ後のGASの公開URLを入れてね（下の手順で取得する）
  const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbz2cmwCxwm5pIaxqB2XGyx7Ic2t8BEcXmafg2slFQwFJ4OjYs200t5TywoEzC-rGZc-og/exec';

  const form = document.getElementById('contactForm');
  const fileInput = document.getElementById('fileUpload');
  const fileListDiv = document.getElementById('fileList');
  const messageArea = document.getElementById('messageArea');
  const loadingArea = document.getElementById('loadingArea');
  const charCountSpan = document.getElementById('charCount');

  // 文字カウント
  const details = document.getElementById('details');
  details.addEventListener('input', () => {
    charCountSpan.textContent = details.value.length;
  });

  // ファイルリスト表示
  fileInput.addEventListener('change', () => {
    fileListDiv.innerHTML = '';
    const files = Array.from(fileInput.files);
    if (files.length === 0) return;
    const ul = document.createElement('ul');
    files.forEach(f => {
      const li = document.createElement('li');
      li.textContent = `${f.name} (${Math.round(f.size/1024)} KB)`;
      ul.appendChild(li);
    });
    fileListDiv.appendChild(ul);
  });

  // Utility: File -> base64 (Promise)
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('ファイル読み込みエラー'));
      reader.onload = () => {
        // reader.result は "data:<mime>;base64,AAAA..." 形式
        const result = reader.result;
        const commaIndex = result.indexOf(',');
        const base64 = result.slice(commaIndex + 1);
        const mime = result.slice(5, commaIndex).split(';')[0]; // after "data:"
        resolve({ name: file.name, size: file.size, mimeType: mime, base64 });
      };
      reader.readAsDataURL(file);
    });
  }

  // 表示メッセージ
  function showMessage(text, isError=false) {
    messageArea.innerHTML = `<p class="${isError ? 'error' : 'success'}">${text}</p>`;
  }

  // 送信処理
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    messageArea.innerHTML = '';
    loadingArea.style.display = 'flex';

    try {
      const formData = new FormData(form);
      const name = formData.get('name') || '';
      const email = formData.get('email') || '';
      const category = formData.get('category') || '';
      const detailsText = formData.get('details') || '';

      // client側で簡易バリデーション
      if (!name || !email || !category || !detailsText) {
        throw new Error('必須項目を入力してください。');
      }

      // ファイルをbase64に変換（複数対応）
      const files = Array.from(fileInput.files || []);
      const MAX_FILES = 5; // 任意：1回の送信で最大ファイル数を制限
      if (files.length > MAX_FILES) throw new Error(`ファイルは最大 ${MAX_FILES} 件までです。`);

      // ファイルサイズ合計チェック（任意）
      const totalSize = files.reduce((s, f) => s + f.size, 0);
      const MAX_TOTAL_BYTES = 50 * 1024 * 1024; // 50MB 総量上限（目安）
      if (totalSize > MAX_TOTAL_BYTES) throw new Error('添付ファイルの合計サイズが大きすぎます（最大50MB推奨）。');

      // convert files
      const filesConverted = [];
      for (const f of files) {
        const obj = await fileToBase64(f);
        filesConverted.push(obj);
      }

      // POST payload
      const payload = {
        name,
        email,
        category,
        details: detailsText,
        files: filesConverted
      };

      // fetch
      const resp = await fetch(GAS_WEBAPP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // レスポンスをJSONで取得（GAS側でJSONを返す）
      if (!resp.ok) {
        const text = await resp.text().catch(()=>null);
        throw new Error('送信に失敗しました。' + (text ? ' サーバー応答: ' + text : ''));
      }
      const resJson = await resp.json();
      if (resJson && resJson.success) {
        showMessage('送信が完了しました。ありがとうございます！');
        form.reset();
        fileListDiv.innerHTML = '';
        charCountSpan.textContent = '0';
      } else {
        throw new Error(resJson && resJson.message ? resJson.message : '送信に失敗しました（不明なエラー）');
      }
    } catch (err) {
      console.error(err);
      showMessage('エラー: ' + (err.message || err), true);
    } finally {
      loadingArea.style.display = 'none';
    }
  });
})();
