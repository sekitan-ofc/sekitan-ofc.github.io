document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('file');
  const fileLabel = document.getElementById('file-label'); // file-wrapperが設定されているlabel要素
  const fileNoteSpan = fileLabel.querySelector('.file-note'); // ファイル名を表示するspan要素

  fileInput.addEventListener('change', function() {
    if (this.files && this.files.length > 0) {
      // ファイルが選択された場合
      const fileName = this.files[0].name; // 選択されたファイルの名前を取得
      fileNoteSpan.textContent = fileName; // spanのテキストをファイル名に更新
      fileLabel.classList.add('selected'); // .selected クラスを追加してスタイルを適用
    } else {
      // ファイルが選択されていない場合（キャンセルなど）
      fileNoteSpan.textContent = 'エラー画面の画像など'; // 元のテキストに戻す
      fileLabel.classList.remove('selected'); // .selected クラスを削除
    }
  });
});