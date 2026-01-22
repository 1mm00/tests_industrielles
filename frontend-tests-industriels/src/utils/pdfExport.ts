import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './helpers';



export interface PDFExportOptions {
    title: string;
    filename: string;
    headers: string[];
    body: (string | number)[][];
    orientation?: 'p' | 'l';
}

export const exportToPDF = (options: PDFExportOptions) => {
    const { title, filename, headers, body, orientation = 'p' } = options;

    // Create document
    const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4',
    });

    // Header Color (Primary 600)
    const primaryColor = [37, 99, 235];

    // Add Logo or Brand name
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('TESTS INDUSTRIELS', 14, 20);

    // Sub-header
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175); // gray-400
    doc.setFont('helvetica', 'normal');
    const now = new Date();
    doc.text(`SYSTÈME DE GESTION DE QUALITÉ | GÉNÉRÉ LE ${formatDate(now, 'datetime').toUpperCase()}`, 14, 28);

    // Title
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 14, 42);

    // Line separator
    doc.setDrawColor(229, 231, 235); // gray-200
    doc.setLineWidth(0.5);
    doc.line(14, 46, orientation === 'p' ? 196 : 283, 46);

    // AutoTable
    autoTable(doc, {
        startY: 52,
        head: [headers],
        body: body,
        theme: 'striped',
        headStyles: {
            fillColor: [31, 41, 55], // gray-900
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 4,
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [55, 65, 81], // gray-700
            cellPadding: 3,
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251], // gray-50
        },
        columnStyles: {
            // Center text by default
            0: { halign: 'center' },
        },
        margin: { top: 52, left: 14, right: 14 },
        didDrawPage: (data: any) => {
            // Footer
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            doc.text(
                `Page ${data.pageNumber}`,
                14,
                pageHeight - 10
            );
            doc.text(
                '© 2026 Tests Industriels - Dashboard de Maintenance & Qualité',
                orientation === 'p' ? 196 : 283,
                pageHeight - 10,
                { align: 'right' }
            );
        }
    });

    // Save
    doc.save(`${filename}_${now.getTime()}.pdf`);
};
