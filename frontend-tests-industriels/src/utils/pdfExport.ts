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

/**
 * ========================================
 * MASTER REPORT - Rapport Complet 16 Sections
 * ========================================
 */
export const exportMasterReportPDF = (masterData: any) => {
    const {
        rapport,
        test,
        meta,
        historique_versions = [],
        references_documentaires = [],
        description_systeme = '',
        perimetre_tests = '',
        environnement = '',
        strategie = '',
        conclusion = '',
        recommandations = ''
    } = masterData;

    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });

    const primaryColor: [number, number, number] = [31, 41, 55];
    const successColor: [number, number, number] = [16, 185, 129];
    const errorColor: [number, number, number] = [239, 68, 68];

    let currentY = 0;
    let pageNumber = 1;

    // =========== SECTION 1: PAGE DE GARDE ===========
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT DE TEST', 105, 100, { align: 'center' });
    doc.text('INDUSTRIEL', 105, 115, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(rapport.numero_rapport, 105, 135, { align: 'center' });

    doc.setFontSize(11);
    doc.text(`Équipement: ${test.equipement?.designation || 'N/A'}`, 105, 155, { align: 'center' });
    doc.text(`Test: ${test.numero_test}`, 105, 165, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Date d'édition : ${formatDate(rapport.date_edition)}`, 105, 185, { align: 'center' });
    doc.text(`Version: ${rapport.structure_rapport?.version || '1.0'}`, 105, 195, { align: 'center' });

    // Bloc statut
    doc.setFontSize(12);
    const statutY = 220;
    const statutColor = rapport.statut === 'VALIDE' ? successColor : [255, 165, 0];
    doc.setFillColor(statutColor[0], statutColor[1], statutColor[2]);
    doc.roundedRect(70, statutY - 8, 70, 15, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(rapport.statut, 105, statutY, { align: 'center' });

    // Footer page de garde
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('© 2026 Tests Industriels - Document Confidentiel', 105, 280, { align: 'center' });

    // =========== SECTION 2: HISTORIQUE DES VERSIONS ===========
    doc.addPage();
    pageNumber++;
    currentY = 20;

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('HISTORIQUE DES VERSIONS', 15, currentY);

    currentY += 10;
    if (historique_versions.length > 0) {
        autoTable(doc, {
            startY: currentY,
            head: [['Version', 'Date', 'Modifications', 'Auteur']],
            body: historique_versions.map((v: any) => [
                v.version,
                formatDate(v.date),
                v.modifications,
                v.auteur
            ]),
            theme: 'grid',
            headStyles: { fillColor: primaryColor as any },
            styles: { fontSize: 9 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
        currentY += 10;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Première version du document', 15, currentY);
        currentY += 20;
    }

    // =========== SECTION 3: TABLE DES MATIÈRES ===========
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TABLE DES MATIÈRES', 15, currentY);

    currentY += 10;
    const toc = [
        ['1', 'Page de Garde', '1'],
        ['2', 'Historique des Versions', '2'],
        ['3', 'Table des Matières', '2'],
        ['4', 'Introduction', '3'],
        ['5', 'Références Documentaires', '3'],
        ['6', 'Description du Système Testé', '4'],
        ['7', 'Périmètre des Tests', '5'],
        ['8', 'Environnement et Conditions de Test', '5'],
        ['9', 'Stratégie et Types de Tests', '6'],
        ['10', 'Cas de Test (Scénarios)', `7`],
        ['11', 'Résultats Globaux des Tests', `${7 + Math.ceil(meta.total_mesures / 10)}`],
        ['12', 'Anomalies et Non-Conformités', `${8 + Math.ceil(meta.total_mesures / 10)}`],
        ['13', 'Actions Correctives et Retests', `${9 + Math.ceil(meta.total_mesures / 10)}`],
        ['14', 'Conclusion', `${10 + Math.ceil(meta.total_mesures / 10)}`],
        ['15', 'Recommandations', `${10 + Math.ceil(meta.total_mesures / 10)}`],
        ['16', 'Validation et Signatures', `${11 + Math.ceil(meta.total_mesures / 10)}`],
    ];

    autoTable(doc, {
        startY: currentY,
        head: [['N°', 'Section', 'Page']],
        body: toc,
        theme: 'plain',
        headStyles: { fillColor: [240, 240, 240], textColor: primaryColor as any, fontStyle: 'bold' },
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 15 },
            2: { cellWidth: 15, halign: 'right' }
        }
    });

    // =========== SECTION 4: INTRODUCTION ===========
    doc.addPage();
    pageNumber++;
    currentY = 20;

    renderSectionHeader(doc, '4. INTRODUCTION', currentY, primaryColor);
    currentY += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const introText = `Ce rapport présente les résultats du test industriel réalisé sur l'équipement ${test.equipement?.designation || 'N/A'} (Code: ${test.equipement?.code_equipement || 'N/A'}).\n\nObjectif: Valider la conformité de l'équipement selon les spécifications techniques et les normes applicables.\n\nPortée: ${test.type_test?.libelle || 'Test complet'}`;
    doc.text(introText, 15, currentY, { maxWidth: 180 });
    currentY += 40;

    // =========== SECTION 5: RÉFÉRENCES DOCUMENTAIRES ===========
    renderSectionHeader(doc, '5. RÉFÉRENCES DOCUMENTAIRES', currentY, primaryColor);
    currentY += 10;

    if (references_documentaires.length > 0 || test.normes?.length > 0) {
        const refs = references_documentaires.length > 0
            ? references_documentaires
            : test.normes.map((n: any) => [`${n.code_norme}`, n.libelle]);

        autoTable(doc, {
            startY: currentY,
            head: [['Référence', 'Description']],
            body: refs,
            theme: 'plain',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [245, 245, 245], textColor: primaryColor as any }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('- Spécifications techniques internes', 15, currentY);
        currentY += 20;
    }

    // =========== SECTION 6: DESCRIPTION DU SYSTÈME ===========
    if (currentY > 240) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
    }

    renderSectionHeader(doc, '6. DESCRIPTION DU SYSTÈME TESTÉ', currentY, primaryColor);
    currentY += 12;

    const systemText = description_systeme || `Équipement: ${test.equipement?.designation}\nLocalisation: ${test.localisation || test.equipement?.localisation || 'N/A'}\nType de test: ${test.type_test?.libelle}`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(systemText, 15, currentY, { maxWidth: 180 });
    currentY += 30;

    // =========== SECTION 7: PÉRIMÈTRE DES TESTS ===========
    if (currentY > 240) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
    }

    renderSectionHeader(doc, '7. PÉRIMÈTRE DES TESTS', currentY, primaryColor);
    currentY += 12;

    const perimetreText = perimetre_tests || `Fonctions testées:\n- ${test.type_test?.libelle}\n- Nombre de mesures réalisées: ${meta.total_mesures}\n\nLimitations: Aucune`;
    doc.text(perimetreText, 15, currentY, { maxWidth: 180 });
    currentY += 30;

    // =========== SECTION 8: ENVIRONNEMENT ===========
    if (currentY > 240) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
    }

    renderSectionHeader(doc, '8. ENVIRONNEMENT ET CONDITIONS DE TEST', currentY, primaryColor);
    currentY += 12;

    const envText = environnement || `Conditions ambiantes: ${test.conditions_environnementales ? JSON.stringify(test.conditions_environnementales) : 'Normales'}\nDate du test: ${formatDate(test.date_test)}\nDurée réelle: ${meta.duree_reelle || 'N/A'} heures`;
    doc.text(envText, 15, currentY, { maxWidth: 180 });
    currentY += 30;

    // =========== SECTION 9: STRATÉGIE ===========
    if (currentY > 240) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
    }

    renderSectionHeader(doc, '9. STRATÉGIE ET TYPES DE TESTS', currentY, primaryColor);
    currentY += 12;

    const strategieText = strategie || `Approche de test: ${test.type_test?.libelle}\nCritères d'acceptation: Taux de conformité >= 95%\nMéthode: Tests fonctionnels sur site`;
    doc.text(strategieText, 15, currentY, { maxWidth: 180 });

    // =========== SECTION 10: CAS DE TEST (RÉSULTATS) ===========
    doc.addPage();
    pageNumber++;
    currentY = 20;

    renderSectionHeader(doc, '10. CAS DE TEST - RÉSULTATS DES MESURES', currentY, primaryColor);
    currentY += 10;

    if (test.mesures && test.mesures.length > 0) {
        autoTable(doc, {
            startY: currentY,
            head: [['ID', 'Paramètre', 'Valeur', 'Cible', 'Tolérance', 'Statut']],
            body: test.mesures.map((m: any, idx: number) => [
                `M${idx + 1}`,
                m.parametre || 'N/A',
                m.valeur_trouvee || 'N/A',
                m.valeur_cible || 'N/A',
                m.tolerance_max ? `±${m.tolerance_max}` : 'N/A',
                {
                    content: m.conforme ? '✓ CONFORME' : '✗ NON-CONFORME',
                    styles: {
                        textColor: m.conforme ? successColor : errorColor,
                        fontStyle: 'bold'
                    }
                }
            ]),
            theme: 'striped',
            headStyles: { fillColor: primaryColor as any },
            styles: { fontSize: 8, halign: 'center' }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // =========== SECTION 11: RÉSULTATS GLOBAUX ===========
    if (currentY > 240) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
    }

    renderSectionHeader(doc, '11. RÉSULTATS GLOBAUX DES TESTS', currentY, primaryColor);
    currentY += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Taux de Conformité Global: ${test.taux_conformite_pct || meta.mesures_conformes / meta.total_mesures * 100}%`, 15, currentY);
    currentY += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total de mesures effectuées: ${meta.total_mesures}`, 15, currentY);
    currentY += 8;
    doc.text(`Mesures conformes: ${meta.mesures_conformes}`, 15, currentY);
    currentY += 8;
    doc.text(`Mesures non conformes: ${meta.total_mesures - meta.mesures_conformes}`, 15, currentY);
    currentY += 20;

    // =========== SECTION 12: ANOMALIES ===========
    if (currentY > 240) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
    }

    renderSectionHeader(doc, '12. ANOMALIES ET NON-CONFORMITÉS', currentY, primaryColor);
    currentY += 10;

    if (test.nonConformites && test.nonConformites.length > 0) {
        autoTable(doc, {
            startY: currentY,
            head: [['ID', 'Description', 'Criticité', 'Statut']],
            body: test.nonConformites.map((nc: any) => [
                nc.numero_nc,
                nc.description,
                nc.criticite,
                nc.statut
            ]),
            theme: 'grid',
            headStyles: { fillColor: primaryColor as any },
            styles: { fontSize: 9 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(0, 150, 0);
        doc.text('✓ Aucune non-conformité détectée', 15, currentY);
        currentY += 20;
    }

    // =========== SECTION 13: ACTIONS CORRECTIVES ===========
    if (currentY > 240) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
    }

    renderSectionHeader(doc, '13. ACTIONS CORRECTIVES ET RETESTS', currentY, primaryColor);
    currentY += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Toutes les anomalies détectées font l\'objet d\'une fiche de non-conformité avec actions correctives associées.', 15, currentY, { maxWidth: 180 });
    currentY += 30;

    // =========== SECTION 14: CONCLUSION ===========
    if (currentY > 240) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
    }

    renderSectionHeader(doc, '14. CONCLUSION', currentY, primaryColor);
    currentY += 12;

    const conclusionText = conclusion || `L'équipement ${test.equipement?.designation} a été testé avec succès. Le taux de conformité global est de ${test.taux_conformite_pct}%, ce qui est ${test.resultat_global === 'CONFORME' ? 'conforme' : 'non conforme'} aux exigences.`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(conclusionText, 15, currentY, { maxWidth: 180 });
    currentY += 30;

    // =========== SECTION 15: RECOMMANDATIONS ===========
    if (currentY > 240) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
    }

    renderSectionHeader(doc, '15. RECOMMANDATIONS', currentY, primaryColor);
    currentY += 12;

    const recoText = recommandations || '- Poursuivre la surveillance périodique\n- Maintenir les conditions d\'environnement optimales\n- Planifier la prochaine campagne de tests selon le calendrier établi';
    doc.text(recoText, 15, currentY, { maxWidth: 180 });

    // =========== SECTION 16: SIGNATURES ===========
    doc.addPage();
    pageNumber++;
    currentY = 20;

    renderSectionHeader(doc, '16. VALIDATION ET SIGNATURES', currentY, primaryColor);
    currentY += 20;

    // Bloc rédacteur
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉDACTION', 15, currentY);
    currentY += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Nom: ${rapport.redacteur?.nom_complet || 'N/A'}`, 15, currentY);
    currentY += 6;
    doc.text(`Date: ${formatDate(rapport.date_edition)}`, 15, currentY);
    currentY += 8;
    doc.text('Signature:', 15, currentY);
    doc.line(15, currentY + 2, 80, currentY + 2);

    // Bloc valideur
    currentY = 48;
    doc.setFont('helvetica', 'bold');
    doc.text('VALIDATION', 130, currentY);
    currentY += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Nom: ${rapport.valideur?.nom_complet || 'En attente'}`, 130, currentY);
    currentY += 6;
    doc.text(`Date: ${rapport.date_validation ? formatDate(rapport.date_validation) : 'En attente'}`, 130, currentY);
    currentY += 8;
    doc.text('Signature:', 130, currentY);
    doc.line(130, currentY + 2, 195, currentY + 2);

    // Save final
    doc.save(`RAPPORT_MASTER_${rapport.numero_rapport}.pdf`);
};

/**
 * Helper: Render section header
 */
function renderSectionHeader(doc: any, title: string, y: number, color: [number, number, number]) {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(15, y - 3, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 17, y + 2);
    doc.setTextColor(color[0], color[1], color[2]);
}
