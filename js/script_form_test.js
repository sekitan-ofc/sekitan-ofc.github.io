(() => {
  const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzjCd60UXj_3Ps1u6W9brC1M_f327mZq3Hr8ZP6wpg0dPWqAZV34jHZgKoQVXJpmGRHhA/exec';

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

  // File -> base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('ファイル読み込みエラー'));
      reader.onload = () => {
        const result = reader.result;
        const commaIndex = result.indexOf(',');
        const base64 = result.slice(commaIndex + 1);
        const mime = result.slice(5, commaIndex).split(';')[0];
        resolve({ name: file.name, size: file.size, mimeType: mime, base64 });
      };
      reader.readAsDataURL(file);
    });
  }

  // メッセージ表示
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

      if (!name || !email || !category || !detailsText) {
        throw new Error('必須項目を入力してください。');
      }

      const files = Array.from(fileInput.files || []);
      const MAX_FILES = 5;
      if (files.length > MAX_FILES) throw new Error(`ファイルは最大 ${MAX_FILES} 件までです。`);

      const totalSize = files.reduce((s, f) => s + f.size, 0);
      const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
      if (totalSize > MAX_TOTAL_BYTES) throw new Error('添付ファイルの合計サイズが大きすぎます。');

      const filesConverted = [];
      for (const f of files) {
        const obj = await fileToBase64(f);
        filesConverted.push(obj);
      }

      const payload = { name, email, category, details: detailsText, files: filesConverted };

      // fetch で no-cors を指定（ブラウザで CORS を回避）
      await fetch(GAS_WEBAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors' // ← ここが重要
      });

      showMessage('送信完了！ブラウザ上ではレスポンスは取得できませんが、GASには届いています。');
      form.reset();
      fileListDiv.innerHTML = '';
      charCountSpan.textContent = '0';

    } catch (err) {
      console.error(err);
      showMessage('エラー: ' + (err.message || err), true);
    } finally {
      loadingArea.style.display = 'none';
    }
  });
})();
