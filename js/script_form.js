function formSubmitted() {
  // window.formSubmittedFlag が true の場合のみリダイレクトを実行
  if (window.formSubmittedFlag) {
    window.location.href = 'thanks.html'; // サンクスページのURLに変更
  }
}

document.getElementById('google-form').addEventListener('submit', function(event) {
  const honeypot = document.getElementById('honeypot-field').value; // スパム対策
  if (honeypot) {
    event.preventDefault();
    console.log('スパムの疑いがあります');
    alert('不正なアクセスを検知しました');
    return;
  }

  // 送信済みフラグを立てる
  window.formSubmittedFlag = true;

  // 送信ボタンを無効化（連打防止）
  const submitButton = document.querySelector('#google-form input[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.value = '送信中...';
  }
});
