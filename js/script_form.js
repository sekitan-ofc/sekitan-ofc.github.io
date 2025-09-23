function formSubmitted() {
  // submit イベント後の onload で呼ばれる
  if (window.formSubmittedFlag) {
    window.location.href = "thanks.html"; // ← サンクスページへリダイレクト
  }
}

document.getElementById("google-form").addEventListener("submit", function (e) {
  // 送信ボタン無効化（連打防止）
  const submitButton = this.querySelector('input[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.value = "送信中...";
  }

  // 0.5秒後に強制的に thanks ページへ遷移
  // （Googleフォーム側の処理は iframe 内で非表示で進む）
  setTimeout(() => {
    window.location.href = "Thanks.html";
  }, 500);
});


// 文字数カウンター
const messageField = document.getElementById("message");
const charCounter = document.getElementById("charCounter");
const submitButton = document.querySelector('#google-form input[type="submit"]');

function checkMessageValidity() {
  const len = messageField.value.length;
  charCounter.textContent = `${len} / 2000`;

  if (len < 20 || len > 2000) {
    charCounter.style.color = "red";
    submitButton.disabled = true; // 送信不可
  } else {
    charCounter.style.color = "green";
    submitButton.disabled = false; // 送信可
  }
}

// 初期チェック
checkMessageValidity();

// 入力中にチェック
messageField.addEventListener("input", checkMessageValidity);
