<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Tests Industriels</title>
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
            display: inline-block;
        }
        
        .btn-logout:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .container {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            margin-bottom: 24px;
        }
        
        .card h2 {
            color: #333;
            margin-bottom: 16px;
            font-size: 22px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border-left: 4px solid #667eea;
        }
        
        .stat-card h3 {
            color: #666;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .stat-card .value {
            color: #333;
            font-size: 32px;
            font-weight: 700;
        }
        
        .info-list {
            list-style: none;
        }
        
        .info-list li {
            padding: 12px 0;
            border-bottom: 1px solid #e1e8ed;
            display: flex;
            justify-content: space-between;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list strong {
            color: #667eea;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .badge-success {
            background: #d4edda;
            color: #155724;
        }
        
        .api-endpoints {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            margin-top: 16px;
        }
        
        .api-endpoints code {
            display: block;
            padding: 8px 12px;
            background: #343a40;
            color: #00ff00;
            border-radius: 4px;
            margin-bottom: 8px;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <h1>🏭 Tests Industriels - Dashboard</h1>
        <div class="user-info">
            <span>{{ auth()->user()->name ?? 'Utilisateur' }}</span>
            <form action="{{ route('logout') }}" method="POST" style="display: inline;">
                @csrf
                <button type="submit" class="btn-logout">Déconnexion</button>
            </form>
        </div>
    </nav>
    
    <div class="container">
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Statut Authentification</h3>
                <div class="value">✅</div>
            </div>
            <div class="stat-card">
                <h3>Rôle Utilisateur</h3>
                <div class="value">{{ auth()->user()->role ?? 'N/A' }}</div>
            </div>
            <div class="stat-card">
                <h3>API Token</h3>
                <div class="value">🔑</div>
            </div>
        </div>
        
        <div class="card">
            <h2>Informations Utilisateur</h2>
            <ul class="info-list">
                <li>
                    <strong>ID</strong>
                    <span>{{ auth()->user()->id }}</span>
                </li>
                <li>
                    <strong>Nom</strong>
                    <span>{{ auth()->user()->name }}</span>
                </li>
                <li>
                    <strong>Email</strong>
                    <span>{{ auth()->user()->email }}</span>
                </li>
                <li>
                    <strong>Status</strong>
                    <span class="badge badge-success">Connecté</span>
                </li>
            </ul>
        </div>
        
        <div class="card">
            <h2>API Endpoints Disponibles</h2>
            <p style="color: #666; margin-bottom: 16px;">
                Utilisez ces endpoints pour tester l'API REST /api/v1/tests
            </p>
            
            <div class="api-endpoints">
                <code>GET    /api/v1/tests - Liste tous les tests</code>
                <code>POST   /api/v1/tests - Créer un nouveau test</code>
                <code>GET    /api/v1/tests/{id} - Afficher un test</code>
                <code>PUT    /api/v1/tests/{id} - Mettre à jour un test</code>
                <code>DELETE /api/v1/tests/{id} - Supprimer un test</code>
                <code>POST   /api/v1/tests/{id}/demarrer - Démarrer un test</code>
                <code>POST   /api/v1/tests/{id}/terminer - Terminer un test</code>
            </div>
        </div>
        
        <div class="card">
            <h2>Documentation API</h2>
            <p style="color: #666;">
                La documentation complète de l'API est disponible via Scramble :
            </p>
            <div style="margin-top: 16px;">
                <a href="/docs/api" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 600;">
                    📚 Ouvrir la documentation API →
                </a>
            </div>
        </div>
    </div>
</body>
</html>
