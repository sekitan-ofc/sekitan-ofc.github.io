document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("google-form");
  const messageBox = document.getElementById("form-message");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // 通常送信をキャンセル

    // honeypot チェック
    if (form.querySelector("#honeypot-field").value) {
      return; // ボット判定
    }

    const formData = new FormData(form);

    fetch("https://docs.google.com/forms/d/e/1FAIpQLSc90iFTa9CdCGsUAMJP-WrwnpQ3T-paPqLRaKu_53Lq6cVJcA/formResponse", {
      method: "POST",
      body: formData,
      mode: "no-cors", // Googleフォームは必須
    })
      .then(() => {
        messageBox.innerHTML = "<p>送信ありがとうございました。</p>";
        form.reset();
      })
      .catch((error) => {
        messageBox.innerHTML = "<p>送信に失敗しました。時間をおいて再度お試しください。</p>";
        console.error(error);
      });
  });
});
