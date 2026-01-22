<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Créer un Test</title>
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
            max-width: 900px;
            margin: 32px auto;
            padding: 0 20px;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .card h2 {
            color: #333;
            margin-bottom: 24px;
            font-size: 24px;
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
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e8ed;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .form-group textarea {
            min-height: 100px;
            resize: vertical;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .btn-submit {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
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
        }
        
        .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .alert-error {
            background: #fee;
            color: #c33;
            border: 1px solid #fcc;
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
            <h2>Créer un nouveau test industriel</h2>
            
            @if ($errors->any())
                <div class="alert alert-error">
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif
            
            <form action="{{ route('tests.store') }}" method="POST">
                @csrf
                
                <div class="form-group">
                    <label for="numero_test">Numéro de test *</label>
                    <input type="text" id="numero_test" name="numero_test" value="{{ old('numero_test', 'TEST-' . date('Y') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT)) }}" required>
                </div>
                
                <div class="form-group">
                    <label for="titre">Titre *</label>
                    <input type="text" id="titre" name="titre" value="{{ old('titre') }}" required>
                </div>
                
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description">{{ old('description') }}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="type_test_id">Type de test</label>
                        <select id="type_test_id" name="type_test_id">
                            <option value="">Sélectionner...</option>
                            @foreach($typesTests as $type)
                                <option value="{{ $type->id_type_test }}" {{ old('type_test_id') == $type->id_type_test ? 'selected' : '' }}>
                                    {{ $type->libelle }} ({{ $type->code_type }})
                                </option>
                            @endforeach
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="date_test">Date du test</label>
                        <input type="date" id="date_test" name="date_test" value="{{ old('date_test') }}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="statut_test">Statut</label>
                        <select id="statut_test" name="statut_test">
                            <option value="PLANIFIE">Planifié</option>
                            <option value="EN_COURS">En cours</option>
                            <option value="TERMINE">Terminé</option>
                            <option value="SUSPENDU">Suspendu</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="localisation">Localisation</label>
                        <input type="text" id="localisation" name="localisation" value="{{ old('localisation') }}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="observations_generales">Observations</label>
                    <textarea id="observations_generales" name="observations_generales">{{ old('observations_generales') }}</textarea>
                </div>
                
                <button type="submit" class="btn-submit">Créer le test</button>
            </form>
        </div>
    </div>
</body>
</html>
