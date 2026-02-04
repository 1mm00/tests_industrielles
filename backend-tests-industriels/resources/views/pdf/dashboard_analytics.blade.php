<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Rapport Analytique Exécutif - {{ $date }}</title>
    <style>
        @page { margin: 0; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 0; color: #1e293b; background: #ffffff; }
        
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(226, 232, 240, 0.4);
            z-index: -1000;
            white-space: nowrap;
            font-weight: 900;
        }

        .header {
            background: #0f172a;
            color: #ffffff;
            padding: 40px;
            overflow: hidden;
        }

        .logo {
            float: left;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -1px;
        }

        .logo span { color: #3b82f6; }

        .header-meta {
            float: right;
            text-align: right;
        }

        .header-meta .title {
            font-size: 18px;
            font-weight: 900;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .header-meta .date {
            font-size: 12px;
            color: #94a3b8;
            font-weight: 700;
        }

        .content { padding: 40px; }

        /* Score Bar */
        .health-score {
            margin-bottom: 40px;
            background: #f8fafc;
            padding: 25px;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
        }

        .health-score-title {
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #64748b;
            margin-bottom: 15px;
        }

        .score-bar-container {
            height: 12px;
            background: #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 10px;
        }

        .score-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #06b6d4);
            border-radius: 6px;
        }

        .score-value {
            font-size: 24px;
            font-weight: 900;
            color: #0f172a;
        }

        /* Sections */
        .section-title {
            font-size: 14px;
            font-weight: 900;
            text-transform: uppercase;
            color: #0f172a;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #3b82f6;
            width: fit-content;
        }

        .grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .grid th {
            text-align: left;
            background: #f1f5f9;
            padding: 12px;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            color: #475569;
        }

        .grid td {
            padding: 12px;
            font-size: 11px;
            border-bottom: 1px solid #f1f5f9;
        }

        .badge {
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
        }

        .badge-critical { background: #fee2e2; color: #b91c1c; }
        .badge-warning { background: #ffedd5; color: #c2410c; }
        .badge-success { background: #dcfce7; color: #15803d; }

        /* Performance Simulation (Bar Chart) */
        .perf-chart {
            margin-bottom: 40px;
            display: table;
            width: 100%;
            height: 150px;
        }

        .chart-bar-container {
            display: table-cell;
            vertical-align: bottom;
            text-align: center;
            padding: 0 5px;
        }

        .chart-bar {
            background: #3b82f6;
            width: 25px;
            margin: 0 auto;
            border-radius: 4px 4px 0 0;
        }

        .chart-label {
            font-size: 8px;
            font-weight: 700;
            color: #94a3b8;
            margin-top: 8px;
        }

        /* Recommendations */
        .recommendations {
            background: #fff7ed;
            border-left: 4px solid #f97316;
            padding: 20px;
            border-radius: 0 12px 12px 0;
            margin-top: 30px;
        }

        .rec-title {
            font-size: 12px;
            font-weight: 900;
            color: #9a3412;
            margin-bottom: 10px;
            text-transform: uppercase;
        }

        .rec-text { font-size: 11px; color: #c2410c; font-style: italic; }

        .footer {
            position: fixed;
            bottom: 40px;
            left: 40px;
            right: 40px;
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="watermark">AEROTECH CONFIDENTIAL</div>

    <div class="header">
        <div class="logo">AERO<span>TECH</span> INDUSTRIAL</div>
        <div class="header-meta">
            <div class="title">Rapport Analytique Executive</div>
            <div class="date">ID: ANL-{{ date('Ymd') }}-{{ rand(1000, 9999) }} • Généré le {{ $date }}</div>
        </div>
    </div>

    <div class="content">
        <!-- Score Bar -->
        <div class="health-score">
            <div class="health-score-title">Score de Santé Industrielle Global</div>
            <div class="score-value">{{ $kpis['taux_conformite'] }}%</div>
            <div class="score-bar-container">
                <div class="score-bar-fill" style="width: {{ $kpis['taux_conformite'] }}%"></div>
            </div>
            <div style="font-size: 9px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Performance basée sur {{ $kpis['tests_totaux'] }} tests d'intégrité</div>
        </div>

        <!-- Performance Chart Simulation -->
        <div class="section-title">Performance & Qualité (12 Mois)</div>
        <div class="perf-chart">
            @foreach($performance as $data)
            <div class="chart-bar-container">
                <div class="chart-bar" style="height: {{ ($data['tests_conformes'] / max(1, $data['tests_reussis'])) * 100 }}px; background: {{ $data['tests_conformes'] == $data['tests_reussis'] ? '#059669' : ($data['tests_conformes'] < ($data['tests_reussis'] * 0.8) ? '#dc2626' : '#3b82f6') }}"></div>
                <div class="chart-label">{{ $data['mois'] }}</div>
            </div>
            @endforeach
        </div>

        <!-- Critical Alerts -->
        <div class="section-title">Alertes Qualité Critiques (Non Traitées)</div>
        <table class="grid">
            <thead>
                <tr>
                    <th>ID NC</th>
                    <th>Équipement</th>
                    <th>Criticité</th>
                    <th>Date Détection</th>
                    <th>Statut Actuel</th>
                </tr>
            </thead>
            <tbody>
                @foreach($critical_alerts as $alert)
                <tr>
                    <td><strong>{{ $alert->numero_nc }}</strong></td>
                    <td>{{ $alert->equipement?->designation }}</td>
                    <td><span class="badge badge-critical">{{ $alert->criticite->libelle ?? 'N/A' }}</span></td>
                    <td>{{ $alert->date_detection->format('d/m/Y') }}</td>
                    <td>{{ $alert->statut }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Team Stats -->
        <div class="section-title">Statistiques d'Intervention par Département</div>
        <table class="grid">
            <thead>
                <tr>
                    <th>Département</th>
                    <th>Volume Personnel</th>
                    <th>Total Interventions</th>
                    <th>Responsable Principal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($team_stats as $stat)
                <tr>
                    <td>{{ $stat['departement'] }}</td>
                    <td>{{ $stat['count'] }} personnel</td>
                    <td>{{ $stat['interventions'] }} tests</td>
                    <td>{{ $stat['responsable'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Dynamic Recommendations -->
        @if($kpis['taux_conformite'] < 80)
        <div class="recommendations">
            <div class="rec-title">⚠ Alert: Recommandations Stratégiques Actionnables</div>
            <div class="rec-text">Le taux de conformité est inférieur au seuil critique de 80%. Une révision immédiate des protocoles de maintenance préventive pour le Bureau d'Essais et un audit des instruments de mesure sont impérativement requis pour stabiliser la ligne de production.</div>
        </div>
        @else
        <div class="recommendations" style="background: #f0fdf4; border-left-color: #22c55e;">
             <div class="rec-title" style="color: #166534;">✓ Rapport d'Intégrité : Statut Optimal</div>
             <div class="rec-text" style="color: #15803d;">Les opérations techniques maintiennent un niveau d'excellence opérationnelle. Continuez le suivi métrologique programmé sans intervention corrective nécessaire.</div>
        </div>
        @endif
    </div>

    <div class="footer">
        AeroTech Industrial Services - Certifié ISO 9001:2015 & EN 9100 - Document strictement confidentiel destiné à la Direction Technique.
    </div>
</body>
</html>
