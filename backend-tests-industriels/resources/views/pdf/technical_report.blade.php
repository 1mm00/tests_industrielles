<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $rapport->numero_rapport }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #333; line-height: 1.6; }
        .header { border-bottom: 2px solid #1a202c; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #1a202c; }
        .report-title { font-size: 20px; font-weight: bold; text-align: right; margin-top: -30px; color: #2d3748; }
        .grid { width: 100%; margin-bottom: 20px; }
        .col { width: 50%; vertical-align: top; }
        .label { font-weight: bold; color: #4a5568; text-transform: uppercase; font-size: 9px; }
        .value { font-size: 11px; margin-bottom: 10px; }
        .section { margin-bottom: 30px; padding: 15px; background: #f7fafc; border-radius: 8px; }
        .section-title { font-size: 14px; font-weight: bold; border-left: 4px solid #3182ce; padding-left: 10px; margin-bottom: 15px; color: #2b6cb0; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #edf2f7; padding: 10px; text-align: left; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #cbd5e0; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
        .conforme { color: #38a169; font-weight: bold; }
        .non-conforme { color: #e53e3e; font-weight: bold; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #a0aec0; border-top: 1px solid #edf2f7; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">AERO<span style="color:#3182ce">TECH</span> INDUSTRIAL</div>
        <div class="report-title">RAPPORT DE TEST #{{ $rapport->numero_rapport }}</div>
    </div>

    <table class="grid">
        <tr>
            <td class="col">
                <div class="label">Informations Générales</div>
                <div class="value">
                    <strong>Type de Rapport:</strong> {{ $rapport->type_rapport }}<br>
                    <strong>Date d'Édition:</strong> {{ $rapport->date_edition->format('d/m/Y') }}<br>
                    <strong>Statut:</strong> {{ $rapport->statut }}<br>
                    <strong>Lieu:</strong> {{ $test->localisation ?? 'Site Principal' }}
                </div>
            </td>
            <td class="col" style="text-align: right;">
                <div class="label">Équipement Testé</div>
                <div class="value">
                    <strong>{{ $equipement->designation ?? 'N/A' }}</strong><br>
                    Matricule: {{ $equipement->code_equipement ?? 'N/A' }}<br>
                    Modèle: {{ $equipement->modele ?? 'N/A' }}<br>
                    Dernier Test: {{ $test->date_test?->format('d/m/Y') ?? 'N/A' }}
                </div>
            </td>
        </tr>
    </table>

    <div class="section">
        <div class="section-title">Résumé Exécutif</div>
        <p>{{ $rapport->resume_executif ?? 'Aucun résumé fourni pour ce rapport technique.' }}</p>
    </div>

    <div class="section">
        <div class="section-title">Données de Mesures & Conformité</div>
        <table>
            <thead>
                <tr>
                    <th>Paramètre</th>
                    <th>Valeur Mesurée</th>
                    <th>Unité</th>
                    <th>Résultat</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                @forelse($mesures as $mesure)
                <tr>
                    <td>{{ $mesure->nom_parametre }}</td>
                    <td>{{ $mesure->valeur_mesuree }}</td>
                    <td>{{ $mesure->unite_mesure }}</td>
                    <td class="{{ $mesure->conforme ? 'conforme' : 'non-conforme' }}">
                        {{ $mesure->conforme ? 'CONFORME' : 'NON-CONFORME' }}
                    </td>
                    <td>{{ $mesure->notes ?? '-' }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" style="text-align: center; color: #a0aec0;">Aucune mesure enregistrée</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Recommandations & Observations</div>
        <p>{{ $rapport->recommandations ?? 'Statu quo recommandé. Aucune intervention immédiate requise.' }}</p>
    </div>

    <table class="grid" style="margin-top: 50px;">
        <tr>
            <td class="col">
                <div class="label">Rédacteur</div>
                <div class="value">
                    <strong>{{ $redacteur->nom_complet }}</strong><br>
                    {{ $redacteur->role->nom_role ?? 'Expert' }}<br>
                    {{ $redacteur->email }}
                </div>
            </td>
            <td class="col" style="text-align: right;">
                <div class="label">Validation Qualité</div>
                <div class="value">
                    <strong>{{ $valideur->nom_complet ?? 'En attente' }}</strong><br>
                    {{ $rapport->date_validation ? $rapport->date_validation->format('d/m/Y') : 'Non validé' }}
                </div>
            </td>
        </tr>
    </table>

    <div class="footer">
        AeroTech Industrial Services - Certifié ISO 9001:2015 - Document confidentiel généré le {{ $date }}
    </div>
</body>
</html>
