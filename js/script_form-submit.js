document.querySelector('form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const fileInput = form.querySelector('input[type="file"]');
  const file = fileInput.files[0];

  // ファイルがある場合はbase64に変換
  let base64 = '';
  let fileName = '';
  let mimeType = '';

  if (file) {
    fileName = file.name;
    mimeType = file.type;

    const reader = new FileReader();
    base64 = await new Promise((resolve) => {
      reader.onload = () => {
        const result = reader.result.split(',')[1]; // base64部のみ
        resolve(result);
      };
      reader.readAsDataURL(file);
    });
  }

  const formData = {
    name: form.name.value,
    email: form.email.value,
    subject: form.subject.value,
    message: form.message.value,
    fileName: fileName,
    mimeType: mimeType,
    fileData: base64
  };

  const res = await fetch('https://script.google.com/macros/s/AKfycbzLnbitx89D4SzLQj1GmyeGxGDZPRHbOxOL_uCcKhVAm38WZyGtjEVhI9hfymlZAV_Ggw/exec', {
    method: 'POST',
    body: JSON.stringify(formData),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const result = await res.json();
  console.log(result);
});
