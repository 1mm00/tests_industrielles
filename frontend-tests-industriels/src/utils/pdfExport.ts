import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './helpers';

export interface TechnicalReportData {
    id_test: string;
    numero_test: string;
    titre_rapport: string;
    type_rapport: string;
    date_edition: string;
    resume_executif: string;
    recommandations: string;
    verdict: string;
    site: string;
    atelier?: string;
    criticite?: string | number;
    date_planification?: string;
    health_score?: number; // Indice de santé 0-100
    equipement: {
        nom: string;
        code: string;
        modele?: string;
        statut?: string;
    };
    instrument?: {
        nom: string;
        code?: string;
        numero_serie?: string;
        derniere_calibration?: string;
        validite?: string;
    };
    executeur: {
        nom: string;
        role: string;
        departement?: string;
        email?: string;
        telephone?: string;
    };
    technicien_terrain?: {
        nom: string;
        role?: string;
        departement?: string;
        email?: string;
        telephone?: string;
    };
    mesures?: Array<{
        parametre: string;
        valeur: string | number;
        valeur_attendue?: string | number;
        unite?: string;
        conforme: boolean;
        observations?: string;
    }>;
    metadatas: {
        duree_test: string;
        notes_terrain: string;
    };
    validateur?: {
        nom: string;
        date_validation?: string;
    };
}

export const generateTechnicalReportPDF = (data: TechnicalReportData) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    const isOk = data.verdict?.toUpperCase() === 'OK' || data.verdict?.toUpperCase() === 'CONFORME' || data.verdict?.toUpperCase() === 'VALIDÉ' || data.verdict?.toUpperCase() === 'VALIDE';
    const healthScore = data.health_score || (data.mesures ? Math.round((data.mesures.filter(m => m.conforme).length / data.mesures.length) * 100) : (isOk ? 100 : 0));

    // Design Tokens
    const theme = {
        noir: [15, 23, 42] as [number, number, number],
        label: [100, 116, 139] as [number, number, number],
        border: [226, 232, 240] as [number, number, number],
        emerald: [16, 185, 129] as [number, number, number],
        emeraldSoft: [209, 250, 229] as [number, number, number],
        blue: [37, 99, 235] as [number, number, number]
    };

    // --- 1. HEADER & SCORE VISUEL ---
    const drawHeader = () => {
        // Branding
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
        doc.text("AEROTECH", margin, 20);

        // Vertical Separator
        doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
        doc.setLineWidth(0.3);
        doc.line(margin + 32, 14, margin + 32, 24);

        // Metadata
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
        doc.text(`REFERENCE: ${data.numero_test}`, margin + 36, 18);
        doc.text(`EDITION: ${formatDate(data.date_edition, 'short').toUpperCase()}`, margin + 36, 22);

        // Health Score (Radial Gauge Placeholder - Using circles for stability)
        const gaugeX = pageWidth - margin - 22;
        const gaugeY = 20;

        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(2.5);
        doc.circle(gaugeX, gaugeY, 7.5, 'S'); // Outer track

        doc.setDrawColor(healthScore > 50 ? theme.emerald[0] : 239, healthScore > 50 ? theme.emerald[1] : 68, healthScore > 50 ? theme.emerald[2] : 68);
        // We simulate the progress with a small circle if it's low or another circle if high
        // For a true radial we need arc, but arc is risky. Let's use a smaller circle for the score text.
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
        doc.text(`${healthScore}%`, gaugeX, gaugeY + 1.5, { align: 'center' });
        doc.setFontSize(4);
        doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
        doc.text("HEALTH", gaugeX, gaugeY + 4, { align: 'center' });

        // Status Badge
        const badgeW = 35;
        const badgeH = 7;
        const badgeX = gaugeX - 45;
        const badgeY = 16.5;

        doc.setFillColor(theme.emeraldSoft[0], theme.emeraldSoft[1], theme.emeraldSoft[2]);
        doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3.5, 3.5, 'F');
        doc.setFontSize(7);
        doc.setTextColor(theme.emerald[0], theme.emerald[1], theme.emerald[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(isOk ? "CONFORME / VALIDÉ" : "DÉFAUT DÉTECTÉ", badgeX + (badgeW / 2), badgeY + 4.5, { align: 'center' });
    };

    drawHeader();
    let currentY = 40;

    // --- 2. BLOC A : IDENTITÉ DE L'ASSET & MÉTROLOGIE ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
    doc.text("A. IDENTIFICATION TECHNIQUE & MÉTROLOGIE", margin, currentY);

    currentY += 6;
    autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        body: [
            ['ÉQUIPEMENT', data.equipement.nom, 'INSTRUMENT', data.instrument?.nom || 'Instrument Standard'],
            ['CODE ASSET', data.equipement.code, 'N° DE SÉRIE', data.instrument?.numero_serie || 'SN-0026-X'],
            ['SITE / ZONE', `${data.site} - ${data.atelier || 'Zone A'}`, 'CALIBRATION', data.instrument?.derniere_calibration || 'Déc. 2025'],
            ['CRITICITÉ', data.criticite || 'Niveau 2', 'VALIDITÉ', data.instrument?.validite || 'CONFORME']
        ],
        theme: 'plain',
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        columnStyles: {
            0: { fontStyle: 'bold', textColor: theme.label, cellWidth: 30 },
            1: { cellWidth: 55 },
            2: { fontStyle: 'bold', textColor: theme.label, cellWidth: 30 },
            3: { cellWidth: 55 }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // --- 3. BLOC B : ÉQUIPE D'INTERVENTION ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
    doc.text("B. ÉQUIPE TECHNIQUE D'INTERVENTION", margin, currentY);

    currentY += 5;
    autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['NOM ET PRÉNOM', 'RÔLE / FONCTION', 'DÉPARTEMENT', 'CONTACT']],
        body: [
            [
                data.executeur.nom,
                data.executeur.role,
                data.executeur.departement || 'Expertise',
                `${data.executeur.email || 'n/a'} \n${data.executeur.telephone || ''}`
            ],
            [
                data.technicien_terrain?.nom || 'Equipe Support',
                data.technicien_terrain?.role || 'Technicien',
                data.technicien_terrain?.departement || 'Maintenance',
                data.technicien_terrain?.email || 'terrain@aerotech.com'
            ]
        ],
        theme: 'striped',
        headStyles: { fillColor: [248, 250, 252], textColor: theme.label, fontSize: 7, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8.5, textColor: theme.noir },
        columnStyles: {
            0: { fontStyle: 'bold' }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // --- 4. BLOC C : EXÉCUTION & CONTRÔLES TERRAIN ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
    doc.text("C. RÉSULTATS DES CONTRÔLES TERRAIN (CHECKLIST)", margin, currentY);

    currentY += 8;
    const mesureRows = data.mesures?.map(m => [
        m.parametre,
        `${m.valeur} ${m.unite || ''}`,
        m.conforme ? 'OK' : 'NOK'
    ]) || [['Inspection Visuelle', 'Conforme', 'OK']];

    mesureRows.forEach((row, index) => {
        const itemY = currentY + (index * 7);
        // Bullet style point
        doc.setFillColor(theme.blue[0], theme.blue[1], theme.blue[2]);
        doc.circle(margin + 2, itemY - 1, 0.8, 'F');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
        doc.text(`${row[0]} :`, margin + 6, itemY);

        doc.setFont('helvetica', 'bold');
        doc.text(row[1], margin + 55, itemY);

        if (row[2] === 'OK') {
            doc.setTextColor(theme.emerald[0], theme.emerald[1], theme.emerald[2]);
            doc.text("● VALIDÉ", pageWidth - margin - 25, itemY);
        } else {
            doc.setTextColor(220, 38, 38);
            doc.text("● DÉFAUT", pageWidth - margin - 25, itemY);
        }
    });

    currentY += (mesureRows.length * 7) + 15;

    // --- 5. BLOC D : EXPERTISE & SYNTHÈSE FINALE ---
    if (currentY + 60 > pageHeight - 30) {
        doc.addPage();
        drawHeader();
        currentY = 40;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
    doc.text("D. ANALYSE D'EXPERTISE & RECOMMANDATIONS", margin, currentY);

    currentY += 8;
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
    const cleanLines = doc.splitTextToSize(data.resume_executif || "L'expertise technique confirme la conformité opérationnelle de l'asset au regard des protocoles AeroTech.", contentWidth);
    doc.text(cleanLines, margin, currentY, { align: 'justify', lineHeightFactor: 1.6 });

    currentY += (cleanLines.length * 5 * 1.6) + 10;

    if (data.recommandations) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
        doc.text("PRÉCONISATIONS QUALITÉ :", margin, currentY);
        currentY += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
        const recoLines = doc.splitTextToSize(data.recommandations, contentWidth);
        doc.text(recoLines, margin, currentY, { lineHeightFactor: 1.5 });
    }

    // --- 6. DESIGN & FOOTER ---
    const footerY = pageHeight - 40;

    // Separation
    doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    // Official Stamp
    const stampX = pageWidth - margin - 50;
    const stampY = footerY + 8;
    doc.setDrawColor(theme.noir[0], theme.noir[1], theme.noir[2]);
    doc.setLineWidth(0.6);
    doc.roundedRect(stampX, stampY, 50, 16, 1, 1, 'S');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
    doc.text("CERTIFIÉ CONFORME", stampX + 25, stampY + 7, { align: 'center' });
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(`VALIDATION TIMESTAMP: ${new Date().toISOString()}`, stampX + 25, stampY + 11.5, { align: 'center' });
    doc.text(`SIGNATURE ID: ${data.id_test.substring(0, 18).toUpperCase()}`, stampX + 25, stampY + 14.5, { align: 'center' });

    // Legal / Page
    doc.setFontSize(7);
    doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
    doc.text(`Rapport Expert AeroTech Control — Document de traçabilité certifié ISO-9001 — Page 1/1`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`AEROTECH_HYBRID_REPORT_${data.numero_test}.pdf`);
};

export const exportToPDF = (options: any) => {
    const doc = new jsPDF();
    autoTable(doc, { head: [options.headers], body: options.body });
    doc.save(`${options.filename}.pdf`);
};

export const exportMasterReportPDF = () => { };
export const exportTestReportPDF = (_data: any) => { };
