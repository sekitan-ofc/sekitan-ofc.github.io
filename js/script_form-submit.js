document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#form form');
  const fileInput = document.getElementById('file');
  const fileWrapper = document.getElementById('file-label');
  const fileNote = fileWrapper.querySelector('.file-note');

  // ファイル選択処理（UI更新）
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      fileWrapper.classList.add('selected');
      fileNote.textContent = fileInput.files[0].name;
    } else {
      fileWrapper.classList.remove('selected');
      fileNote.textContent = 'エラー画面の画像など';
    }
  });

  // フォーム送信処理
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const endpoint = 'https://script.google.com/macros/s/AKfycbyG31t-aS9Viz593s0f5aLp7V8LDlcJB-3cBvg7VfvNomJ2J-xh7lgC23KSiVH9FrjUQg/exec';

    const formData = new FormData(form);

    try {
      // ボタン無効化など（送信中UI）
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = '送信中...';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.status === 'success') {
        // 成功時：確認画面へリダイレクト（ID付き）
        const query = new URLSearchParams({
          id: result.id,
          name: formData.get('name'),
          subject: formData.get('subject'),
          email: formData.get('email'),
        });
        window.location.href = `confirm.html?${query.toString()}`;
      } else {
        alert('送信に失敗しました。しばらくしてからもう一度お試しください。');
        console.error(result);
      }
    } catch (error) {
      console.error('送信エラー:', error);
      alert('送信中にエラーが発生しました。');
    } finally {
      // ボタン再有効化
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = '送信';
    }
  });
});
