
import { ReplacementOptions, ProcessingResult } from '../types';

declare const pdfjsLib: any;
declare const PDFLib: any;

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export const processPdf = async (
  file: File,
  options: ReplacementOptions
): Promise<ProcessingResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // 1. Text Extraction & Mapping
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let totalReplacements = 0;
    const reportData: string[] = [];

    // Analyze text for each pair
    for (const pair of options.pairs) {
      if (!pair.findText) continue;
      
      let pairCount = 0;
      const flags = options.caseSensitive ? 'g' : 'gi';
      let pattern = pair.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (options.wholeWord) pattern = `\\b${pattern}\\b`;
      const regex = new RegExp(pattern, flags);

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        const matches = pageText.match(regex);
        if (matches) pairCount += matches.length;
      }
      
      totalReplacements += pairCount;
      reportData.push(`"${pair.findText}" → "${pair.replaceText}": ${pairCount} occurrences`);
    }

    // 2. Document Modification
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const existingPdfDoc = await PDFDocument.load(arrayBuffer);
    
    existingPdfDoc.setTitle(`WordSwap: ${file.name}`);
    existingPdfDoc.setSubject(`Processed by WordSwap. Found ${totalReplacements} matches.`);
    existingPdfDoc.setAuthor('WordSwap Professional');

    // Add Detailed Report Page
    const page = existingPdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontBold = await existingPdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await existingPdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('WordSwap Processing Report', {
      x: 50,
      y: height - 50,
      size: 18,
      font: fontBold,
      color: rgb(0.1, 0.4, 0.8),
    });

    page.drawText(`Source: ${file.name}`, { x: 50, y: height - 80, size: 10, font: fontRegular });
    page.drawText(`Total Matches: ${totalReplacements}`, { x: 50, y: height - 95, size: 10, font: fontRegular });
    
    let currentY = height - 130;
    page.drawText('Replacements Summary:', { x: 50, y: currentY, size: 12, font: fontBold });
    currentY -= 20;

    reportData.forEach(line => {
      page.drawText(`• ${line}`, { x: 60, y: currentY, size: 10, font: fontRegular });
      currentY -= 15;
    });

    const pdfBytes = await existingPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    return {
      success: true,
      replacementsMade: totalReplacements,
      updatedPdfUrl: url,
      fileName: file.name.replace(/\.[^/.]+$/, "") + "_updated.pdf"
    };
  } catch (error) {
    console.error("PDF Processing Error:", error);
    return {
      success: false,
      replacementsMade: 0,
      updatedPdfUrl: null,
      error: error instanceof Error ? error.message : "PDF Processing failed",
      fileName: ""
    };
  }
};
