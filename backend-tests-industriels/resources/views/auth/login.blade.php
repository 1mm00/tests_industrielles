<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Tests Industriels</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .login-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            width: 100%;
            max-width: 420px;
        }
        
        .login-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .login-header h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 8px;
        }
        
        .login-header p {
            color: #666;
            font-size: 14px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e8ed;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .btn-login {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .btn-login:active {
            transform: translateY(0);
        }
        
        .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .alert-error {
            background: #fee;
            color: #c33;
            border: 1px solid #fcc;
        }
        
        .alert-success {
            background: #efe;
            color: #3c3;
            border: 1px solid #cfc;
        }
        
        .test-accounts {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .test-accounts h3 {
            color: #333;
            font-size: 14px;
            margin-bottom: 12px;
        }
        
        .test-account {
            background: white;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 8px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .test-account:hover {
            background: #e9ecef;
        }
        
        .test-account strong {
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <h1>🏭 Tests Industriels</h1>
            <p>Authentification Backend Laravel 10</p>
        </div>
        
        @if(session('error'))
            <div class="alert alert-error">
                {{ session('error') }}
            </div>
        @endif
        
        @if(session('success'))
            <div class="alert alert-success">
                {{ session('success') }}
            </div>
        @endif
        
        <form action="{{ route('login.post') }}" method="POST">
            @csrf
            
            <div class="form-group">
                <label for="email">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value="{{ old('email') }}"
                    placeholder="admin@tests-industriels.com"
                    required
                >
            </div>
            
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••"
                    required
                >
            </div>
            
            <button type="submit" class="btn-login">
                Se connecter
            </button>
        </form>
        
        <div class="test-accounts">
            <h3>Comptes de test (cliquer pour remplir)</h3>
            <div class="test-account" onclick="fillForm('admin@tests.com', 'password')">
                <strong>Admin</strong> - Accès complet
            </div>
            <div class="test-account" onclick="fillForm('ingenieur@tests.com', 'password')">
                <strong>Ingénieur</strong> - Création/gestion tests
            </div>
            <div class="test-account" onclick="fillForm('technicien@tests.com', 'password')">
                <strong>Technicien</strong> - Exécution tests
            </div>
            <div class="test-account" onclick="fillForm('lecteur@tests.com', 'password')">
                <strong>Lecteur</strong> - Consultation seule
            </div>
        </div>
    </div>
    
    <script>
        function fillForm(email, password) {
            document.getElementById('email').value = email;
            document.getElementById('password').value = password;
        }
    </script>
</body>
</html>
