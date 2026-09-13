const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const dir = 'cikmis_sorular';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

async function extract() {
  let output = '';
  for (const file of files) {
    const dataBuffer = fs.readFileSync(path.join(dir, file));
    try {
      const data = await pdf(dataBuffer);
      output += `\n\n=== ${file} ===\n\n`;
      output += data.text;
    } catch (e) {
      console.error('Error on', file, e);
    }
  }
  fs.writeFileSync('extracted_topics.txt', output);
  console.log('Done!');
}
extract();
