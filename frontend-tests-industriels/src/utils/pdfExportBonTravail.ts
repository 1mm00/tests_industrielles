import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './helpers';
import toast from 'react-hot-toast';

export interface CalibrationWorkOrderData {
    id_instrument: string;
    code_instrument: string;
    designation: string;
    type_instrument: string;
    numero_serie: string;
    localisation: string;
    date_echeance: string;
    statut_actuel: string;
    criticite: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const generateCalibrationWorkOrderPDF = (instrument: any) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    const theme = {
        noir: [15, 23, 42] as [number, number, number],
        grisDark: [51, 65, 85] as [number, number, number],
        label: [100, 116, 139] as [number, number, number],
        border: [226, 232, 240] as [number, number, number],
        amber: [217, 119, 6] as [number, number, number],
        amberSoft: [254, 243, 199] as [number, number, number],
        rose: [225, 29, 72] as [number, number, number],
        roseSoft: [255, 228, 230] as [number, number, number],
        blue: [37, 99, 235] as [number, number, number]
    };

    const isExpired = new Date(instrument.date_prochaine_calibration) < new Date();

    // --- 1. HEADER ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
    doc.text("BON DE TRAVAIL MÉTROLOGIQUE", margin, 25);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
    doc.text("AEROTECH INDUSTRIAL · MISSION CONTROL SYSTEM v4.0", margin, 31);

    // Document ID & Priority
    const statusColor = isExpired ? theme.rose : theme.amber;
    const statusText = isExpired ? "CRITIQUE : MÉTROLOGIE ÉCHUE" : "MAINTENANCE PRÉVENTIVE";

    doc.setFillColor(isExpired ? theme.roseSoft[0] : theme.amberSoft[0], isExpired ? theme.roseSoft[1] : theme.amberSoft[1], isExpired ? theme.roseSoft[2] : theme.amberSoft[2]);
    doc.roundedRect(pageWidth - margin - 70, 18, 70, 15, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusText, pageWidth - margin - 35, 24, { align: 'center' });

    doc.setFontSize(7);
    doc.text(`ORDRE #WO-${Math.floor(Math.random() * 90000) + 10000}`, pageWidth - margin - 35, 29, { align: 'center' });

    let currentY = 45;

    // --- 2. IDENTIFICATION DE L'INSTRUMENT ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.blue[0], theme.blue[1], theme.blue[2]);
    doc.text("1. IDENTIFICATION DE L'ACTIF", margin, currentY);

    currentY += 5;
    autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        body: [
            ['DÉSIGNATION', instrument.designation, 'CODE INTERNE', instrument.code_instrument],
            ['TYPE', instrument.type_instrument, 'N° DE SÉRIE', instrument.numero_serie],
            ['LOCALISATION', instrument.localisation || 'Atelier Principal', 'ÉCHÉANCE', formatDate(instrument.date_prochaine_calibration)],
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', textColor: theme.label, cellWidth: 35 },
            1: { fontStyle: 'bold', textColor: theme.noir, cellWidth: 55 },
            2: { fontStyle: 'bold', textColor: theme.label, cellWidth: 35 },
            3: { fontStyle: 'bold', textColor: theme.noir, cellWidth: 55 }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // --- 3. INSTRUCTIONS DE CALIBRATION ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.blue[0], theme.blue[1], theme.blue[2]);
    doc.text("2. PROTOCOLE D'INTERVENTION", margin, currentY);

    currentY += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
    const instructions = [
        "· Procéder au nettoyage complet de l'instrument avant mesure.",
        "· Vérifier l'intégrité des interfaces de connexion et des câbles.",
        "· Effectuer 5 points de mesure sur toute l'étendue de la plage.",
        "· Comparer les résultats aux tolérances constructeur (Certificat précédent).",
        "· En cas de dérive > 75% de la tolérance, procéder à un ajustage."
    ];
    instructions.forEach(line => {
        doc.text(line, margin + 5, currentY);
        currentY += 6;
    });

    currentY += 6;

    // --- 4. CHECKLIST D'INTERVENTION (GRID) ---
    autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['POINT DE CONTRÔLE', 'CONFORME', 'NON CONFORME', 'OBSERVATIONS']],
        body: [
            ['État Physique / Nettoyage', '[  ]', '[  ]', ''],
            ['Auto-test Système', '[  ]', '[  ]', ''],
            ['Mesure Point Zéro', '[  ]', '[  ]', ''],
            ['Mesure Pleine Échelle', '[  ]', '[  ]', ''],
            ['Précision / Répétabilité', '[  ]', '[  ]', ''],
        ],
        theme: 'grid',
        headStyles: { fillColor: theme.noir, textColor: [255, 255, 255], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 4 },
        columnStyles: {
            0: { cellWidth: 55 },
            1: { halign: 'center', cellWidth: 25 },
            2: { halign: 'center', cellWidth: 25 },
            3: { cellWidth: 75 }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 5. VISA EXÉCUTION ---
    doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("TECHNICIEN RESPONSABLE", margin, currentY);
    doc.text("VISA / CACHET LABORATOIRE", pageWidth - margin - 50, currentY);

    currentY += 20;
    doc.setDrawColor(theme.noir[0], theme.noir[1], theme.noir[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, margin + 50, currentY);
    doc.line(pageWidth - margin - 55, currentY, pageWidth - margin, currentY);

    // --- 6. FOOTER ---
    doc.setFontSize(7);
    doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
    const footerText = "DOCUMENT GÉNÉRÉ AUTOMATIQUEMENT PAR AEROTECH MISSION CONTROL — VALEUR JURIDIQUE DE BON DE TRAVAIL";
    doc.text(footerText, pageWidth / 2, 285, { align: 'center' });

    doc.save(`BON_TRAVAIL_${instrument.code_instrument}.pdf`);
    toast.success(`Bon de travail généré pour ${instrument.code_instrument}`);
};
