import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './helpers';
import toast from 'react-hot-toast';
import { ncService } from '@/services/ncService';

/**
 * Génère un rapport PDF professionnel pour une Non-Conformité (NC)
 * Suit le design AeroTech Industrial Solutions
 */
export const exportNonConformitePDF = async (ncId: string) => {
    const loadingToast = toast.loading("Génération du rapport d'audit...");

    try {
        // 1. Récupération des données complètes (avec relations backend)
        const nc = await ncService.getNc(ncId);

        if (!nc) {
            throw new Error("Données de la NC introuvables");
        }

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

        // Design Tokens (Même palette que pdftest)
        const theme = {
            noir: [15, 23, 42] as [number, number, number],
            grisDark: [51, 65, 85] as [number, number, number],
            label: [100, 116, 139] as [number, number, number],
            border: [226, 232, 240] as [number, number, number],
            emerald: [16, 185, 129] as [number, number, number],
            emeraldSoft: [209, 250, 229] as [number, number, number],
            rose: [225, 29, 72] as [number, number, number],
            roseSoft: [255, 228, 230] as [number, number, number],
            blue: [37, 99, 235] as [number, number, number],
            orange: [249, 115, 22] as [number, number, number],
            orangeSoft: [255, 247, 237] as [number, number, number]
        };

        // --- 1. HEADER INSTITUTIONNEL ---
        const drawHeader = () => {
            // Logo / Branding AeroTech
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
            doc.text("AEROTECH", margin, 20);

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
            doc.text("ADVANCED INDUSTRIAL SOLUTIONS", margin, 24);

            // Reference & Date
            doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
            doc.setLineWidth(0.5);
            doc.line(margin + 55, 14, margin + 55, 26);

            doc.setFontSize(7);
            doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
            doc.text("RÉFÉRENCE NC", margin + 60, 18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
            doc.text(nc.numero_nc, margin + 60, 22);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
            doc.text("DATE DÉTECTION", margin + 95, 18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
            doc.text(formatDate(nc.date_detection, 'short').toUpperCase(), margin + 95, 22);

            // Status Badge (Top Right)
            const indicatorX = pageWidth - margin - 50;
            let badgeColor = theme.rose;
            let badgeBg = theme.roseSoft;
            let statusLabelStr: string = nc.statut;

            if (nc.statut === 'CLOTUREE') {
                badgeColor = theme.emerald;
                badgeBg = theme.emeraldSoft;
                statusLabelStr = "CLÔTURÉE & VALIDÉE";
            } else if ((nc.statut as string) === 'EN_COURS' || (nc.statut as string) === 'ANALYSE' || (nc.statut as string) === 'TRAITEMENT') {
                badgeColor = theme.orange;
                badgeBg = theme.orangeSoft;
                statusLabelStr = "ANALYSE ACTIVE";
            } else if (nc.statut === 'OUVERTE') {
                statusLabelStr = "OUVERTE (ACTION REQUISE)";
            }

            doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
            doc.roundedRect(indicatorX, 15, 50, 11, 2, 2, 'F');
            doc.setFontSize(8);
            doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
            doc.setFont('helvetica', 'bold');
            doc.text(statusLabelStr, indicatorX + 25, 22, { align: 'center' });
        };

        drawHeader();
        let currentY = 40;

        // --- 2. SECTION A : IDENTIFICATION & CONTEXTE ---
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(theme.blue[0], theme.blue[1], theme.blue[2]);
        doc.text("A. IDENTIFICATION & CONTEXTE DE L'INCIDENT", margin, currentY);

        currentY += 4;
        autoTable(doc, {
            startY: currentY,
            margin: { left: margin, right: margin },
            body: [
                ['ÉQUIPEMENT', nc.equipement?.designation || 'N/A', 'IDENTIFIANT', nc.equipement?.code_equipement || 'N/A'],
                ['TYPE D\'ÉCART', nc.type_nc || 'Rupture de process', 'CRITICITÉ', nc.criticite?.libelle || 'Niveau Standard'],
                ['SITE / ZONE', nc.equipement?.localisation_site || 'Atelier Principal', 'RÉF. TEST', nc.test?.numero_test || 'Intervention Directe'],
            ],
            theme: 'plain',
            styles: { fontSize: 8, cellPadding: 2.5 },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: theme.label, cellWidth: 35 },
                1: { fontStyle: 'bold', textColor: theme.noir, cellWidth: 55 },
                2: { fontStyle: 'bold', textColor: theme.label, cellWidth: 35 },
                3: { fontStyle: 'bold', textColor: theme.noir, cellWidth: 45 }
            }
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;

        // --- 3. SECTION B : DESCRIPTION DE LA NON-CONFORMITÉ ---
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(theme.blue[0], theme.blue[1], theme.blue[2]);
        doc.text("B. DESCRIPTION DE L'ÉCART & IMPACTS", margin, currentY);

        currentY += 6;
        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
        const descText = nc.description || "Aucune description technique détaillée n'a été fournie.";
        const impactText = nc.impact_potentiel ? `Impact identifié : ${nc.impact_potentiel}` : "Impact potentiel en cours d'évaluation.";

        const descLines = doc.splitTextToSize(descText, contentWidth - 10);
        const impactLines = doc.splitTextToSize(impactText, contentWidth - 10);
        const boxHeight = (descLines.length * 4.5) + (impactLines.length * 4.5) + 15;

        doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
        doc.text(descLines, margin + 5, currentY + 8);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(theme.rose[0], theme.rose[1], theme.rose[2]);
        doc.text(impactLines, margin + 5, currentY + 8 + (descLines.length * 4.5) + 2);

        currentY += boxHeight + 10;

        // --- 4. SECTION C : ANALYSE DES CAUSES RACINES (5M) ---
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(theme.blue[0], theme.blue[1], theme.blue[2]);
        doc.text("C. ANALYSE ANALYTIQUE (MÉTHODE DES 5M)", margin, currentY);

        currentY += 4;
        const causes = nc.causes_racines || [];

        autoTable(doc, {
            startY: currentY,
            margin: { left: margin, right: margin },
            head: [['CATÉGORIE', 'DESCRIPTION DE LA CAUSE', 'TYPE', 'RÉCURRENCE']],
            body: causes.length > 0
                ? causes.map(c => [
                    c.categorie.toUpperCase(),
                    c.description,
                    c.type_cause || 'RACINE',
                    c.probabilite_recurrence_pct ? `${c.probabilite_recurrence_pct}%` : '-'
                ])
                : [['N/A', 'Aucune analyse des causes racines n\'a été enregistrée à ce jour.', '-', '-']],
            theme: 'striped',
            headStyles: { fillColor: [248, 250, 252], textColor: theme.label, fontSize: 7, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8, textColor: theme.noir },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 35 },
                1: { cellWidth: 90 },
                2: { halign: 'center', cellWidth: 25 },
                3: { halign: 'center', cellWidth: 25 }
            }
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;

        // --- 5. SECTION D : PLAN D'ACTIONS CORRECTIVES ---
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(theme.blue[0], theme.blue[1], theme.blue[2]);
        doc.text("D. PLAN D'ACTIONS CORRECTIVES & PRÉVENTIVES", margin, currentY);

        currentY += 4;
        const actions = nc.plan_action?.actions || [];

        autoTable(doc, {
            startY: currentY,
            margin: { left: margin, right: margin },
            head: [['RÉF', 'TYPE ACTION', 'DESCRIPTION', 'RESPONSABLE', 'ÉCHÉANCE', 'STATUT']],
            body: actions.length > 0
                ? actions.map(a => [
                    (a as any).numero_action || '-',
                    a.type_action,
                    a.description,
                    a.responsable?.nom ? `${a.responsable.prenom} ${a.responsable.nom}` : 'Désigné',
                    formatDate(a.date_prevue, 'short'),
                    a.statut
                ])
                : [['-', '-', 'Aucune action corrective planifiée pour cet écart.', '-', '-', '-']],
            theme: 'grid',
            headStyles: { fillColor: theme.noir, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
            bodyStyles: { fontSize: 7.5 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 25 },
                1: { fontStyle: 'bold', cellWidth: 25 },
                2: { cellWidth: 60 },
                3: { cellWidth: 30 },
                4: { cellWidth: 20 },
                5: { halign: 'center', fontStyle: 'bold', cellWidth: 20 }
            }
        });

        currentY = (doc as any).lastAutoTable.finalY + 12;

        // --- 6. CONCLUSIONS & VERDICT FINAL ---
        if (nc.statut === 'CLOTUREE') {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(theme.emerald[0], theme.emerald[1], theme.emerald[2]);
            doc.text("CONCLUSIONS ET VALIDATION D'EFFICACITÉ", margin, currentY);

            currentY += 5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(theme.grisDark[0], theme.grisDark[1], theme.grisDark[2]);
            const conclusionText = nc.conclusions || "L'efficacité des actions correctives a été validée par l'expert technique.";
            const conclusionLines = doc.splitTextToSize(conclusionText, contentWidth);
            doc.text(conclusionLines, margin, currentY);
        }

        // --- 7. PIED DE PAGE (SIG NATURES) ---
        const footerY = pageHeight - 40;
        doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
        doc.setLineWidth(0.2);
        doc.line(margin, footerY, pageWidth - margin, footerY);

        const stampX = pageWidth - margin - 55;
        const stampY = footerY + 8;
        doc.setFillColor(251, 251, 251);
        doc.roundedRect(stampX, stampY, 55, 20, 1, 1, 'F');
        doc.setDrawColor(theme.noir[0], theme.noir[1], theme.noir[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(stampX, stampY, 55, 20, 1, 1, 'S');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
        doc.text("VISA QUALITÉ", stampX + 27.5, stampY + 6, { align: 'center' });

        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text(`ID_NC: ${nc.id_non_conformite.substring(0, 12).toUpperCase()}`, stampX + 27.5, stampY + 12, { align: 'center' });
        doc.text(`DATE GENERATION: ${new Date().toLocaleString()}`, stampX + 27.5, stampY + 16, { align: 'center' });

        // Official Footer
        doc.setFontSize(7);
        doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
        doc.text(`Rapport de Non-Conformité AeroTech Control — Document de traçabilité industrielle — Page 1/1`, pageWidth / 2, pageHeight - 10, { align: 'center' });

        // Téléchargement
        doc.save(`AEROTECH_NC_${nc.numero_nc}.pdf`);
        toast.success("Rapport NC généré avec succès", { id: loadingToast });

    } catch (error: any) {
        console.error("[PDF_NC_ERROR]", error);
        toast.error("Erreur lors de la génération du PDF", { id: loadingToast });
    }
};
