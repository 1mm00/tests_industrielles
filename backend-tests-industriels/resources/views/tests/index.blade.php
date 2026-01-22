<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tests Industriels - Liste</title>
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
        
        .navbar h1 {
            font-size: 24px;
        }
        
        .navbar .user-info {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .btn-logout {
            padding: 8px 20px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
            text-decoration: none;
        }
        
        .btn-logout:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .container {
            max-width: 1400px;
            margin: 32px auto;
            padding: 0 20px;
        }
        
        .header-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        
        .btn-create {
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-create:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }
        
        .filters {
            background: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .filters input, .filters select {
            padding: 10px;
            border: 2px solid #e1e8ed;
            border-radius: 6px;
            margin-right: 12px;
            font-size: 14px;
        }
        
        .table-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            overflow: hidden;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        th, td {
            padding: 16px;
            text-align: left;
        }
        
        tbody tr {
            border-bottom: 1px solid #e1e8ed;
            transition: background 0.2s;
        }
        
        tbody tr:hover {
            background: #f8f9fa;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .badge-planifie {
            background: #fff3cd;
            color: #856404;
        }
        
        .badge-en-cours {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .badge-termine {
            background: #d4edda;
            color: #155724;
        }
        
        .badge-suspendu {
            background: #f8d7da;
            color: #721c24;
        }
        
        .actions {
            display: flex;
            gap: 8px;
        }
        
        .btn-action {
            padding: 6px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            text-decoration: none;
            transition: all 0.2s;
        }
        
        .btn-view {
            background: #e3f2fd;
            color: #1976d2;
        }
        
        .btn-edit {
            background: #fff3cd;
            color: #856404;
        }
        
        .btn-delete {
            background: #f8d7da;
            color: #721c24;
        }
        
        .btn-action:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        
        .empty-state svg {
            width: 100px;
            height: 100px;
            margin-bottom: 20px;
            opacity: 0.3;
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <h1>🏭 Tests Industriels</h1>
        <div class="user-info">
            <span>{{ auth()->user()->name ?? 'Utilisateur' }}</span>
            <form action="{{ route('logout') }}" method="POST" style="display: inline;">
                @csrf
                <button type="submit" class="btn-logout">Déconnexion</button>
            </form>
        </div>
    </nav>
    
    <div class="container">
        <div class="header-actions">
            <h2>Liste des Tests Industriels</h2>
            <a href="{{ route('tests.create') }}" class="btn-create">+ Nouveau Test</a>
        </div>
        
        <div class="filters">
            <form method="GET" action="{{ route('tests.index') }}" style="display: flex; align-items: center; gap: 12px;">
                <input type="text" name="search" placeholder="Rechercher..." value="{{ request('search') }}">
                <select name="statut">
                    <option value="">Tous les statuts</option>
                    <option value="PLANIFIE" {{ request('statut') == 'PLANIFIE' ? 'selected' : '' }}>Planifié</option>
                    <option value="EN_COURS" {{ request('statut') == 'EN_COURS' ? 'selected' : '' }}>En cours</option>
                    <option value="TERMINE" {{ request('statut') == 'TERMINE' ? 'selected' : '' }}>Terminé</option>
                    <option value="SUSPENDU" {{ request('statut') == 'SUSPENDU' ? 'selected' : '' }}>Suspendu</option>
                </select>
                <button type="submit" class="btn-action btn-view">Filtrer</button>
            </form>
        </div>
        
        <div class="table-container">
            @if(count($tests) > 0)
                <table>
                    <thead>
                        <tr>
                            <th>Numéro</th>
                            <th>Titre</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Statut</th>
                            <th>Résultat</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($tests as $test)
                        <tr>
                            <td><strong>{{ $test->numero_test }}</strong></td>
                            <td>{{ $test->titre ?? '-' }}</td>
                            <td>{{ $test->typeTest->libelle ?? 'N/A' }}</td>
                            <td>{{ $test->date_test ? $test->date_test->format('d/m/Y') : '-' }}</td>
                            <td>
                                <span class="badge badge-{{ strtolower($test->statut_test->value ?? $test->statut_test) }}">
                                    {{ $test->statut_test->value ?? $test->statut_test }}
                                </span>
                            </td>
                            <td>{{ $test->resultat_global->value ?? $test->resultat_global ?? '-' }}</td>
                            <td>
                                <div class="actions">
                                    <a href="{{ route('tests.show', $test->id_test) }}" class="btn-action btn-view">Voir</a>
                                    <a href="{{ route('tests.edit', $test->id_test) }}" class="btn-action btn-edit">Modifier</a>
                                    <form action="{{ route('tests.destroy', $test->id_test) }}" method="POST" style="display: inline;" onsubmit="return confirm('Êtes-vous sûr de vouloir supprimer ce test ?');">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn-action btn-delete">Supprimer</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h3>Aucun test trouvé</h3>
                    <p>Commencez par créer votre premier test industriel</p>
                </div>
            @endif
        </div>
    </div>
</body>
</html>
