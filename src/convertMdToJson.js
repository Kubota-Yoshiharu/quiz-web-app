const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function getWebPageTitle(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
    return titleMatch ? titleMatch[1].trim() : '';
  } catch (error) {
    console.warn(`Failed to fetch title for ${url}:`, error.message);
    return '';
  }
}

async function convertMdToJson() {
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
    const data = await Promise.all(dataLines.map(async line => {
      const values = line.split('|')
        .map(val => val.trim())
        .filter(val => val);
      
      const obj = columns.reduce((acc, col, index) => {
        const value = values[index] || '';
        if (col === '参考URL' && value) {
          acc[col] = value.replace(/^<(.+)>$/, '$1');
        } else {
          acc[col] = value;
        }
        return acc;
      }, {});

      // 参考URLが存在する場合、タイトルを取得
      if (obj['参考URL']) {
        obj['参考URLのタイトル'] = await getWebPageTitle(obj['参考URL']);
      }

      return obj;
    }));
    
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