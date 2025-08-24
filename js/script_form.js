document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const fileInput = document.getElementById('fileUpload');
  const fileList = document.getElementById('fileList');
  const resultMessage = document.createElement('div'); // 送信結果表示用
  form.parentNode.insertBefore(resultMessage, form.nextSibling);

  // ファイル選択時にファイル名を表示
  fileInput.addEventListener('change', () => {
    fileList.innerHTML = '';
    const files = Array.from(fileInput.files);
    if (files.length === 0) return;
    const ul = document.createElement('ul');
    files.forEach(file => {
      const li = document.createElement('li');
      li.textContent = file.name;
      ul.appendChild(li);
    });
    fileList.appendChild(ul);
  });

  // フォーム送信
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxCx8DHRl0WqFytvihevkOHzbvCcDyeBSAESxjm4FVd3ogG-MzJpXV3U3AV2N4gZezPHA/exec', { // ← GASデプロイURL
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('送信に失敗しました');

      const result = await response.text();
      resultMessage.innerHTML = result;

      // フォームリセット
      form.reset();
      fileList.innerHTML = '';
    } catch (error) {
      console.error(error);
      resultMessage.innerHTML = `<p style="color:red">エラー: ${error.message}</p>`;
    }
  });
});
