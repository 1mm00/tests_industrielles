import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './helpers';
import { KpiData } from '../hooks/useKpis';

export const exportAuditKPIsPDF = (data: KpiData, filters: { start_date: string; end_date: string }) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const theme = {
        primary: [15, 23, 42] as [number, number, number], // slate-900
        secondary: [99, 102, 241] as [number, number, number], // indigo-500
        text: [51, 65, 85] as [number, number, number], // slate-600
        muted: [148, 163, 184] as [number, number, number], // slate-400
        success: [16, 185, 129] as [number, number, number], // emerald-500
        danger: [244, 63, 94] as [number, number, number], // rose-500
    };

    // --- 1. HEADER ---
    doc.setFillColor(...theme.primary);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('AUDIT DE PERFORMANCE TECHNIQUE', margin, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const periodStr = `PÉRIODE : ${formatDate(filters.start_date)} AU ${formatDate(filters.end_date)}`;
    doc.text(periodStr, margin, 26);
    doc.text('SYSTÈME DE GESTION DES TESTS INDUSTRIELS - AEROTECH v2.0', margin, 31);

    // --- 2. RÉSUMÉ EXÉCUTIF (STAT CARDS) ---
    let y = 55;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...theme.primary);
    doc.text('1. RÉSUMÉ DES INDICATEURS CLÉS (KPI)', margin, y);
    y += 10;

    const kpis = [
        { label: 'Taux de Conformité', value: `${data.taux_reussite.valeur}%`, detail: `${data.taux_reussite.reussis} / ${data.taux_reussite.total} tests validés` },
        { label: 'Volume d\'Activités', value: data.total_tests.valeur.toString(), detail: 'Campagnes de tests exécutées' },
        { label: 'Déficiences (NC)', value: data.non_conformites.total.toString(), detail: `${data.non_conformites.ouvertes} NC toujours ouvertes` },
        { label: 'Efficience Opérationnelle', value: `${data.temps_moyen_execution.valeur}h`, detail: 'Temps moyen par session' }
    ];

    kpis.forEach((kpi, idx) => {
        const xPos = margin + (idx % 2) * 85;
        const yPos = y + Math.floor(idx / 2) * 25;

        doc.setDrawColor(241, 245, 249);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(xPos, yPos, 80, 20, 3, 3, 'FD');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...theme.muted);
        doc.text(kpi.label.toUpperCase(), xPos + 5, yPos + 7);

        doc.setFontSize(12);
        doc.setTextColor(...theme.primary);
        doc.text(kpi.value, xPos + 5, yPos + 15);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...theme.text);
        doc.text(kpi.detail, xPos + 35, yPos + 15);
    });

    y += 55;

    // --- 3. PERFORMANCE PAR TYPE DE TEST ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...theme.primary);
    doc.text('2. ANALYSE PAR PROTOCOLE TECHNIQUE', margin, y);
    y += 8;

    autoTable(doc, {
        startY: y,
        head: [['PROTOCOLE', 'TOTAL', 'VALIDÉS', 'TAUX SUCCÈS']],
        body: data.performance_par_type.map(p => [
            p.type,
            p.total.toString(),
            p.valides.toString(),
            { content: `${p.taux_reussite}%`, styles: { fontStyle: 'bold', textColor: p.taux_reussite >= 80 ? theme.success : (p.taux_reussite < 60 ? theme.danger : theme.text) } }
        ]),
        theme: 'striped',
        headStyles: { fillColor: theme.primary, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        margin: { left: margin, right: margin },
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    // --- 4. TENDANCES ET ÉVOLUTION ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...theme.primary);
    doc.text('3. TENDANCES MENSUELLES', margin, y);
    y += 8;

    autoTable(doc, {
        startY: y,
        head: [['MOIS', 'VOLUME TESTS', 'VALIDATIONS', 'PERFORMANCE']],
        body: data.tendances.map(t => [
            t.mois,
            t.total.toString(),
            t.valides.toString(),
            `${t.taux_reussite}%`
        ]),
        theme: 'grid',
        headStyles: { fillColor: theme.secondary, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        margin: { left: margin, right: margin },
    });

    // --- FOOTER ---
    doc.setFontSize(8);
    doc.setTextColor(...theme.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rapport généré le ${formatDate(new Date().toISOString())} par AeroTech Predictive Analytics Engine`, margin, 280);
    doc.text(`Page 1/1`, pageWidth - margin - 10, 280);

    // Sauvegarde
    doc.save(`Audit_Performance_${filters.start_date}_${filters.end_date}.pdf`);
};
