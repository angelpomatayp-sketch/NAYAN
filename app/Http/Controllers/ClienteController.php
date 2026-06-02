<?php
namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClienteController extends Controller
{
    public function index(Request $request)
    {
        $clientes = Cliente::where('activo',1)
            ->when($request->buscar, fn($q) => $q->where(fn($q2) =>
                $q2->where('nombre','like','%'.$request->buscar.'%')
                   ->orWhere('documento','like','%'.$request->buscar.'%')
                   ->orWhere('zona','like','%'.$request->buscar.'%')
            ))
            ->orderBy('nombre')->paginate(10)->withQueryString();
        return Inertia::render('Clientes/Index', compact('clientes'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'=>'required|string|max:200','documento'=>'nullable|string|max:20',
            'telefono'=>'nullable|string|max:20','email'=>'nullable|email',
            'zona'=>'nullable|string|max:50',
        ]);
        Cliente::create($request->all());
        return back()->with('success','Cliente registrado.');
    }

    public function update(Request $request, Cliente $cliente)
    {
        $cliente->update($request->validate([
            'nombre'    => 'required|string|max:200',
            'documento' => 'nullable|string|max:20',
            'telefono'  => 'nullable|string|max:20',
            'email'     => 'nullable|email',
            'zona'      => 'nullable|string|max:50',
            'direccion' => 'nullable|string',
        ]));
        return back()->with('success', 'Cliente actualizado.');
    }

    public function destroy(Cliente $cliente)
    {
        $cliente->update(['activo' => false]);
        return back()->with('success', 'Cliente eliminado.');
    }
}
