<?php

namespace App\Http\Controllers;

use App\Models\TestIndustriel;
use App\Models\TypeTest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TestController extends Controller
{
    public function index(Request $request)
    {
        $query = TestIndustriel::with('typeTest')->orderBy('created_at', 'desc');
        
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('numero_test', 'like', '%' . $request->search . '%')
                  ->orWhere('titre', 'like', '%' . $request->search . '%');
            });
        }
        
        if ($request->filled('statut')) {
            $query->where('statut_test', $request->statut);
        }
        
        $tests = $query->get();
        
        return view('tests.index', compact('tests'));
    }
    
    public function create()
    {
        $typesTests = TypeTest::all();
        return view('tests.create', compact('typesTests'));
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero_test' => 'required|unique:tests_industriels,numero_test',
            'titre' => 'required|string|max:300',
            'description' => 'nullable|string',
            'type_test_id' => 'nullable|uuid',
            'date_test' => 'nullable|date',
            'statut_test' => 'nullable|string',
            'localisation' => 'nullable|string',
            'observations_generales' => 'nullable|string',
        ]);
        
        $validated['id_test'] = Str::uuid()->toString();
        
        TestIndustriel::create($validated);
        
        return redirect()->route('tests.index')->with('success', 'Test créé avec succès !');
    }
    
    public function show(string $id)
    {
        $test = TestIndustriel::with(['typeTest', 'mesures', 'nonConformites'])->findOrFail($id);
        return view('tests.show', compact('test'));
    }
    
    public function edit(string $id)
    {
        $test = TestIndustriel::findOrFail($id);
        $typesTests = TypeTest::all();
        return view('tests.edit', compact('test', 'typesTests'));
    }
    
    public function update(Request $request, string $id)
    {
        $test = TestIndustriel::findOrFail($id);
        
        $validated = $request->validate([
            'numero_test' => 'required|unique:tests_industriels,numero_test,' . $id . ',id_test',
            'titre' => 'required|string|max:300',
            'description' => 'nullable|string',
            'type_test_id' => 'nullable|uuid',
            'date_test' => 'nullable|date',
            'statut_test' => 'nullable|string',
            'localisation' => 'nullable|string',
            'observations_generales' => 'nullable|string',
        ]);
        
        $test->update($validated);
        
        return redirect()->route('tests.index')->with('success', 'Test modifié avec succès !');
    }
    
    public function destroy(string $id)
    {
        $test = TestIndustriel::findOrFail($id);
        $test->delete();
        
        return redirect()->route('tests.index')->with('success', 'Test supprimé avec succès !');
    }
}
