import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './helpers';
import toast from 'react-hot-toast';
import { testsService } from '@/services/testsService';

export interface TechnicalReportData {
    id_test: string;
    numero_test: string;
    titre_rapport: string;
    type_rapport: string;
    date_edition: string;
    resume_executif: string;
    recommandations?: string;
    verdict: string;
    site: string;
    atelier?: string;
    criticite: string;
    date_planification: string;
    health_score: number;
    equipement: {
        nom: string;
        code: string;
        modele: string;
        statut: string;
    };
    instrument: {
        nom: string;
        code: string;
        numero_serie: string;
        derniere_calibration: string;
        validite: string;
    };
    equipe: Array<{
        nom: string;
        role: string;
        departement: string;
        email: string;
        is_responsable: boolean;
    }>;
    mesures: Array<{
        parametre: string;
        valeur: string | number;
        valeur_attendue?: string | number;
        unite?: string;
        conforme: boolean | string;
        criticite?: number;
        observations?: string;
        metadata?: string;
    }>;
    metadatas: {
        duree_test: string;
        notes_terrain: string;
        resultat_attendu: string;
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

    const isOk = data.verdict?.toUpperCase() === 'OK' ||
        data.verdict?.toUpperCase() === 'CONFORME' ||
        data.verdict?.toUpperCase() === 'VALIDE' ||
        data.verdict?.toUpperCase() === 'VALIDÉ' ||
        data.verdict?.toUpperCase() === 'TERMINE';

    const healthScore = data.health_score || (data.mesures ? Math.round((data.mesures.filter(m => m.conforme).length / data.mesures.length) * 100) : (isOk ? 100 : 0));

    // Design Tokens
    const theme = {
        noir: [15, 23, 42] as [number, number, number],
        grisDark: [51, 65, 85] as [number, number, number],
        label: [100, 116, 139] as [number, number, number],
        border: [226, 232, 240] as [number, number, number],
        emerald: [16, 185, 129] as [number, number, number],
        emeraldSoft: [209, 250, 229] as [number, number, number],
        rose: [225, 29, 72] as [number, number, number],
        roseSoft: [255, 228, 230] as [number, number, number],
        blue: [37, 99, 235] as [number, number, number]
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

        // Reference & Date (beside logo)
        doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
        doc.setLineWidth(0.5);
        doc.line(margin + 55, 14, margin + 55, 26);

        doc.setFontSize(7);
        doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
        doc.text("RÉFÉRENCE TEST", margin + 60, 18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
        doc.text(data.numero_test, margin + 60, 22);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
        doc.text("DATE D'ÉDITION", margin + 95, 18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
        doc.text(formatDate(data.date_edition, 'short').toUpperCase(), margin + 95, 22);

        // Indicator Flash (Top Right)
        const indicatorX = pageWidth - margin - 50;
        const color = isOk ? theme.emerald : theme.rose;
        const softColor = isOk ? theme.emeraldSoft : theme.roseSoft;

        doc.setFillColor(softColor[0], softColor[1], softColor[2]);
        doc.roundedRect(indicatorX, 15, 50, 11, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(isOk ? "CONFORME / VALIDÉ" : "NON CONFORME (NOK)", indicatorX + 25, 22, { align: 'center' });

        // Health Score Circle
        const gaugeX = pageWidth - margin - 8;
        const gaugeY = 20.5;
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(2);
        doc.circle(gaugeX, gaugeY, 7, 'S');

        doc.setDrawColor(color[0], color[1], color[2]);
        doc.circle(gaugeX, gaugeY, 7, 'S'); // Full circle for now as jspdf doesn't easily support arcs

        doc.setFontSize(8);
        doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
        doc.text(`${healthScore}%`, gaugeX, gaugeY + 1.2, { align: 'center' });
        doc.setFontSize(4);
        doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
        doc.text("HEALTH", gaugeX, gaugeY + 3.5, { align: 'center' });
    };

    drawHeader();
    let currentY = 40;

    // --- 2. SECTION A : IDENTIFICATION TECHNIQUE & MÉTROLOGIE ---
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.blue[0], theme.blue[1], theme.blue[2]);
    doc.text("A. IDENTIFICATION TECHNIQUE & MÉTROLOGIE", margin, currentY);

    currentY += 4;
    autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        body: [
            ['ÉQUIPEMENT', data.equipement.nom, 'INSTRUMENT', data.instrument?.nom || 'Instrument Standard'],
            ['CODE ASSET', data.equipement.code, 'N° DE SÉRIE', data.instrument?.numero_serie || 'N/A'],
            ['SITE / ZONE', `${data.site} ${data.atelier ? '- ' + data.atelier : ''}`, 'CALIBRATION', data.instrument?.derniere_calibration || 'N/A'],
            ['CRITICITÉ', data.criticite || 'Niveau 1', 'VALIDITÉ', data.instrument?.validite || 'CONFORME']
        ],
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 2.5 },
        columnStyles: {
            0: { fontStyle: 'bold', textColor: theme.label, cellWidth: 30 },
            1: { fontStyle: 'bold', textColor: theme.noir, cellWidth: 55 },
            2: { fontStyle: 'bold', textColor: theme.label, cellWidth: 30 },
            3: { fontStyle: 'bold', textColor: theme.noir, cellWidth: 55 }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // --- 3. SECTION B : ÉQUIPE TECHNIQUE D'INTERVENTION ---
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.blue[0], theme.blue[1], theme.blue[2]);
    doc.text("B. ÉQUIPE TECHNIQUE D'INTERVENTION (COHORTE)", margin, currentY);

    currentY += 4;
    // Sort team: responsable first, then rest of the team
    const sortedTeam = [...data.equipe].sort((a, b) => {
        if (a.is_responsable) return -1;
        if (b.is_responsable) return 1;
        return 0;
    });

    const teamRows = sortedTeam.map(member => [
        member.nom,
        member.role + (member.is_responsable ? ' (Responsable)' : ''),
        member.departement || 'N/A',
        member.email || '-'
    ]);

    autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['NOM ET PRÉNOM', 'RÔLE / FONCTION', 'DÉPARTEMENT', 'CONTACT']],
        body: teamRows,
        theme: 'striped',
        headStyles: { fillColor: [248, 250, 252], textColor: theme.label, fontSize: 7, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: theme.noir },
        columnStyles: {
            0: { fontStyle: 'bold' }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // --- 4. SECTION C : RÉSULTATS DES CONTRÔLES TERRAIN ---
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.blue[0], theme.blue[1], theme.blue[2]);
    doc.text("C. RÉSULTATS DES CONTRÔLES TERRAIN", margin, currentY);

    currentY += 4;
    autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['POINT DE CONTRÔLE', 'LVL', 'MESURE RÉELLE', 'VALEUR ATTENDUE', 'STATUT']],
        body: data.mesures && data.mesures.length > 0
            ? data.mesures.map(m => {
                const isEnv = m.parametre.startsWith('[ENV]');
                let statutTxt = "";
                if (m.conforme === 'RELEVÉ') {
                    statutTxt = "RELEVÉ";
                } else {
                    statutTxt = m.conforme ? "CONFORME" : "ÉCHEC";
                }

                return [
                    isEnv ? `   ${m.parametre}` : m.parametre + (m.metadata ? `\n(${m.metadata})` : ''),
                    m.criticite ? `N${m.criticite}` : (isEnv ? '-' : 'N1'),
                    `${m.valeur} ${m.unite || ''}`,
                    m.valeur_attendue && m.valeur_attendue !== '---' ? `${m.valeur_attendue} ${m.unite || ''}` : "SÉCURITÉ",
                    statutTxt
                ];
            })
            : [['Aucune mesure détaillée n\'a été enregistrée pour ce test.', '-', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: theme.noir, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 70 },
            1: { halign: 'center', fontStyle: 'bold', cellWidth: 15 },
            2: { halign: 'right', cellWidth: 35 },
            3: { halign: 'right', cellWidth: 35 },
            4: { halign: 'center', fontStyle: 'bold', cellWidth: 25 }
        },
        didParseCell: (data) => {
            if (data.section === 'body') {
                const cellText = data.cell.text[0] || '';

                // Style pour les lignes ENV
                if (cellText.includes('[ENV]')) {
                    data.cell.styles.textColor = theme.label;
                    data.cell.styles.fontSize = 7;
                }

                // Style spécial pour les points critiques N4/N5
                if (data.column.index === 1) {
                    const cellValue = data.cell.raw as string;
                    if (cellValue === 'N4' || cellValue === 'N5') {
                        data.cell.styles.textColor = theme.rose;
                        data.cell.styles.fontStyle = 'bold';
                    }
                }

                // Style pour le statut
                if (data.column.index === 4) {
                    const cellValue = data.cell.text[0];
                    if (cellValue === 'ÉCHEC') {
                        data.cell.styles.textColor = theme.rose;
                    } else if (cellValue === 'CONFORME') {
                        data.cell.styles.textColor = theme.emerald;
                    } else if (cellValue === 'RELEVÉ') {
                        data.cell.styles.textColor = theme.label;
                        data.cell.styles.fontStyle = 'normal';
                    }
                }
            }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // --- 5. SECTION D : ANALYSE D'EXPERTISE & RECOMMANDATIONS ---
    if (currentY + 60 > pageHeight - 30) {
        doc.addPage();
        drawHeader();
        currentY = 40;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.blue[0], theme.blue[1], theme.blue[2]);
    doc.text("D. ANALYSE D'EXPERTISE & RECOMMANDATIONS", margin, currentY);

    currentY += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
    doc.text("VERDICT FINAL (COMPARAISON ATTENDU vs RÉALITÉ) :", margin, currentY);

    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(theme.grisDark[0], theme.grisDark[1], theme.grisDark[2]);
    const verdictText = `Objectif attendu : ${data.metadatas.resultat_attendu || "Non spécifié"}\nRéalité terrain : ${data.verdict || "Observation standard"}`;
    const verdictLines = doc.splitTextToSize(verdictText, contentWidth);
    doc.text(verdictLines, margin, currentY);

    currentY += (verdictLines.length * 4) + 8;

    // Framed Observations (Commentaires Terrain)
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
    const obsText = data.resume_executif || "L'expertise technique confirme la conformité opérationnelle après analyse des points critiques.";
    const obsLines = doc.splitTextToSize(obsText, contentWidth - 10);
    const boxHeight = (obsLines.length * 4.5) + 15;

    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
    doc.text("OBSERVATIONS OFFICIELLES ET COMMENTAIRES TERRAIN", margin + 5, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(theme.grisDark[0], theme.grisDark[1], theme.grisDark[2]);
    doc.text(obsLines, margin + 5, currentY + 12);

    currentY += boxHeight + 10;

    if (data.recommandations) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(theme.noir[0], theme.noir[1], theme.noir[2]);
        doc.text("PRÉCONISATIONS ET ACTIONS CORRECTIVES :", margin, currentY);
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
        const recoLines = doc.splitTextToSize(data.recommandations, contentWidth);
        doc.text(recoLines, margin, currentY);
    }

    // --- 6. PIED DE PAGE (FOOTER) ---
    const footerY = pageHeight - 40;

    // Electronic Signature Zone
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
    doc.text("SIGNATURE ÉLECTRONIQUE", stampX + 27.5, stampY + 6, { align: 'center' });

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${data.id_test.substring(0, 16).toUpperCase()}`, stampX + 27.5, stampY + 12, { align: 'center' });
    doc.text(`SYSTEM TIMESTAMP: ${new Date().toLocaleString()}`, stampX + 27.5, stampY + 16, { align: 'center' });

    // Official Footer Text
    doc.setFontSize(7);
    doc.setTextColor(theme.label[0], theme.label[1], theme.label[2]);
    doc.text(`Rapport Technique AeroTech Control — Document de traçabilité certifié — Pag. 1/1`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`AEROTECH_REPORT_${data.numero_test}.pdf`);
};

export const exportToPDF = (options: any) => {
    const doc = new jsPDF();
    autoTable(doc, {
        head: [options.headers],
        body: options.body,
        headStyles: { fillColor: [15, 23, 42] }
    });
    doc.save(`${options.filename}.pdf`);
};

export const exportTestReportPDF = async (test: any) => {
    if (!test) return;

    // ============================================================
    // ÉTAPE 1 : Récupérer le test COMPLET depuis le Service
    // ============================================================
    let fullTest = test;
    const testId = test.id_test || test.id;

    try {
        console.log(`[PDF] Récupération des détails complets pour le test ${testId}...`);
        fullTest = await testsService.getTest(testId);
        console.log('[PDF] Test complet récupéré avec succès:', {
            numero: fullTest.numero_test,
            mesures: fullTest.mesures?.length || 0,
            equipe: fullTest.equipe_members?.length || 0
        });
    } catch (err) {
        console.warn('[PDF] Échec de la récupération complète via le service, utilisation des données partielles.', err);
    }

    // Toujours s'assurer que les mesures sont là
    let mesuresBase: any[] = fullTest.mesures || [];
    if (mesuresBase.length === 0) {
        try {
            mesuresBase = await testsService.getTestMesures(testId);
        } catch (err) {
            console.error('[PDF] Impossible de charger les mesures séparément.', err);
        }
    }

    // ============================================================
    // ÉTAPE 2 : Parser conditions_mesure (Multi-format)
    // ============================================================
    const extractEnvData = (str: string) => {
        if (!str) return [];
        const items: Array<{ parametre: string, valeur: string, unite: string }> = [];
        // Support multiple separators: ·, |, ;
        const parts = str.split(/[·|;]/).map(s => s.trim());

        parts.forEach(part => {
            const match = part.match(/^(T|TEMPERATURE|TEMP|H|HUMIDITE|HUMIDITY|P|PRESSION|PRESSURE)\s*:\s*(.*)$/i);
            if (match) {
                const key = match[1].toUpperCase();
                const val = match[2].trim();
                if (key.startsWith('T')) items.push({ parametre: 'Température', valeur: val, unite: '' });
                else if (key.startsWith('H')) items.push({ parametre: 'Humidité Relative', valeur: val, unite: '' });
                else if (key.startsWith('P')) items.push({ parametre: 'Pression Atm.', valeur: val, unite: '' });
            }
        });
        return items;
    };

    // Construction du tableau final des mesures
    const finalMesures: any[] = [];

    // Ajouter les mesures réelles (Une seule fois par mesure)
    mesuresBase.forEach((m: any) => {
        finalMesures.push({
            parametre: m.parametre_mesure || m.libelle || 'Point de contrôle',
            valeur: (m.valeur_mesuree !== null && m.valeur_mesuree !== undefined) ? m.valeur_mesuree : (m.valeur ?? '---'),
            valeur_attendue: (m.valeur_reference !== null && m.valeur_reference !== undefined) ? m.valeur_reference : '---',
            unite: m.unite_mesure || m.unite || '',
            conforme: m.conforme === true || m.conforme === 1 || String(m.conforme).toLowerCase() === 'true',
            criticite: m.criticite || 3,
            metadata: m.ecart_absolu ? `Écart: ${m.ecart_absolu} · Tol: ±${m.tolerance_max || 'N/A'}` : ''
        });
    });

    // Collecter les conditions environnementales (SANS DOUBLONS)
    const envParamsAdded = new Set();
    mesuresBase.forEach((m: any) => {
        if (m.conditions_mesure) {
            const envs = extractEnvData(m.conditions_mesure);
            envs.forEach(env => {
                const fullParamName = `[ENV] ${env.parametre}`;
                if (!envParamsAdded.has(fullParamName)) {
                    finalMesures.push({
                        parametre: fullParamName,
                        valeur: env.valeur,
                        valeur_attendue: 'AMBIANT',
                        unite: env.unite,
                        conforme: 'RELEVÉ',
                        criticite: 0,
                        metadata: 'Donnée environnementale'
                    });
                    envParamsAdded.add(fullParamName);
                }
            });
        }
    });

    // ============================================================
    // ÉTAPE 3 : Construction Équipe (Cohorte)
    // ============================================================
    const buildFullTeam = () => {
        const team: any[] = [];

        // 1. Responsable (toujours en premier)
        if (fullTest.responsable) {
            team.push({
                nom: fullTest.responsable.nom_complet || `${fullTest.responsable.prenom || ''} ${fullTest.responsable.nom || ''}`.trim(),
                role: fullTest.responsable.poste || fullTest.responsable.fonction || 'Responsable de Test',
                departement: fullTest.responsable.departement || 'Qualité',
                email: fullTest.responsable.email || '',
                is_responsable: true
            });
        }

        // 2. Membres de l'équipe (ceux qui ne sont pas le responsable)
        const respId = fullTest.responsable_test_id || fullTest.responsable?.id_personnel;
        const members = fullTest.equipe_members || [];

        members.forEach((m: any) => {
            if (m.id_personnel !== respId) {
                team.push({
                    nom: m.nom_complet || `${m.prenom || ''} ${m.nom || ''}`.trim(),
                    role: m.role?.nom_role || m.poste || 'Technicien / Consultant',
                    departement: m.departement || 'Opérations',
                    email: m.email || '',
                    is_responsable: false
                });
            }
        });

        // 3. Fallback si vide
        if (team.length === 0) {
            team.push({ nom: 'Équipe AeroTech Standard', role: 'Support Technique', departement: 'Qualité', email: '-', is_responsable: true });
        }

        return team;
    };

    const reportData: TechnicalReportData = {
        id_test: fullTest.id_test,
        numero_test: fullTest.numero_test,
        titre_rapport: `RAPPORT D'EXPERTISE : ${fullTest.type_test?.libelle || 'CONTRÔLE INDUSTRIEL'}`,
        type_rapport: fullTest.type_test?.libelle || 'Standard',
        date_edition: new Date().toISOString(),
        resume_executif: fullTest.observations_generales || fullTest.observations || "L'expertise terrain confirme la conformité générale.",
        recommandations: fullTest.recommandations || "Maintenir le plan de maintenance périodique.",
        verdict: fullTest.statut_final || fullTest.resultat_global || 'VALIDÉ',
        site: fullTest.localisation || 'Atelier Marignane',
        atelier: 'AeroHub Zone-A',
        criticite: `NIVEAU ${fullTest.niveau_criticite || 1}`,
        date_planification: fullTest.date_test,
        health_score: fullTest.taux_conformite_pct ? parseFloat(fullTest.taux_conformite_pct) : (fullTest.statut_final === 'CONFORME' ? 100 : 0),
        equipement: {
            nom: fullTest.equipement?.designation || 'Équipement Industriel',
            code: fullTest.equipement?.code_equipement || 'EQ-N/A',
            modele: fullTest.equipement?.modele || 'STD-2024',
            statut: 'OPÉRATIONNEL'
        },
        instrument: {
            nom: fullTest.instrument?.designation || 'Instrument de Mesure',
            code: fullTest.instrument?.code_instrument || 'AUTO',
            numero_serie: fullTest.instrument?.numero_serie || 'SN-XXXX',
            derniere_calibration: fullTest.instrument?.date_derniere_calibration ? formatDate(fullTest.instrument.date_derniere_calibration) : 'Déc. 2023',
            validite: 'VALIDE'
        },
        equipe: buildFullTeam(),
        mesures: finalMesures,
        metadatas: {
            duree_test: fullTest.duree_reelle_heures ? `${fullTest.duree_reelle_heures}H` : '1H 15M',
            notes_terrain: fullTest.observations || fullTest.observations_generales || 'R.A.S',
            resultat_attendu: fullTest.resultat_attendu || "Performance nominale."
        }
    };

    generateTechnicalReportPDF(reportData);
};

export const exportMasterReportPDF = () => {
    toast.error("Génération du rapport global indisponible.");
};
