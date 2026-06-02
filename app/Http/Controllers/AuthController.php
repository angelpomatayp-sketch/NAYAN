<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            if (!Auth::user()->activo) {
                Auth::logout();
                return back()->withErrors(['email' => 'Su cuenta está desactivada.']);
            }
            $request->session()->regenerate();
            return redirect()->route('home');
        }

        return back()->withErrors(['email' => 'Correo o contraseña incorrectos.']);
    }

    public function home()
    {
        return redirect()->to(match(auth()->user()->rol) {
            'admin', 'gerente' => '/dashboard',
            'vendedor'         => '/pedidos',
            'almacen'          => '/inventario',
            'logistica'        => '/picking',
            default            => '/pedidos',
        });
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }
}
