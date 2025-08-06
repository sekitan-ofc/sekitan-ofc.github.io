document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const files = form.file.files;

  const fileDataList = [];

  // ファイルをbase64に変換
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();

    const fileData = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result.split(',')[1]); // base64部分のみ
      reader.readAsDataURL(file);
    });

    fileDataList.push({
      name: file.name,
      mimeType: file.type,
      data: fileData
    });
  }

  const jsonData = {
    name: form.name.value,
    email: form.email.value,
    subject: form.subject.value,
    message: form.message.value,
    files: fileDataList
  };

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxWkJs6hPU5PockeehLDrFmkb19P4BQDumUUgB7-dOLT291-mUidub_FFD-pCPuGAZJgA/exec", {
      method: "POST",
      body: JSON.stringify(jsonData),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();
    if (result.result === "success") {
      alert("送信が完了しました！");
      form.reset();
    } else {
      alert("送信失敗: " + result.message);
    }
  } catch (err) {
    console.error("送信エラー:", err);
    alert("送信中にエラーが発生しました。");
  }
});
