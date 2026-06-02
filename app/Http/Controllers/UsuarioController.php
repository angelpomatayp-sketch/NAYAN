<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        $usuarios = User::when($request->buscar, fn($q) => $q->where(fn($q2) =>
                $q2->where('name', 'like', '%'.$request->buscar.'%')
                   ->orWhere('email', 'like', '%'.$request->buscar.'%')
            ))
            ->when($request->rol, fn($q) => $q->where('rol', $request->rol))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Usuarios/Index', compact('usuarios'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:200',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'rol'      => 'required|in:admin,gerente,vendedor,almacen,logistica',
        ]);

        User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'rol'      => $request->rol,
            'activo'   => true,
        ]);

        return back()->with('success', 'Usuario creado exitosamente.');
    }

    public function update(Request $request, User $usuario)
    {
        $request->validate([
            'name'   => 'required|string|max:200',
            'email'  => 'required|email|unique:users,email,'.$usuario->id,
            'rol'    => 'required|in:admin,gerente,vendedor,almacen,logistica',
            'activo' => 'boolean',
        ]);

        $data = $request->only('name', 'email', 'rol');

        // No permitir que el admin se desactive a sí mismo
        if ($usuario->id !== auth()->id()) {
            $data['activo'] = $request->boolean('activo');
        }

        $usuario->update($data);

        return back()->with('success', 'Usuario actualizado.');
    }

    public function resetPassword(Request $request, User $usuario)
    {
        $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $usuario->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Contraseña restablecida.');
    }

    public function destroy(User $usuario)
    {
        if ($usuario->id === auth()->id()) {
            return back()->with('error', 'No puedes desactivar tu propia cuenta.');
        }

        $usuario->update(['activo' => false]);

        return back()->with('success', 'Usuario desactivado.');
    }
}
