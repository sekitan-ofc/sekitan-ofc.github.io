document.getElementById('contact-form').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target;
  const name    = f.name.value;
  const email   = f.email.value;
  const subject = f.subject.value;
  const message = f.message.value;
  const inputFile = f.file.files[0];

  let fileData = null;
  if (inputFile) {
    const buf = await inputFile.arrayBuffer();
    fileData = {
      name: inputFile.name,
      mime: inputFile.type,
      base64: btoa([...new Uint8Array(buf)].map(c=>String.fromCharCode(c)).join(''))
    };
  }

  const payload = { name, email, subject, message, file: fileData };
  const res = await fetch('https://script.google.com/macros/s/AKfycbxAvrJ-DIUjEHekvPB6wxOM-lIsw0q8k7YKy3az8_6pWYScQT5_lvKG3h-JF-ezMOPZdg/exec', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  });
  const json = await res.json();

  if (json.status==='success') {
    sessionStorage.setItem('lastSubmission', JSON.stringify(json));
    window.location.href = 'confirm.html';
  } else {
    alert('送信エラー：'+json.message);
  }
});
