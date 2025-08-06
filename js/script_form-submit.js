document.querySelector('form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const fileInput = form.querySelector('input[type="file"]');
  const file = fileInput.files[0];

  let base64 = '';
  let fileName = '';
  let mimeType = '';

  if (file) {
    fileName = file.name;
    mimeType = file.type;

    const reader = new FileReader();
    base64 = await new Promise((resolve) => {
      reader.onload = () => {
        const result = reader.result.split(',')[1];
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

  const res = await fetch('https://script.google.com/macros/s/AKfycbzF323MTvk18h9mPa9NHQD3jSI0615jAEiSAmUixttEO8IVOaUBwb-U5VdiLRCjKqkS8w/exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });

  const result = await res.json();
  console.log(result);
  if (result.result === 'success') {
    alert('送信完了しました。ID: ' + result.id);
    form.reset();
  } else {
    alert('送信エラー: ' + result.message);
  }
});
