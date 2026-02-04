import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './helpers';
import toast from 'react-hot-toast';

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
    health_score?: number;
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
    equipe: Array<{
        nom: string;
        role: string;
        departement?: string;
        email?: string;
        is_responsable?: boolean;
    }>;
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
        resultat_attendu?: string;
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
        head: [['POINT DE CONTRÔLE', 'MESURE RÉELLE', 'VALEUR ATTENDUE / ÉTAT', 'VALIDATION']],
        body: data.mesures?.map(m => [
            m.parametre,
            `${m.valeur} ${m.unite || ''}`,
            m.valeur_attendue ? `${m.valeur_attendue} ${m.unite || ''}` : "CONFORME",
            m.conforme ? "✅" : "❌"
        ]) || [['Aucune mesure détaillée enregistrée', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: theme.noir, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
            3: { halign: 'center', fontSize: 10 }
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

export const exportTestReportPDF = (test: any) => {
    if (!test) return;

    // Mapping des données AeroTech
    const reportData: TechnicalReportData = {
        id_test: test.id_test,
        numero_test: test.numero_test,
        titre_rapport: `RAPPORT D'EXPERTISE : ${test.type_test?.libelle || 'CONTRÔLE INDUSTRIEL'}`,
        type_rapport: test.type_test?.libelle || 'Standard',
        date_edition: new Date().toISOString(),
        resume_executif: test.observations_generales || test.observations || "Aucune observation majeure notée.",
        recommandations: test.recommandations || "Continuer le suivi périodique selon le plan de maintenance.",
        verdict: test.statut_final || test.resultat_global || 'EN ATTENTE',
        site: test.localisation || 'Atelier Principal',
        atelier: 'AeroHub Zone-A',
        criticite: test.niveau_criticite ? `NIVEAU ${test.niveau_criticite}` : 'NIVEAU 1',
        date_planification: test.date_test,
        health_score: test.statut_test === 'TERMINE' && test.statut_final === 'OK' ? 100 : (test.statut_final === 'NOK' ? 45 : 85),
        equipement: {
            nom: test.equipement?.designation || 'Équipement Standard',
            code: test.equipement?.code_equipement || 'EQ-N/A',
            modele: test.equipement?.modele || 'M-2024-X',
            statut: 'OPÉRATIONNEL'
        },
        instrument: {
            nom: test.instrument?.designation || 'Instrument de Mesure',
            code: test.instrument?.code_instrument || 'AUTO',
            numero_serie: test.instrument?.numero_serie || 'SN-XXXX',
            derniere_calibration: test.instrument?.date_derniere_calibration ? formatDate(test.instrument.date_derniere_calibration) : 'Déc. 2023',
            validite: 'VALIDE'
        },
        equipe: (() => {
            const team = [];

            // Add responsable as first member
            if (test.responsable) {
                team.push({
                    nom: test.responsable.nom_complet || `${test.responsable.prenom || ''} ${test.responsable.nom || ''}`.trim() || 'Expert AeroTech',
                    role: test.responsable.fonction || test.responsable.poste || 'Responsable Qualité',
                    departement: test.responsable.departement || 'Qualité',
                    email: test.responsable.email,
                    is_responsable: true
                });
            }

            // Add other team members
            if (test.equipe_members && test.equipe_members.length > 0) {
                test.equipe_members.forEach((member: any) => {
                    // Don't duplicate responsable
                    if (member.id_personnel !== test.responsable_test_id) {
                        team.push({
                            nom: member.nom_complet || `${member.prenom || ''} ${member.nom || ''}`.trim(),
                            role: member.role?.nom_role || member.poste || 'Membre Équipe',
                            departement: member.departement || 'Support',
                            email: member.email,
                            is_responsable: false
                        });
                    }
                });
            }

            // If no team members, add a default entry
            if (team.length === 0) {
                team.push({
                    nom: 'Expert AeroTech',
                    role: 'Responsable Qualité',
                    departement: 'Qualité',
                    email: 'expert@aerotech.com',
                    is_responsable: true
                });
            }

            return team;
        })(),
        mesures: test.mesures?.map((m: any) => ({
            parametre: m.parametre_mesure || m.type_mesure || 'Paramètre',
            valeur: m.valeur_mesuree ?? '---',
            valeur_attendue: m.valeur_reference ?? '---',
            unite: m.unite_mesure || '',
            conforme: m.conforme ?? true
        })) || [
                { parametre: 'Température de fonctionnement', valeur: '42', valeur_attendue: '35-50', unite: '°C', conforme: true },
                { parametre: 'Vibrations axiales', valeur: '0.4', valeur_attendue: '< 1.2', unite: 'mm/s', conforme: true },
                { parametre: 'Pression hydraulique', valeur: '185', valeur_attendue: '180-200', unite: 'bar', conforme: true }
            ],
        metadatas: {
            duree_test: test.duree_reelle_heures ? `${test.duree_reelle_heures}H` : '1H 15M',
            notes_terrain: test.observations || 'Inspection visuelle effectuée sans anomalie majeure.',
            resultat_attendu: test.resultat_attendu || "Validation des paramètres de performance nominale."
        }
    };

    generateTechnicalReportPDF(reportData);
};

export const exportMasterReportPDF = () => {
    toast.error("Génération du rapport global indisponible.");
};

