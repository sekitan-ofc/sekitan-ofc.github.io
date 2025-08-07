// js/script_form.js
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file');
  const note      = document.querySelector('.file-note');

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length === 0) {
      note.textContent = 'エラー画面の画像など';
    } else {
      // 複数ファイル名を改行リストで表示
      const names = Array.from(fileInput.files).map(f => f.name);
      note.textContent = names.join('\n');
      // ボックスを「selected」クラスに切り替え
      fileInput.closest('.file-wrapper').classList.add('selected');
    }
  });
});
