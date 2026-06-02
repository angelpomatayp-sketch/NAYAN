<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Users ──────────────────────────────────────────
        $users = [
            ['name'=>'Administrador',         'email'=>'admin@nayan.com',    'rol'=>'admin'],
            ['name'=>'Gerente General',        'email'=>'gerente@nayan.com',  'rol'=>'gerente'],
            ['name'=>'Juan Pérez (Ventas)',    'email'=>'ventas@nayan.com',   'rol'=>'vendedor'],
            ['name'=>'María López (Almacén)', 'email'=>'almacen@nayan.com',  'rol'=>'almacen'],
            ['name'=>'Carlos Ruiz (Logística)','email'=>'logistica@nayan.com','rol'=>'logistica'],
        ];
        foreach ($users as $u) {
            User::firstOrCreate(['email' => $u['email']], array_merge($u, [
                'password' => Hash::make('admin123'),
                'activo'   => true,
            ]));
        }

        // ── Categorías ─────────────────────────────────────
        $cats = [
            ['nombre'=>'Protectores',       'descripcion'=>'Cases, fundas y protectores de pantalla'],
            ['nombre'=>'Cargadores',         'descripcion'=>'Cargadores rápidos, inalámbricos y adaptadores'],
            ['nombre'=>'Cables',             'descripcion'=>'Cables USB, Lightning, Type-C, Micro USB'],
            ['nombre'=>'Audio',              'descripcion'=>'Auriculares, audífonos y parlantes Bluetooth'],
            ['nombre'=>'Accesorios General', 'descripcion'=>'Soportes, anillos, selfie sticks y otros'],
        ];
        foreach ($cats as $c) DB::table('categorias')->insertOrIgnore($c + ['created_at'=>now(),'updated_at'=>now()]);

        // ── Productos ──────────────────────────────────────
        $productos = [
            ['codigo'=>'PRO-001','nombre'=>'Case Silicona iPhone 15',      'categoria_id'=>1,'precio_compra'=>8.00, 'precio_venta'=>18.00,'stock_actual'=>45,'stock_minimo'=>10,'stock_reorden'=>20,'ubicacion_almacen'=>'A-01'],
            ['codigo'=>'PRO-002','nombre'=>'Case Silicona Samsung S24',     'categoria_id'=>1,'precio_compra'=>8.00, 'precio_venta'=>18.00,'stock_actual'=>38,'stock_minimo'=>10,'stock_reorden'=>20,'ubicacion_almacen'=>'A-02'],
            ['codigo'=>'PRO-003','nombre'=>'Vidrio Templado iPhone 15',     'categoria_id'=>1,'precio_compra'=>4.00, 'precio_venta'=>12.00,'stock_actual'=>60,'stock_minimo'=>15,'stock_reorden'=>30,'ubicacion_almacen'=>'A-03'],
            ['codigo'=>'PRO-004','nombre'=>'Cargador Rápido 20W Type-C',   'categoria_id'=>2,'precio_compra'=>12.00,'precio_venta'=>28.00,'stock_actual'=>8, 'stock_minimo'=>10,'stock_reorden'=>20,'ubicacion_almacen'=>'B-01'],
            ['codigo'=>'PRO-005','nombre'=>'Cargador Inalámbrico 15W',     'categoria_id'=>2,'precio_compra'=>18.00,'precio_venta'=>45.00,'stock_actual'=>22,'stock_minimo'=>8, 'stock_reorden'=>15,'ubicacion_almacen'=>'B-02'],
            ['codigo'=>'PRO-006','nombre'=>'Cable USB-C a USB-C 1m',       'categoria_id'=>3,'precio_compra'=>5.00, 'precio_venta'=>12.00,'stock_actual'=>4, 'stock_minimo'=>15,'stock_reorden'=>25,'ubicacion_almacen'=>'C-01'],
            ['codigo'=>'PRO-007','nombre'=>'Cable Lightning 1m MFi',       'categoria_id'=>3,'precio_compra'=>6.00, 'precio_venta'=>15.00,'stock_actual'=>55,'stock_minimo'=>15,'stock_reorden'=>25,'ubicacion_almacen'=>'C-02'],
            ['codigo'=>'PRO-008','nombre'=>'Auriculares Bluetooth TWS',     'categoria_id'=>4,'precio_compra'=>25.00,'precio_venta'=>55.00,'stock_actual'=>18,'stock_minimo'=>8, 'stock_reorden'=>15,'ubicacion_almacen'=>'D-01'],
            ['codigo'=>'PRO-009','nombre'=>'Audífonos In-Ear 3.5mm',       'categoria_id'=>4,'precio_compra'=>8.00, 'precio_venta'=>20.00,'stock_actual'=>3, 'stock_minimo'=>10,'stock_reorden'=>20,'ubicacion_almacen'=>'D-02'],
            ['codigo'=>'PRO-010','nombre'=>'Soporte Magnético Auto',        'categoria_id'=>5,'precio_compra'=>10.00,'precio_venta'=>25.00,'stock_actual'=>30,'stock_minimo'=>8, 'stock_reorden'=>15,'ubicacion_almacen'=>'E-01'],
            ['codigo'=>'PRO-011','nombre'=>'Anillo Holder 360°',            'categoria_id'=>5,'precio_compra'=>3.00, 'precio_venta'=>8.00, 'stock_actual'=>75,'stock_minimo'=>20,'stock_reorden'=>35,'ubicacion_almacen'=>'E-02'],
            ['codigo'=>'PRO-012','nombre'=>'Parlante Bluetooth Portátil',   'categoria_id'=>4,'precio_compra'=>30.00,'precio_venta'=>65.00,'stock_actual'=>12,'stock_minimo'=>5, 'stock_reorden'=>10,'ubicacion_almacen'=>'D-03'],
            ['codigo'=>'PRO-013','nombre'=>'Power Bank 10000mAh',           'categoria_id'=>2,'precio_compra'=>20.00,'precio_venta'=>45.00,'stock_actual'=>6, 'stock_minimo'=>8, 'stock_reorden'=>15,'ubicacion_almacen'=>'B-03'],
            ['codigo'=>'PRO-014','nombre'=>'Case Antigolpe iPhone 15',      'categoria_id'=>1,'precio_compra'=>12.00,'precio_venta'=>30.00,'stock_actual'=>25,'stock_minimo'=>8, 'stock_reorden'=>15,'ubicacion_almacen'=>'A-04'],
            ['codigo'=>'PRO-015','nombre'=>'Cable Micro USB 2m',            'categoria_id'=>3,'precio_compra'=>4.00, 'precio_venta'=>10.00,'stock_actual'=>40,'stock_minimo'=>15,'stock_reorden'=>30,'ubicacion_almacen'=>'C-03'],
        ];
        foreach ($productos as $p) {
            DB::table('productos')->insertOrIgnore($p + ['activo'=>1,'created_at'=>now(),'updated_at'=>now()]);
        }

        // ── Proveedores ────────────────────────────────────
        $provs = [
            ['nombre'=>'TechAccessories SAC',     'ruc'=>'20123456789','contacto'=>'Jorge Ríos',   'telefono'=>'987654321','email'=>'jrios@techacc.com',   'condiciones_pago'=>'30 días','calificacion'=>4.5],
            ['nombre'=>'Importaciones Galaxy EIRL','ruc'=>'20987654321','contacto'=>'Ana Flores',   'telefono'=>'976543210','email'=>'aflores@galaxy.com',  'condiciones_pago'=>'15 días','calificacion'=>4.2],
            ['nombre'=>'Distribuidora MovilPeru',  'ruc'=>'20567891234','contacto'=>'Pedro Castro', 'telefono'=>'965432109','email'=>'pcastro@movilperu.com','condiciones_pago'=>'Contado','calificacion'=>3.8],
            ['nombre'=>'ChinaTech Distribution',   'ruc'=>'20345678901','contacto'=>'María Wong',   'telefono'=>'954321098','email'=>'mwong@chinatech.com', 'condiciones_pago'=>'45 días','calificacion'=>4.0],
        ];
        foreach ($provs as $p) DB::table('proveedores')->insertOrIgnore($p + ['activo'=>1,'created_at'=>now(),'updated_at'=>now()]);

        // ── Clientes ────────────────────────────────────────
        $clientes = [
            ['nombre'=>'Electrónica Moderna SAC', 'documento'=>'20456789012','telefono'=>'987123456','zona'=>'Lima Centro'],
            ['nombre'=>'Tienda MovilMax',           'documento'=>'10234567890','telefono'=>'976234567','zona'=>'Lima Centro'],
            ['nombre'=>'Distribuidora TecnoPlus',   'documento'=>'20876543210','telefono'=>'965345678','zona'=>'Lima Sur'],
            ['nombre'=>'Super Celulares EIRL',      'documento'=>'10345678901','telefono'=>'954456789','zona'=>'Lima Norte'],
            ['nombre'=>'Tech Store Lima',            'documento'=>'20654321098','telefono'=>'943567890','zona'=>'Lima Centro'],
            ['nombre'=>'Accesorios Express',         'documento'=>'10456789012','telefono'=>'932678901','zona'=>'Lima Sur'],
        ];
        foreach ($clientes as $c) DB::table('clientes')->insertOrIgnore($c + ['activo'=>1,'created_at'=>now(),'updated_at'=>now()]);

        // ── Datos Financieros (6 meses) ────────────────────
        $finData = [
            ['periodo'=>'2025-12-01','utilidad_neta'=>8500,'ventas_netas'=>85000,'activos_totales'=>250000,'costos_logisticos'=>9200],
            ['periodo'=>'2026-01-01','utilidad_neta'=>9200,'ventas_netas'=>88000,'activos_totales'=>252000,'costos_logisticos'=>9500],
            ['periodo'=>'2026-02-01','utilidad_neta'=>7800,'ventas_netas'=>82000,'activos_totales'=>248000,'costos_logisticos'=>9100],
            ['periodo'=>'2026-03-01','utilidad_neta'=>10500,'ventas_netas'=>95000,'activos_totales'=>258000,'costos_logisticos'=>10200],
            ['periodo'=>'2026-04-01','utilidad_neta'=>11200,'ventas_netas'=>98000,'activos_totales'=>261000,'costos_logisticos'=>9800],
            ['periodo'=>'2026-05-01','utilidad_neta'=>9800,'ventas_netas'=>91000,'activos_totales'=>255000,'costos_logisticos'=>9600],
        ];
        foreach ($finData as $f) DB::table('datos_financieros')->insertOrIgnore($f + ['created_at'=>now(),'updated_at'=>now()]);

        // ── Movimientos iniciales de inventario ─────────────
        $movimientos = [
            [1,'entrada',50,0,50,'Stock inicial - apertura'],
            [2,'entrada',40,0,40,'Stock inicial - apertura'],
            [3,'entrada',60,0,60,'Stock inicial - apertura'],
            [4,'entrada',15,0,15,'Stock inicial - apertura'],
            [5,'entrada',25,0,25,'Stock inicial - apertura'],
            [6,'entrada',10,0,10,'Stock inicial - apertura'],
            [6,'salida',6,10,4,'Venta a clientes - semana 1'],
            [9,'entrada',10,0,10,'Stock inicial - apertura'],
            [9,'salida',7,10,3,'Venta a clientes - semana 1'],
        ];
        foreach ($movimientos as $m) {
            DB::table('inventario_movimientos')->insert([
                'producto_id'=>$m[0],'tipo'=>$m[1],'cantidad'=>$m[2],
                'stock_anterior'=>$m[3],'stock_nuevo'=>$m[4],'motivo'=>$m[5],
                'usuario_id'=>1,'fecha_hora'=>now()->subDays(rand(1,30)),
            ]);
        }

        $this->command->info('✅ Base de datos NAYAN sembrada con datos de muestra.');
    }
}
