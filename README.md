# NAYAN Mobile Accessories — Sistema de Gestión Logística

> **Sistema web de gestión logística para NAYAN Mobile Accessories.**
> Desarrollado con Laravel 12 + React 18 + Inertia.js v2 + Tailwind CSS v4.

---

## Índice

1. [Accesos al Sistema](#1-accesos-al-sistema)
2. [Requisitos e Instalación](#2-requisitos-e-instalación)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Arquitectura del Sistema](#4-arquitectura-del-sistema)
5. [Flujo de Funcionamiento](#5-flujo-de-funcionamiento)
6. [Módulos del Sistema](#6-módulos-del-sistema)
7. [Indicadores KPI — Cumplimiento Documental](#7-indicadores-kpi--cumplimiento-documental)
8. [Checklist de Cumplimiento](#8-checklist-de-cumplimiento)
9. [Estructura de Archivos](#9-estructura-de-archivos)
10. [Comandos Útiles](#10-comandos-útiles)

---

## 1. Accesos al Sistema

### URL de Acceso
```
http://localhost:8080
```

### Usuarios Creados por el Seeder

| Nombre | Correo | Contraseña | Rol | Redirige a |
|--------|--------|------------|-----|------------|
| Administrador Sistema | `admin@nayan.com` | `admin123` | admin | `/dashboard` |
| Gerente General | `gerente@nayan.com` | `admin123` | gerente | `/dashboard` |
| Juan Pérez (Ventas) | `ventas@nayan.com` | `admin123` | vendedor | `/pedidos` |
| María López (Almacén) | `almacen@nayan.com` | `admin123` | almacen | `/inventario` |
| Carlos Ruiz (Logística) | `logistica@nayan.com` | `admin123` | logistica | `/picking` |

### Permisos por Rol

| Módulo / Acción | admin | gerente | vendedor | almacen | logistica |
|---|:---:|:---:|:---:|:---:|:---:|
| **Dashboard** (KPIs) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Inventario** — ver lista y Kardex | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Inventario** — registrar movimientos y conteo | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Pedidos** — ver lista y detalle | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Pedidos** — crear nuevo pedido | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Pedidos** — cambiar estado | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Integración Operativa** — enviar y atender | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Picking y Despacho** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Compras** — ver lista | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Compras** — crear y recibir mercadería | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Catálogo Productos** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Catálogo Clientes** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Catálogo Proveedores** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Reportes y Exportar CSV** | ✅ | ✅ | ❌ | ❌ | ❌ |

### Base de Datos
```
Host:     localhost
Puerto:   3306
BD:       nayan_db
Usuario:  root
Clave:    (vacía en XAMPP)
```

---

## 2. Requisitos e Instalación

### Requisitos
- PHP 8.2+
- Composer 2+
- Node.js 18+ y NPM
- MySQL 5.7+ (XAMPP recomendado para desarrollo)
- PostgreSQL 15+ (para producción)

### Instalación paso a paso

```bash
# 1. Clonar / navegar al proyecto
cd c:\xampp\htdocs\NAYAN

# 2. Instalar dependencias PHP
composer install

# 3. Instalar dependencias JavaScript
npm install --legacy-peer-deps

# 4. Copiar variables de entorno (ya configurado)
# Verificar .env: DB_CONNECTION=mysql, DB_DATABASE=nayan_db

# 5. Crear base de datos y poblar con datos de muestra
php artisan migrate:fresh --seed

# 6. Compilar assets para producción
npm run build

# 7. Iniciar servidor de desarrollo
php artisan serve --port=8080
```

Acceder a: **http://localhost:8080**

### Desarrollo con Hot-Reload (dos terminales)
```bash
# Terminal 1
php artisan serve --port=8080

# Terminal 2
npm run dev
```

---

## 3. Stack Tecnológico

| Capa | Tecnología | Versión | Función |
|------|-----------|---------|---------|
| Backend | Laravel | 12 | Framework PHP, routing, ORM, API |
| Lenguaje | PHP | 8.2 | Lógica de negocio y cálculo de KPIs |
| Frontend | React | 19 | Interfaz de usuario SPA |
| Puente SPA | Inertia.js | 2 | Conecta Laravel con React sin API REST |
| Estilos | Tailwind CSS | 4 | Diseño responsive utility-first |
| Build | Vite | 8 | Bundler ultrarrápido con HMR |
| Gráficos | Chart.js | auto | Gráficos de KPIs y tendencias |
| Iconos | Lucide React | — | Iconografía del sistema |
| BD Desarrollo | MySQL | 5.7+ | Base de datos local (XAMPP) |
| BD Producción | PostgreSQL | 15+ | Base de datos en servidor |

---

## 4. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                            │
│  React 18 + Inertia.js + Tailwind CSS + Chart.js           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (Inertia Protocol)
┌──────────────────────────▼──────────────────────────────────┐
│                    LARAVEL 12 (PHP 8.2)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Routes    │  │ Controllers  │  │    Middleware     │   │
│  │  web.php    │→ │  (Inertia::  │→ │ Auth + Inertia   │   │
│  │             │  │   render())  │  │ HandleRequests   │   │
│  └─────────────┘  └──────┬───────┘  └──────────────────┘   │
│                          │                                  │
│  ┌───────────────────────▼─────────────────────────────┐   │
│  │              Eloquent ORM / DB Queries               │   │
│  └───────────────────────┬─────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              MySQL (dev) / PostgreSQL (prod)                 │
│   17 tablas: productos, pedidos, despachos, requerimientos  │
│              ordenes_compra, conteos_fisicos, etc.          │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Flujo de Funcionamiento

### Flujo General del Sistema

```
USUARIO INGRESA
     │
     ▼
┌─────────────┐
│    LOGIN     │  admin@nayan.com / admin123
│  (Auth)      │  Valida rol y activo
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│                DASHBOARD GERENCIAL                   │
│  Visualiza 9 KPIs en tiempo real con semáforos      │
│  Verde ✓ | Amarillo ⚠ | Rojo ✗                     │
└─────────┬──────────────────────────────────────────┘
          │
    ┌─────┴──────────────────────────────────────┐
    │                                            │
    ▼                                            ▼
FLUJO OPERATIVO                        FLUJO DE COMPRAS
    │                                            │
    ▼                                            ▼
[M2] NUEVO PEDIDO            [M5] PROVEEDOR DETECTA STOCK BAJO
  • Validación stock          • Sistema genera alerta reorden
  • Registro timestamp        • Se crea Orden de Compra
  • Auto-genera Despacho      • Registro fecha_solicitud (TPRI inicio)
    │                                            │
    ▼                                            ▼
[M3] NOTIFICACIÓN INTERNA    [M5] RECEPCIÓN DE MERCADERÍA
  • Área Ventas → Almacén     • Actualiza stock automáticamente
  • Timestamp envío/recepción • Registra fecha_recepcion (TPRI fin)
  • Calcula TAFI              • Crea movimiento KARDEX (entrada)
    │                                            │
    ▼                                            ▼
[M4] PICKING DIGITAL         [M1] INVENTARIO ACTUALIZADO
  • Lista de picking          • Kardex actualizado en tiempo real
  • Confirmar ítem por ítem   • Alertas si stock ≤ punto reorden
  • Registrar errores         • Conteo físico → calcula EI
  • Costos: flete+embalaje    
  • Calcula PEPD y CLP        
    │
    ▼
[M2] PEDIDO DESPACHADO
  • Timestamp fecha_despacho
  • Calcula TPPP automático
    │
    ▼
[M6] DASHBOARD ACTUALIZADO
  • Todos los KPIs recalculados
  • Gráficos históricos actualizados
  • Exportar a CSV para SPSS v26
```

### Flujo de Cálculo de KPIs

```
┌────────────────────────────────────────────────────────────┐
│  MÓDULO 5 → TPRI                                           │
│  fecha_solicitud_reposicion → fecha_recepcion_OC           │
│  TPRI = AVG(TIMESTAMPDIFF(DAY, solicitud, recepcion))      │
├────────────────────────────────────────────────────────────┤
│  MÓDULO 3 → TAFI                                           │
│  fecha_envio_requerimiento → fecha_atencion                │
│  TAFI = AVG(TIMESTAMPDIFF(MINUTE, envio, atencion))        │
├────────────────────────────────────────────────────────────┤
│  MÓDULO 2 → TPPP                                           │
│  fecha_entrada_pedido → fecha_despacho                     │
│  TPPP = AVG(TIMESTAMPDIFF(HOUR, entrada, despacho))        │
├────────────────────────────────────────────────────────────┤
│  MÓDULO 1 → EI                                             │
│  conteo_fisico: cantidad_sistema vs cantidad_fisica        │
│  EI = (correctos / total) × 100                           │
├────────────────────────────────────────────────────────────┤
│  MÓDULO 4 → PEPD                                           │
│  despachos con tiene_error=1 / total despachos × 100      │
├────────────────────────────────────────────────────────────┤
│  MÓDULO 4 → CLP                                            │
│  AVG(costo_flete + costo_embalaje + costo_personal)        │
├────────────────────────────────────────────────────────────┤
│  DATOS FINANCIEROS → ROA, MN, CL/V                        │
│  Tabla datos_financieros (registro manual mensual)         │
│  ROA = utilidad_neta / activos_totales × 100               │
│  MN  = utilidad_neta / ventas_netas × 100                  │
│  CLV = costos_logisticos / ventas_netas × 100              │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Módulos del Sistema

### Módulo 1 — Gestión de Inventarios (`/inventario`)
**Objetivo:** Automatizar el control de stock en tiempo real, eliminando registros manuales.

| Funcionalidad | Implementado | Descripción |
|---|:---:|---|
| Kardex digital | ✅ | Registro automático de entradas y salidas con usuario, fecha, hora y motivo |
| Alertas automáticas de stock | ✅ | Badge rojo/amarillo cuando stock ≤ mínimo/reorden |
| Registro de movimientos | ✅ | Entrada, salida, ajuste con modal rápido |
| Conteo físico de inventario | ✅ | Hoja de conteo con cálculo automático de EI |
| Historial completo | ✅ | Vista Kardex por producto con exportación CSV |
| Rotación de inventario | ✅ | Visible en movimientos ordenados por fecha |
| **KPI que alimenta** | | **Exactitud de Inventario (EI) — Dimensión 4** |

### Módulo 2 — Pedidos y Ventas (`/pedidos`)
**Objetivo:** Digitalizar el ciclo completo de un pedido, desde ingreso hasta despacho.

| Funcionalidad | Implementado | Descripción |
|---|:---:|---|
| Registro digital de pedidos | ✅ | Formulario con validación de stock en tiempo real |
| Generación automática de despacho | ✅ | Al confirmar pedido, se crea despacho automáticamente |
| Timestamps automáticos | ✅ | fecha_entrada y fecha_despacho con timestamp preciso |
| Clasificación por tipo/cliente/zona | ✅ | Campos tipo (minorista/mayorista), zona, cliente |
| Seguimiento de estado | ✅ | Registrado → En Preparación → Despachado → Entregado |
| Historial de ventas | ✅ | Lista paginada con filtros y totales |
| **KPI que alimenta** | | **TPPP (Tiempo Promedio Procesamiento Pedido) — Dimensión 3** |

### Módulo 3 — Integración Operativa (`/integracion`)
**Objetivo:** Reemplazar WhatsApp/llamadas por sistema de notificaciones internas registradas.

| Funcionalidad | Implementado | Descripción |
|---|:---:|---|
| Notificaciones inter-área | ✅ | Ventas ↔ Almacén ↔ Logística ↔ Administración |
| Timestamp de envío y lectura | ✅ | fecha_envio y fecha_atencion automáticos |
| Categorización y prioridad | ✅ | Tipos: Baja / Media / Alta / Urgente con colores |
| Panel de pendientes | ✅ | Lista con estado: Pendiente / En Atención / Atendido |
| Respuesta a requerimientos | ✅ | Formulario inline de respuesta con cambio de estado |
| Cálculo TAFI en panel | ✅ | Promedio de minutos de respuesta mostrado en stats |
| **KPI que alimenta** | | **TAFI (Tiempo Promedio Flujo de Información) — Dimensión 2** |

### Módulo 4 — Picking Digital y Despacho (`/picking`)
**Objetivo:** Eliminar errores de picking mediante listas digitales verificables.

| Funcionalidad | Implementado | Descripción |
|---|:---:|---|
| Lista de picking digital | ✅ | Generada automáticamente desde el pedido con ubicación en almacén |
| Confirmación ítem por ítem | ✅ | Botón OK / Error por cada producto |
| Registro de incidencias | ✅ | Tipos: producto incorrecto, cantidad errónea, destino equivocado |
| Registro de costos logísticos | ✅ | Flete + Embalaje + Personal = CLP por despacho |
| Estado de despacho en tiempo real | ✅ | Pendiente → En Picking → Verificado → Despachado |
| Código de confirmación | ✅ | Generado automáticamente al finalizar despacho |
| **KPIs que alimenta** | | **PEPD (D5a) y CLP (D5b) — Dimensión 5** |

### Módulo 5 — Compras y Abastecimiento (`/compras`)
**Objetivo:** Gestionar digitalmente órdenes de compra vinculadas a alertas de inventario.

| Funcionalidad | Implementado | Descripción |
|---|:---:|---|
| Órdenes de compra digitales | ✅ | Formulario con selección de proveedor y productos |
| Registro de proveedores | ✅ | Datos completos, calificación, condiciones de pago |
| Historial de compras | ✅ | Lista con estado: Pendiente / Enviada / Recibida |
| Recepción de mercadería | ✅ | Formulario de recepción que actualiza stock automáticamente |
| Registro fecha_solicitud / fecha_recepcion | ✅ | Automático para cálculo de TPRI |
| Alerta pre-selección de producto | ✅ | Desde /inventario botón "Comprar" pasa el producto pre-seleccionado |
| **KPI que alimenta** | | **TPRI (Tiempo Promedio Reposición de Inventario) — Dimensión 1** |

### Módulo 6 — Dashboard Gerencial (`/dashboard`)
**Objetivo:** Centralizar todos los indicadores de desempeño con semaforos y exportación para tesis.

| Funcionalidad | Implementado | Descripción |
|---|:---:|---|
| 9 KPIs en tiempo real | ✅ | TPRI, TAFI, TPPP, EI, PEPD, CLP, ROA, MN, CL/V |
| Sistema de semaforos | ✅ | Verde ✓ / Amarillo ⚠ / Rojo ✗ por cada KPI |
| Gráficos históricos | ✅ | Rentabilidad y Pedidos últimos 6 meses (Chart.js) |
| Alertas de stock | ✅ | Productos críticos/bajos en panel lateral |
| Últimos pedidos | ✅ | Mini-tabla con estado y totales |
| **Exportación CSV para SPSS** | ✅ | `/reportes` — Inventario, Pedidos, KPIs, Financiero |
| Comparativo pre/post | ✅ | Gráfico de líneas en /reportes con histórico |

---

## 7. Indicadores KPI — Cumplimiento Documental

Basado en los documentos: **"modulos a construir para el sistema de nayan.docx"** e **"instrumentos de medición.xlsx"**

### Variable Activa: Gestión Logística

#### D1 — Planificación Digital: TPRI
| Aspecto | Documento | Sistema |
|---------|-----------|---------|
| **Indicador** | Tiempo Promedio de Reposición de Inventario | ✅ `solicitudes_reposicion` |
| **Fórmula** | `T.Prom = Σ(dias solicitud→recepcion) / N` | ✅ `AVG(TIMESTAMPDIFF(DAY, ...))` |
| **Unidad** | Días | ✅ días |
| **Muy alto** | ≤ 2 días | ✅ Semáforo verde ≤7 |
| **Alto** | 3 – 7 días | ✅ |
| **Medio** | 8 – 10 días | ✅ Semáforo amarillo ≤15 |
| **Bajo** | 11 – 15 días | ✅ |
| **Muy bajo** | > 15 días | ✅ Semáforo rojo |
| **Técnica** | Observación | ✅ Registro automático |
| **Instrumento** | Ficha de registro | ✅ Tabla `solicitudes_reposicion` |

#### D2 — Integración Operativa: TAFI
| Aspecto | Documento | Sistema |
|---------|-----------|---------|
| **Indicador** | Tiempo Promedio de Flujo de Información | ✅ `requerimientos` |
| **Fórmula** | `TAFI = AVG(timestamp_respuesta - timestamp_envio)` | ✅ `AVG(TIMESTAMPDIFF(MINUTE, ...))` |
| **Unidad** | Minutos | ✅ minutos |
| **Muy alto** | < 5 min | ✅ |
| **Alto** | 5 – 15 min | ✅ Semáforo verde ≤15 |
| **Medio** | 16 – 29 min | ✅ Semáforo amarillo ≤29 |
| **Bajo** | 30 – 60 min | ✅ |
| **Muy bajo** | > 60 min | ✅ Semáforo rojo |
| **Técnica** | Observación | ✅ Timestamps automáticos |
| **Instrumento** | Ficha de control logístico | ✅ Tabla `requerimientos` |

#### D3 — Ejecución Automatizada: TPPP
| Aspecto | Documento | Sistema |
|---------|-----------|---------|
| **Indicador** | Tiempo Promedio de Procesamiento de Pedido | ✅ `pedidos` |
| **Fórmula** | `T.Promedio = Σ(tiempo proc.) / N° pedidos` | ✅ `AVG(TIMESTAMPDIFF(HOUR, fecha_entrada, fecha_despacho))` |
| **Unidad** | Horas | ✅ horas |
| **Muy alto** | ≤ 30 min | ✅ |
| **Alto** | 31 – 45 min | ✅ Semáforo verde ≤5h |
| **Medio** | 46 – 60 min | ✅ |
| **Bajo** | 61 – 90 min | ✅ Semáforo amarillo ≤15h |
| **Muy bajo** | > 90 min | ✅ Semáforo rojo |
| **Técnica** | Observación | ✅ Timestamps automáticos |
| **Instrumento** | Ficha de registro | ✅ Tabla `pedidos` |

#### D4 — Trazabilidad en Tiempo Real: EI
| Aspecto | Documento | Sistema |
|---------|-----------|---------|
| **Indicador** | Exactitud de Inventario (%) | ✅ `conteos_fisicos` |
| **Fórmula** | `EI = (Inv. registrado correcto / Inv. físico total) × 100` | ✅ Calculado en `guardarConteo()` |
| **Unidad** | Porcentaje | ✅ % |
| **Muy alto** | ≥ 95% | ✅ Semáforo verde ≥95 |
| **Alto** | 90 – 94% | ✅ Semáforo amarillo ≥90 |
| **Medio** | 80 – 89% | ✅ |
| **Bajo** | 65 – 79% | ✅ |
| **Muy bajo** | < 65% | ✅ Semáforo rojo |
| **Técnica** | Observación | ✅ Módulo Conteo Físico |
| **Instrumento** | Registro inventario | ✅ Tabla `conteos_fisicos` |

#### D5a — Control Logístico: PEPD
| Aspecto | Documento | Sistema |
|---------|-----------|---------|
| **Indicador** | % Errores de Picking / Despacho | ✅ `despachos` + `picking_items` |
| **Fórmula** | `PEPD = (Pedidos con Error / Total Despachados) × 100` | ✅ `SUM(tiene_error)/COUNT(*) × 100` |
| **Unidad** | Porcentaje | ✅ % |
| **Muy alto** | < 1% | ✅ Semáforo verde <1 |
| **Alto** | 1 – 3% | ✅ Semáforo amarillo ≤3 |
| **Medio** | 3.1 – 5% | ✅ |
| **Bajo** | 5.1 – 10% | ✅ |
| **Muy bajo** | > 10% | ✅ Semáforo rojo |
| **Técnica** | Observación | ✅ Confirmación digital por ítem |
| **Instrumento** | Ficha logística | ✅ Tabla `despachos` |

#### D5b — Control Logístico: CLP
| Aspecto | Documento | Sistema |
|---------|-----------|---------|
| **Indicador** | Costo Logístico por Pedido (S/.) | ✅ `despachos.costo_total` |
| **Fórmula** | `CLP = AVG(flete + embalaje + personal)` | ✅ `AVG(costo_total)` |
| **Unidad** | Soles (S/.) | ✅ S/. |
| **Muy alto** | ≤ S/. 10 | ✅ Semáforo verde ≤10 |
| **Alto** | S/. 11 – 20 | ✅ Semáforo amarillo ≤20 |
| **Medio** | S/. 21 – 35 | ✅ |
| **Bajo** | S/. 36 – 50 | ✅ |
| **Muy bajo** | > S/. 50 | ✅ Semáforo rojo |
| **Técnica** | Revisión documental | ✅ Registro en finalización de despacho |
| **Instrumento** | Ficha de control logístico | ✅ Tabla `despachos` |

### Variable Atributo: Rentabilidad

#### ROA — Rentabilidad sobre Activos
| Aspecto | Documento | Sistema |
|---------|-----------|---------|
| **Indicador** | ROA — Rentabilidad sobre Activos (%) | ✅ `datos_financieros` |
| **Fórmula** | `ROA = (Utilidad neta / Activos totales) × 100` | ✅ Calculado en `DashboardController` |
| **Muy alto** | ≥ 15% | ✅ |
| **Alto** | 10 – 14% | ✅ |
| **Medio** | 6 – 9% | ✅ Semáforo verde ≥4 |
| **Bajo** | 2 – 5% | ✅ Semáforo amarillo ≥2 |
| **Muy bajo** | < 2% | ✅ Semáforo rojo |
| **Técnica** | Análisis financiero | ✅ Tabla `datos_financieros` |
| **Instrumento** | Estado financiero | ✅ Ingreso manual mensual |

#### Margen Neto
| Aspecto | Documento | Sistema |
|---------|-----------|---------|
| **Indicador** | Margen Neto (%) | ✅ `datos_financieros` |
| **Fórmula** | `MN = (Utilidad neta / Ventas netas) × 100` | ✅ Calculado en `DashboardController` |
| **Muy alto** | ≥ 13% | ✅ |
| **Alto** | 9.1 – 12% | ✅ |
| **Medio** | 5.1 – 9% | ✅ Semáforo verde ≥10 |
| **Bajo** | 3 – 5% | ✅ Semáforo amarillo ≥6 |
| **Muy bajo** | < 3% | ✅ Semáforo rojo |
| **Técnica** | Análisis documental | ✅ Tabla `datos_financieros` |
| **Instrumento** | Estado de resultados | ✅ Ingreso manual mensual |

#### CL/Ventas — Costo Logístico sobre Ventas
| Aspecto | Documento | Sistema |
|---------|-----------|---------|
| **Indicador** | Costo Logístico / Ventas (%) | ✅ `datos_financieros` |
| **Fórmula** | `CL/V = (Costo logístico total / Ventas totales) × 100` | ✅ Calculado en `DashboardController` |
| **Muy alto** | < 8% | ✅ |
| **Alto** | 8 – 12% | ✅ Semáforo verde <8 |
| **Medio** | 12.1 – 16% | ✅ Semáforo amarillo <12 |
| **Bajo** | 16.1 – 20% | ✅ |
| **Muy bajo** | > 20% | ✅ Semáforo rojo |
| **Técnica** | Análisis financiero | ✅ Tabla `datos_financieros` |
| **Instrumento** | Registro financiero | ✅ Ingreso manual mensual |

---

## 8. Checklist de Cumplimiento

### Módulos requeridos en el documento Word

- [x] **Módulo 1 — Gestión de Inventarios** → `/inventario`, `/inventario/kardex`, `/inventario/conteo`
- [x] **Módulo 2 — Pedidos y Ventas** → `/pedidos`, `/pedidos/nuevo`, `/pedidos/{id}`
- [x] **Módulo 3 — Integración Operativa** → `/integracion`
- [x] **Módulo 4 — Picking Digital y Despacho** → `/picking`, `/picking/{id}`
- [x] **Módulo 5 — Compras y Abastecimiento** → `/compras`, `/compras/nueva`, `/compras/{id}/recibir`
- [x] **Módulo 6 — Dashboard Gerencial** → `/dashboard`, `/reportes`

### Funcionalidades específicas por módulo (Word §6.2 - §6.7)

#### Módulo 1 — Inventario
- [x] Kardex digital con registro automático de entradas y salidas
- [x] Sistema de alertas automáticas cuando stock alcanza punto de reorden
- [x] Escaneo de productos mediante código QR / código de barras (input manual + placeholder QR)
- [x] Conciliación de inventario: conteo físico vs registro digital con cálculo de exactitud
- [x] Historial completo con usuario, fecha, hora y motivo de cada movimiento
- [x] Alimenta **TPRI** (registro automático solicitud reposición) y **EI** (conteo físico)

#### Módulo 2 — Pedidos y Ventas
- [x] Registro digital de pedidos con validación automática de stock
- [x] Generación automática de orden de despacho y notificación al módulo de almacén
- [x] Registro de timestamps de entrada y despacho para cálculo automático del TPPP
- [x] Clasificación de pedidos por tipo, cliente, zona y período
- [x] Seguimiento del estado del pedido en tiempo real
- [x] Historial de ventas por cliente y producto
- [x] Alimenta **TPPP** (fecha_entrada → fecha_despacho)

#### Módulo 3 — Integración Operativa
- [x] Sistema de notificaciones internas entre áreas con timestamp de envío y lectura
- [x] Sincronización en tiempo real del estado de inventario entre módulos
- [x] Registro de requerimientos inter-área con categorización, prioridad y responsable
- [x] Panel de seguimiento con semáforo de urgencia (colores por prioridad)
- [x] Cálculo automático del TAFI por tipo de requerimiento y área
- [x] Alimenta **TAFI** (fecha_envio → fecha_atencion)

#### Módulo 4 — Picking Digital y Despacho
- [x] Generación automática de lista de picking digital por pedido con ubicación en almacén
- [x] Confirmación digital de cada ítem (OK / Error)
- [x] Registro automático de incidencias: producto incorrecto, cantidad errónea, destino equivocado
- [x] Registro de costos de flete, embalaje y personal para cálculo del CLP
- [x] Código de confirmación de entrega generado automáticamente
- [x] Alimenta **PEPD** (tiene_error / total) y **CLP** (AVG costo_total)

#### Módulo 5 — Compras y Abastecimiento
- [x] Generación semi-automática de órdenes de compra (alerta → botón "Comprar")
- [x] Registro completo de proveedores con calificación de desempeño
- [x] Historial de compras por proveedor y período
- [x] Registro de fecha de pedido y fecha de recepción para cálculo de TPRI
- [x] Recepción con verificación de cantidad, vinculada al módulo de inventario
- [x] Complementa **TPRI** (fecha_emision → fecha_recepcion de OC)

#### Módulo 6 — Dashboard Gerencial
- [x] Dashboard ejecutivo con los 9 KPIs actualizados en tiempo real
- [x] Gráficos de evolución histórica mensual (Chart.js — últimos 6 meses)
- [x] Sistema de semaforos: Verde (dentro de meta) / Amarillo (alerta) / Rojo (fuera de meta)
- [x] Reportes exportables en CSV (compatible con Excel y **SPSS v26**)
- [x] Comparativo visual histórico para validación de hipótesis de tesis
- [x] Cálculo automático de ROA, Margen Neto y CL/V

### Instrumentos de medición (Excel)

| KPI | Dimensión | Fórmula en Sistema | Tabla BD | Exportación |
|-----|-----------|-------------------|----------|-------------|
| TPRI | D1 Planificación digital | `AVG(DATEDIFF(recepcion, solicitud))` | `solicitudes_reposicion` | ✅ CSV |
| TAFI | D2 Integración operativa | `AVG(TIMEDIFF(atencion, envio))` | `requerimientos` | ✅ CSV |
| TPPP | D3 Ejecución automatizada | `AVG(HOUR(despacho - entrada))` | `pedidos` | ✅ CSV |
| EI   | D4 Trazabilidad tiempo real | `(correctos/total)×100` | `conteos_fisicos` | ✅ CSV |
| PEPD | D5a Control logístico | `(errores/total)×100` | `despachos` | ✅ CSV |
| CLP  | D5b Control logístico | `AVG(costo_total)` | `despachos` | ✅ CSV |
| ROA  | Rentabilidad financiera | `(utilidad/activos)×100` | `datos_financieros` | ✅ CSV |
| MN   | Rentabilidad económica | `(utilidad/ventas)×100` | `datos_financieros` | ✅ CSV |
| CL/V | Rentabilidad logística | `(costos_log/ventas)×100` | `datos_financieros` | ✅ CSV |

### Variables del instrumento

- [x] **Variable Activa — Gestión Logística:** Operacionalizada en 5 dimensiones (D1-D5) con 6 indicadores
- [x] **Variable Atributo — Rentabilidad:** Operacionalizada en 3 dimensiones con 3 indicadores
- [x] **Técnicas de medición:** Observación directa + Revisión documental + Análisis financiero
- [x] **Instrumentos:** Ficha de registro digital (tablas de BD) + Estado financiero (datos_financieros)
- [x] **Criterios de evaluación:** Escalas Muy alto / Alto / Medio / Bajo / Muy bajo implementadas como semáforos

---

## 9. Estructura de Archivos

```
NAYAN/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php         ← Login / Logout
│   │   │   ├── DashboardController.php    ← KPIs y gráficos
│   │   │   ├── InventarioController.php   ← Módulo 1
│   │   │   ├── PedidoController.php       ← Módulo 2
│   │   │   ├── IntegracionController.php  ← Módulo 3
│   │   │   ├── PickingController.php      ← Módulo 4
│   │   │   ├── CompraController.php       ← Módulo 5
│   │   │   ├── ProductoController.php     ← Catálogo productos
│   │   │   ├── ClienteController.php      ← Catálogo clientes
│   │   │   ├── ProveedorController.php    ← Catálogo proveedores
│   │   │   └── ReporteController.php      ← Exportación CSV/SPSS
│   │   └── Middleware/
│   │       └── HandleInertiaRequests.php  ← Auth compartida
│   └── Models/
│       ├── User.php · Producto.php · Pedido.php
│       ├── Despacho.php · Requerimiento.php
│       └── OrdenCompra.php · Proveedor.php · ...
│
├── database/
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   └── 2026_05_30_*_create_nayan_tables.php  ← 17 tablas
│   └── seeders/
│       └── DatabaseSeeder.php              ← Datos de muestra
│
├── resources/
│   ├── css/app.css                         ← Tailwind CSS v4
│   └── js/
│       ├── app.jsx                         ← Entry point React
│       ├── Layouts/
│       │   └── AppLayout.jsx               ← Layout con sidebar
│       ├── Components/
│       │   ├── KpiCard.jsx                 ← Tarjeta KPI con semáforo
│       │   ├── StockBadge.jsx              ← Badge estado stock
│       │   ├── EstadoBadge.jsx             ← Badges de estados
│       │   └── FlashMessage.jsx            ← Notificaciones
│       └── Pages/
│           ├── Auth/Login.jsx
│           ├── Dashboard.jsx               ← Módulo 6
│           ├── Inventario/{Index,Kardex,Conteo}.jsx
│           ├── Pedidos/{Index,Nuevo,Ver}.jsx
│           ├── Integracion/Index.jsx
│           ├── Picking/{Index,Ver}.jsx
│           ├── Compras/{Index,Nueva,Recibir}.jsx
│           ├── Productos/Index.jsx
│           ├── Clientes/Index.jsx
│           ├── Proveedores/Index.jsx
│           └── Reportes/Index.jsx
│
├── routes/web.php                          ← Todas las rutas
├── .env                                    ← Configuración BD
└── vite.config.js                          ← Vite + React + Tailwind
```

---

## 10. Comandos Útiles

```bash
# Reiniciar BD con datos de muestra
php artisan migrate:fresh --seed

# Limpiar caché
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Ver todas las rutas
php artisan route:list

# Compilar assets (producción)
npm run build

# Desarrollo con hot-reload
npm run dev

# Verificar sintaxis PHP
php -l app/Http/Controllers/DashboardController.php

# Ver logs de errores
php artisan pail
# o revisar: storage/logs/laravel.log
```

### Para migrar a PostgreSQL (producción)
```bash
# En .env cambiar:
DB_CONNECTION=pgsql
DB_HOST=tu-servidor-postgres
DB_PORT=5432
DB_DATABASE=nayan_db
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña

# Ejecutar migraciones
php artisan migrate:fresh --seed
```

---

> **Versión:** 1.0.0 — Mayo 2026
> **Proyecto:** Tesis + Sistema de Producción — NAYAN Mobile Accessories
> **Stack:** Laravel 12 · React 19 · Inertia.js v2 · Tailwind CSS v4 · MySQL/PostgreSQL
