const fs = require('fs');

async function extractText() {
  const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
  
  const data = new Uint8Array(fs.readFileSync('./quran data.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += strings.join(' ') + '\n\n--- PAGE ' + i + ' ---\n\n';
  }
  
  fs.writeFileSync('./quran-text.txt', fullText);
  console.log('Pages:', doc.numPages);
  console.log('Text length:', fullText.length);
  console.log('\n=== FIRST 3000 chars ===');
  console.log(fullText.substring(0, 3000));
  console.log('\n=== chars 15000-18000 ===');
  console.log(fullText.substring(15000, 18000));
  console.log('\n=== chars 30000-33000 ===');
  console.log(fullText.substring(30000, 33000));
}

extractText().catch(console.error);
