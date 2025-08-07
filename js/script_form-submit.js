// js/script_form-submit.js
// フォーム送信処理とバリデーション

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const submitBtn = form.querySelector('button[type="submit"]');
  const endpoint = 'https://script.google.com/macros/s/AKfycbx03hvDNPmmLOJaJZBIw5vOc1G8oYgwynpfJL58oN_Z4m-8AIvn92sbsaWCo3eIMKdpOQ/exec';

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // バリデーション
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value;
    const message = form.message.value.trim();
    const confirmChecked = form.confirm.checked;
    const privacyChecked = form.privacy.checked;

    if (!name) {
      alert('お名前を入力してください。');
      form.name.focus();
      return;
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      alert('有効なメールアドレスを入力してください。');
      form.email.focus();
      return;
    }
    if (!subject) {
      alert('お問い合わせ内容を選択してください。');
      form.subject.focus();
      return;
    }
    if (!message) {
      alert('詳細を入力してください。');
      form.message.focus();
      return;
    }
    if (!confirmChecked) {
      alert('「入力内容に誤りがないことを確認しました」をチェックしてください。');
      return;
    }
    if (!privacyChecked) {
      alert('プライバシーポリシーへの同意が必要です。');
      return;
    }

    // 2重送信防止
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    try {
      // ファイル添付の base64 変換
      const files = Array.from(form.file.files);
      const fileDataList = [];
      for (let file of files) {
        const reader = new FileReader();
        const data = await new Promise(resolve => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(file);
        });
        fileDataList.push({ name: file.name, mimeType: file.type, data });
      }

      // 送信データ作成
      const payload = { name, email, subject, message, files: fileDataList };

      // fetch 送信
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.result === 'success') {
        // 確認ページへリダイレクト
        const params = new URLSearchParams({
          id: result.id,
          name,
          email
        });
        window.location.href = `form-confirm.html?${params.toString()}`;
      } else {
        alert('送信に失敗しました: ' + (result.message || '原因不明'));
      }
    } catch (err) {
      console.error(err);
      alert('送信中にエラーが発生しました。');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '送信';
    }
  });
});
