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

/**
 * Exporte un rapport détaillé d'un test industriel spécifique avec traçabilité complète
 */
export const exportTestReportPDF = (data: any) => {
    const {
        numero_test,
        type_test,
        equipement,
        date_test,
        resultat_global,
        taux_conformite_pct,
        mesures = [],
        instruments = [],
        responsable,
        observations_generales
    } = data;

    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });

    const primaryColor: [number, number, number] = [31, 41, 55]; // gray-900
    const successColor: [number, number, number] = [16, 185, 129]; // emerald-500
    const errorColor: [number, number, number] = [239, 68, 68]; // rose-500

    // --- ENTÊTE ---
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TESTS INDUSTRIELS', 15, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('LOGICIEL DE GESTION DE QUALITÉ & MAINTENANCE', 15, 25);
    doc.text(`GÉNÉRÉ LE ${formatDate(new Date(), 'datetime').toUpperCase()}`, 135, 25);

    // --- TITRE DU RAPPORT ---
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`RAPPORT DE TEST : ${numero_test}`, 15, 50);

    // --- SECTION 1 : INFORMATIONS GÉNÉRALES ---
    doc.setDrawColor(229, 231, 235);
    doc.line(15, 54, 195, 54);

    doc.setFontSize(10);
    doc.text('INFORMATIONS GÉNÉRALES', 15, 62);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Type de Test :', 15, 70);
    doc.setFont('helvetica', 'bold');
    doc.text(type_test?.nom || 'N/A', 45, 70);

    doc.setFont('helvetica', 'normal');
    doc.text('Date du Test :', 15, 76);
    doc.setFont('helvetica', 'bold');
    doc.text(formatDate(date_test), 45, 76);

    doc.setFont('helvetica', 'normal');
    doc.text('Équipement :', 105, 70);
    doc.setFont('helvetica', 'bold');
    doc.text(`${equipement?.nom || 'N/A'} (${equipement?.id_equipement || ''})`, 135, 70);

    doc.setFont('helvetica', 'normal');
    doc.text('Localisation :', 105, 76);
    doc.setFont('helvetica', 'bold');
    doc.text(equipement?.localisation || 'Zone de Test', 135, 76);

    // --- SECTION 2 : TRAÇABILITÉ INSTRUMENTS ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('INSTRUMENTATION UTILISÉE', 15, 90);

    autoTable(doc, {
        startY: 94,
        head: [['Instrument', 'Modèle', 'N° Série', 'Dernière Calibration']],
        body: instruments.map((inst: any) => [
            inst.designation,
            inst.modele,
            inst.numero_serie,
            formatDate(inst.date_derniere_calibration)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [75, 85, 99] },
        styles: { fontSize: 8 }
    });

    // --- SECTION 3 : RÉSULTATS DES MESURES ---
    const nextY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('RÉSULTATS DES MESURES', 15, nextY);

    autoTable(doc, {
        startY: nextY + 4,
        head: [['Paramètre', 'U.M', 'Valeur Trouvée', 'Cible', 'Tolérance', 'Verdict']],
        body: mesures.map((m: any) => [
            m.parametre,
            m.unite_mesure,
            m.valeur_trouvee,
            m.valeur_cible,
            m.tolerance_max ? `±${m.tolerance_max}` : 'N/A',
            {
                content: m.conforme ? 'CONFORME' : 'NON-CONFORME',
                styles: { textColor: m.conforme ? successColor : errorColor, fontStyle: 'bold' }
            }
        ]),
        theme: 'striped',
        headStyles: { fillColor: primaryColor as any },
        styles: { fontSize: 8, halign: 'center' }
    });

    // --- SECTION 4 : OBSERVATIONS ---
    const obsY = (doc as any).lastAutoTable.finalY + 12;
    if (observations_generales) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('OBSERVATIONS GÉNÉRALES', 15, obsY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(observations_generales, 15, obsY + 6, { maxWidth: 180 });
    }

    // --- CONCLUSION ---
    const conclY = Math.max(obsY + 30, (doc as any).lastAutoTable.finalY + 35);
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2], 0.05);
    doc.rect(15, conclY, 180, 25, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('RÉSULTAT GLOBAL :', 25, conclY + 10);

    const isSuccess = resultat_global === 'CONFORME' || (taux_conformite_pct && parseFloat(taux_conformite_pct) >= 95);
    doc.setTextColor(isSuccess ? successColor[0] : errorColor[0], isSuccess ? successColor[1] : errorColor[1], isSuccess ? successColor[2] : errorColor[2]);
    doc.setFontSize(18);
    doc.text(resultat_global?.toUpperCase() || (isSuccess ? 'CONFORME' : 'NON-CONFORME'), 75, conclY + 11);

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(10);
    doc.text(`Taux de Conformité : ${taux_conformite_pct}%`, 75, conclY + 18);

    // --- SIGNATURES ---
    const signY = conclY + 45;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    doc.text('TECHNICIEN / EXÉCUTANT', 15, signY);
    doc.line(15, signY + 2, 70, signY + 2);
    doc.setFontSize(7);
    doc.text(responsable?.nom_complet || 'Signature Appli', 15, signY + 6);

    doc.setFontSize(9);
    doc.text('VALIDATION QUALITÉ', 140, signY);
    doc.line(140, signY + 2, 195, signY + 2);

    // Save
    doc.save(`RAPPORT_${numero_test}_${equipement?.id_equipement || 'ID'}.pdf`);
};
