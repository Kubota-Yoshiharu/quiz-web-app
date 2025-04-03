const fs = require('fs');
const path = require('path');

function convertMdToJson() {
  try {
    // Word.mdを読み込む
    const mdContent = fs.readFileSync(path.join(__dirname, '..', 'Word.md'), 'utf8');
    
    // ヘッダー行とデータ行に分割
    const lines = mdContent.split('\n').filter(line => line.trim() && !line.startsWith('//'));
    const [header, ...dataLines] = lines;
    
    // ヘッダーの列名を取得
    const columns = header.split('|')
      .map(col => col.trim())
      .filter(col => col);
    
    // データ行をオブジェクトに変換
    const data = dataLines.map(line => {
      const values = line.split('|')
        .map(val => val.trim())
        .filter(val => val);
      
      return columns.reduce((obj, col, index) => {
        const value = values[index] || '';  // 値が存在しない場合は空文字列を使用
        // 参考URLの場合は < > を取り除く
        if (col === '参考URL' && value) {
          obj[col] = value.replace(/^<(.+)>$/, '$1');
        } else {
          obj[col] = value;
        }
        return obj;
      }, {});
    });
    
    // JSONとして出力
    fs.writeFileSync(
      path.join(__dirname, 'Word.json'),
      JSON.stringify(data, null, 2),
      'utf8'
    );
    
    console.log('Successfully converted [Word.md](http://_vscodecontentref_/1) to Word.json');
  } catch (error) {
    console.error('Error converting MD to JSON:', error);
    process.exit(1);
  }
}

convertMdToJson();