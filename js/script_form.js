(() => {
  const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxoOLqvTzSOaguDLJyY3zx8XWf6VyA7W6swOq_gapzNUFn2Nw8k96k3sKKcI65RKtagIg/exec';
  const form = document.getElementById('contactForm');
  const fileInput = document.getElementById('fileUpload');
  const fileListDiv = document.getElementById('fileList');
  const messageArea = document.getElementById('messageArea');
  const loadingArea = document.getElementById('loadingArea');
  const charCountSpan = document.getElementById('charCount');
  const details = document.getElementById('details');
  const submitButton = document.getElementById('submitButton');

  // 初期状態は非表示
  loadingArea.style.display = 'none';

  // 文字数カウント
  details.addEventListener('input', () => {
    charCountSpan.textContent = details.value.length;
  });

  // ファイルリスト表示
  fileInput.addEventListener('change', () => {
    fileListDiv.innerHTML = '';
    const files = Array.from(fileInput.files);
    if (!files.length) return;
    const ul = document.createElement('ul');
    files.forEach(f => {
      const li = document.createElement('li');
      li.textContent = `${f.name} (${Math.round(f.size/1024)} KB)`;
      ul.appendChild(li);
    });
    fileListDiv.appendChild(ul);
  });

  function showMessage(text, isError=false) {
    messageArea.innerHTML = `<p class="${isError ? 'error' : 'success'}">${text}</p>`;
  }

  // 送信処理
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    messageArea.innerHTML = '';
    loadingArea.style.display = 'flex';
    submitButton.disabled = true;

    try {
      const formData = new FormData(form);

      // ファイル送信は無効化している場合は不要
      const resp = await fetch(GAS_WEBAPP_URL, {
        method: 'POST',
        body: formData
      });

      if (!resp.ok) throw new Error('サーバーエラー: ' + resp.status);
      const resJson = await resp.json();

      if (resJson.success) {
        showMessage(`送信が完了しました。お問い合わせID: ${resJson.inquiryId}`);
        form.reset();
        fileListDiv.innerHTML = '';
        charCountSpan.textContent = '0';
      } else {
        throw new Error(resJson.message || '送信失敗（不明なエラー）');
      }
    } catch (err) {
      console.error(err);
      showMessage('エラー: ' + err.message, true);
    } finally {
      loadingArea.style.display = 'none';
      submitButton.disabled = false;
    }
  });
})();
