<?php
namespace App\Http\Controllers;

use App\Models\Proveedor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProveedorController extends Controller
{
    public function index(Request $request)
    {
        $proveedores = Proveedor::where('activo',1)
            ->when($request->buscar, fn($q) => $q->where(fn($q2) =>
                $q2->where('nombre','like','%'.$request->buscar.'%')
                   ->orWhere('ruc','like','%'.$request->buscar.'%')
                   ->orWhere('contacto','like','%'.$request->buscar.'%')
            ))
            ->orderBy('nombre')->paginate(10)->withQueryString();
        return Inertia::render('Proveedores/Index', compact('proveedores'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'          => 'required|string|max:200',
            'ruc'             => 'nullable|string|max:20',
            'contacto'        => 'nullable|string|max:100',
            'telefono'        => 'nullable|string|max:20',
            'email'           => 'nullable|email',
            'direccion'       => 'nullable|string',
            'condiciones_pago'=> 'nullable|string|max:100',
            'calificacion'    => 'nullable|numeric|min:1|max:5',
        ]);
        Proveedor::create($data);
        return back()->with('success', 'Proveedor registrado.');
    }

    public function update(Request $request, Proveedor $proveedor)
    {
        $data = $request->validate([
            'nombre'          => 'required|string|max:200',
            'ruc'             => 'nullable|string|max:20',
            'contacto'        => 'nullable|string|max:100',
            'telefono'        => 'nullable|string|max:20',
            'email'           => 'nullable|email',
            'direccion'       => 'nullable|string',
            'condiciones_pago'=> 'nullable|string|max:100',
            'calificacion'    => 'nullable|numeric|min:1|max:5',
        ]);
        $proveedor->update($data);
        return back()->with('success', 'Proveedor actualizado.');
    }

    public function destroy(Proveedor $proveedor)
    {
        $proveedor->update(['activo' => false]);
        return back()->with('success', 'Proveedor eliminado.');
    }
}
