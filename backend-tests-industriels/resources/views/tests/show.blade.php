<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Détails du Test - {{ $test->numero_test }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f7fa;
        }
        
        .navbar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .navbar a {
            color: white;
            text-decoration: none;
        }
        
        .container {
            max-width: 1000px;
            margin: 32px auto;
            padding: 0 20px;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            margin-bottom: 24px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
            border-bottom: 2px solid #f0f2f5;
            padding-bottom: 20px;
        }
        
        .header h2 {
            font-size: 28px;
            color: #333;
        }
        
        .badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .badge-planifie { background: #fff3cd; color: #856404; }
        .badge-en_cours { background: #d1ecf1; color: #0c5460; }
        .badge-termine { background: #d4edda; color: #155724; }
        .badge-suspendu { background: #f8d7da; color: #721c24; }
        
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
        }
        
        .info-group {
            margin-bottom: 20px;
        }
        
        .info-group label {
            display: block;
            font-size: 13px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
            font-weight: 600;
        }
        
        .info-group div {
            font-size: 16px;
            color: #333;
            font-weight: 500;
        }
        
        .section-title {
            font-size: 18px;
            color: #667eea;
            margin: 32px 0 16px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section-title::after {
            content: '';
            flex: 1;
            height: 2px;
            background: #f0f2f5;
        }
        
        .btn-back {
            display: inline-block;
            padding: 10px 20px;
            background: #e1e8ed;
            color: #333;
            text-decoration: none;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
            transition: background 0.2s;
        }
        
        .btn-back:hover {
            background: #d1d8dd;
        }
        
        .btn-edit {
            padding: 10px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .btn-edit:hover {
            background: #5a6fd6;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .obs-box {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
            border-left: 4px solid #667eea;
            margin-top: 8px;
            font-style: italic;
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <h1><a href="{{ route('dashboard') }}">🏭 Tests Industriels</a></h1>
    </nav>
    
    <div class="container">
        <a href="{{ route('tests.index') }}" class="btn-back">← Retour à la liste</a>
        
        <div class="card">
            <div class="header">
                <div>
                    <h2>{{ $test->numero_test }}</h2>
                    <p style="color: #666; margin-top: 4px;">{{ $test->titre }}</p>
                </div>
                <div>
                    <span class="badge badge-{{ strtolower($test->statut_test->value ?? $test->statut_test) }}">
                        {{ $test->statut_test->value ?? $test->statut_test }}
                    </span>
                </div>
            </div>
            
            <div class="section-title">Informations Générales</div>
            <div class="grid">
                <div class="info-group">
                    <label>Type de Test</label>
                    <div>{{ $test->typeTest->libelle ?? 'Non défini' }}</div>
                </div>
                <div class="info-group">
                    <label>Date du Test</label>
                    <div>{{ $test->date_test ? $test->date_test->format('d/m/Y') : 'Non renseignée' }}</div>
                </div>
                <div class="info-group">
                    <label>Localisation</label>
                    <div>{{ $test->localisation ?? 'N/A' }}</div>
                </div>
                <div class="info-group">
                    <label>Résultat Global</label>
                    <div style="font-weight: 700; color: {{ $test->resultat_global && $test->resultat_global->value == 'CONFORME' ? '#28a745' : '#dc3545' }}">
                        {{ $test->resultat_global->value ?? 'En attente' }}
                    </div>
                </div>
            </div>
            
            <div class="section-title">Description</div>
            <div class="info-group">
                <div>{{ $test->description ?? 'Aucune description fournie.' }}</div>
            </div>
            
            @if($test->observations_generales)
                <div class="section-title">Observations</div>
                <div class="obs-box">
                    {{ $test->observations_generales }}
                </div>
            @endif
            
            <div style="margin-top: 40px; display: flex; justify-content: flex-end; gap: 16px;">
                <a href="{{ route('tests.edit', $test->id_test) }}" class="btn-edit">Modifier ce test</a>
                <form action="{{ route('tests.destroy', $test->id_test) }}" method="POST" onsubmit="return confirm('Supprimer définitivement ce test ?');">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="btn-back" style="background: #f8d7da; color: #721c24; border: none; cursor: pointer; height: auto; margin-bottom: 0;">Supprimer</button>
                </form>
            </div>
        </div>
    </div>
</body>
</html>
