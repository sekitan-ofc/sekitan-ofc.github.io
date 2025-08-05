document.querySelector('form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const fileInput = form.querySelector('input[type="file"]');

  // FormDataオブジェクトを作成
  const formData = new FormData();
  formData.append('name', form.name.value);
  formData.append('email', form.email.value);
  formData.append('subject', form.subject.value);
  formData.append('message', form.message.value);

  // ファイルがある場合のみFormDataに追加
  if (fileInput.files.length > 0) {
    for (let i = 0; i < fileInput.files.length; i++) {
      formData.append('file', fileInput.files[i]); // 複数ファイルに対応
    }
  }

  try {
    const res = await fetch('https://script.google.com/macros/s/AKfycbxk9ZFuikQ48Nk4APPbkIYFPgRYXMVXpwnG6Wfi1lOlTPrKDsalqQdKbWimXaZgs-frMg/exec', {
      method: 'POST',
      body: formData // FormDataオブジェクトを直接bodyに指定
      // Content-TypeヘッダーはFormDataを使用する場合、自動的に設定されるため不要
    });

    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    console.log(result);

    // 成功時の処理（例: フォームのリセット、成功メッセージの表示）
    alert('お問い合わせを送信しました。');
    form.reset(); // フォームをリセット

  } catch (error) {
    console.error('送信エラー:', error);
    alert('お問い合わせの送信中にエラーが発生しました。時間をおいて再度お試しください。');
  }
});