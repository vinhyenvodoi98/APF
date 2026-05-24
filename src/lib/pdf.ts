import jsPDF from 'jspdf';
import type Konva from 'konva';

export function exportToPdf(stage: Konva.Stage): void {
  const dataUrl = stage.toDataURL({ pixelRatio: 3 }); // ~300 dpi for A4
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
  pdf.save('comic-page.pdf');
}
