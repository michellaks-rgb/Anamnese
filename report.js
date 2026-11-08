async function buildAnamnesisPdf(reportSections, date) {
  const {PDFDocument, StandardFonts, rgb} = PDFLib;
  const pdf = await PDFDocument.create();
  pdf.setTitle('Mon histoire · Synthèse d’anamnèse');
  pdf.setAuthor('Ombaliz Thérapie');
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const logoResponse = await fetch('logo-rapport.png');
  const logo = await pdf.embedPng(await logoResponse.arrayBuffer());
  const ink = rgb(.12,.28,.30);
  const wine = rgb(.49,.20,.29);
  const muted = rgb(.34,.40,.40);
  const cream = rgb(.97,.96,.93);
  const supported = new Set(regular.getCharacterSet());
  const left = 48, width = 499;
  let page, y;

  function wrap(value, font, size) {
    const clean = Array.from(String(value).normalize('NFC'), char =>
      char === '\n' || supported.has(char.codePointAt(0)) ? char : '□'
    ).join('').replaceAll('□','?');
    return clean.split('\n').flatMap(paragraph => {
      const lines = [];
      let line = '';
      for (const word of paragraph.trim().split(/\s+/)) {
        const next = line ? line+' '+word : word;
        if (font.widthOfTextAtSize(next,size) <= width-28) {
          line = next;
          continue;
        }
        if (line) lines.push(line);
        line = '';
        for (const char of word) {
          if (font.widthOfTextAtSize(line+char,size) > width-28) {
            lines.push(line);
            line = '';
          }
          line += char;
        }
      }
      return [...lines,line];
    });
  }

  function draw(text, x, baseline, font, size, color) {
    page.drawText(text,{x,y:baseline,font,size,color});
  }

  function newPage(first = false) {
    page = pdf.addPage([595.28,841.89]);
    page.drawRectangle({x:0,y:833,width:595.28,height:9,color:ink});
    if (first) {
      page.drawRectangle({x:left,y:684,width,height:105,color:cream});
      page.drawImage(logo,{x:left+12,y:697,width:126,height:78});
      draw('SYNTHÈSE D’ANAMNÈSE',left+157,762,bold,9,wine);
      draw('Mon histoire',left+157,728,serif,31,ink);
      draw('Document personnel et confidentiel',left+157,706,regular,10,muted);
      draw('Complété le '+date,left,663,bold,10,ink);
      draw('À relire avec votre psychologue. Les repères ne constituent pas un diagnostic.',left,645,regular,10,muted);
      y = 616;
    } else {
      draw('OMBALIZ THÉRAPIE  /  MON HISTOIRE',left,790,bold,10,ink);
      y = 766;
    }
  }

  function sectionHeading(title, index, continued = false) {
    page.drawRectangle({x:left,y:y-26,width,height:26,color:cream});
    draw(String(index+1).padStart(2,'0'),left+12,y-17,bold,10,wine);
    draw(title+(continued?' (suite)':''),left+37,y-17,bold,12,ink);
    y -= 46;
  }

  newPage(true);
  reportSections.forEach(({title,fields},index) => {
    if (y < 140) newPage();
    sectionHeading(title,index);
    for (const {label,value} of fields) {
      const labels = wrap(label,bold,10);
      const lines = wrap(value,regular,11);
      if (y-labels.length*14 < 78) {
        newPage();
        sectionHeading(title,index,true);
      }
      for (const line of labels) {
        draw(line,left+12,y,bold,10,ink);
        y -= 14;
      }
      for (const line of lines) {
        if (y < 62) {
          newPage();
          sectionHeading(title,index,true);
        }
        draw(line,left+12,y,regular,11,value==='Non renseigné'?muted:ink);
        y -= 15;
      }
      y -= 12;
    }
    y -= 8;
  });

  const pages = pdf.getPages();
  pages.forEach((item,index) => {
    page = item;
    page.drawLine({start:{x:left,y:45},end:{x:left+width,y:45},thickness:.6,color:muted});
    draw('OMBALIZ THÉRAPIE  ·  DOCUMENT CONFIDENTIEL',left,29,bold,8,muted);
    const count = (index+1)+' / '+pages.length;
    draw(count,left+width-regular.widthOfTextAtSize(count,9),29,regular,9,muted);
  });
  return pdf.save();
}
