<?php
namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductoController extends Controller
{
    public function index(Request $request)
    {
        $productos = Producto::with('categoria')->where('activo',1)
            ->when($request->buscar, fn($q) => $q->where(fn($q2) =>
                $q2->where('nombre','like','%'.$request->buscar.'%')
                   ->orWhere('codigo','like','%'.$request->buscar.'%')
            ))
            ->when($request->categoria, fn($q) => $q->where('categoria_id', $request->categoria))
            ->orderBy('nombre')->paginate(10)->through(fn($p)=>[
                ...$p->toArray(), 'stock_status'=>$p->stock_status, 'categoria_nombre'=>$p->categoria?->nombre
            ])->withQueryString();
        $categorias = Categoria::orderBy('nombre')->get();
        return Inertia::render('Productos/Index', compact('productos','categorias'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'codigo'=>'required|unique:productos,codigo','nombre'=>'required',
            'categoria_id'=>'nullable|exists:categorias,id',
            'precio_compra'=>'required|numeric|min:0','precio_venta'=>'required|numeric|min:0',
            'stock_actual'=>'required|integer|min:0','stock_minimo'=>'required|integer|min:0',
            'stock_reorden'=>'required|integer|min:0','ubicacion_almacen'=>'nullable|string',
        ]);
        Producto::create($request->all());
        return back()->with('success','Producto creado correctamente.');
    }

    public function update(Request $request, Producto $producto)
    {
        $request->validate([
            'codigo'=>'required|unique:productos,codigo,'.$producto->id,'nombre'=>'required',
            'precio_compra'=>'required|numeric|min:0','precio_venta'=>'required|numeric|min:0',
            'stock_minimo'=>'required|integer|min:0','stock_reorden'=>'required|integer|min:0',
        ]);
        $producto->update($request->all());
        return back()->with('success','Producto actualizado.');
    }

    public function destroy(Producto $producto)
    {
        $producto->update(['activo'=>false]);
        return back()->with('success','Producto desactivado.');
    }

    public function buscar(Request $request)
    {
        $q = $request->q ?? '';
        $productos = Producto::where('activo',1)
            ->where(fn($query) => $query->where('codigo','like',"%$q%")->orWhere('nombre','like',"%$q%"))
            ->where('stock_actual','>',0)
            ->limit(10)->get(['id','codigo','nombre','precio_venta','stock_actual']);
        return response()->json($productos);
    }
}
