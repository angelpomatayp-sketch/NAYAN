-- ============================================================
-- NAYAN Mobile Accessories - Sistema de Gestión Logística
-- Base de Datos: nayan_db
-- ============================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `nayan_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nayan_db`;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `rol` ENUM('admin','gerente','vendedor','almacen','logistica') NOT NULL DEFAULT 'vendedor',
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `categorias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `productos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo` VARCHAR(50) NOT NULL UNIQUE,
  `nombre` VARCHAR(200) NOT NULL,
  `descripcion` TEXT,
  `categoria_id` INT,
  `precio_compra` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `precio_venta` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `stock_actual` INT NOT NULL DEFAULT 0,
  `stock_minimo` INT NOT NULL DEFAULT 5,
  `stock_reorden` INT NOT NULL DEFAULT 10,
  `ubicacion_almacen` VARCHAR(50),
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `inventario_movimientos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `producto_id` INT NOT NULL,
  `tipo` ENUM('entrada','salida','ajuste','conteo_fisico') NOT NULL,
  `cantidad` INT NOT NULL,
  `stock_anterior` INT NOT NULL,
  `stock_nuevo` INT NOT NULL,
  `motivo` VARCHAR(200),
  `referencia` VARCHAR(100),
  `usuario_id` INT NOT NULL,
  `fecha_hora` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`),
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `conteos_fisicos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fecha_inicio` DATETIME NOT NULL,
  `fecha_fin` DATETIME,
  `estado` ENUM('en_progreso','completado') DEFAULT 'en_progreso',
  `usuario_id` INT NOT NULL,
  `porcentaje_exactitud` DECIMAL(5,2),
  `observaciones` TEXT,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `conteos_fisicos_detalle` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conteo_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `cantidad_sistema` INT NOT NULL,
  `cantidad_fisica` INT,
  `diferencia` INT,
  FOREIGN KEY (`conteo_id`) REFERENCES `conteos_fisicos`(`id`),
  FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `proveedores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(200) NOT NULL,
  `ruc` VARCHAR(20),
  `contacto` VARCHAR(100),
  `telefono` VARCHAR(20),
  `email` VARCHAR(100),
  `direccion` TEXT,
  `condiciones_pago` VARCHAR(100),
  `calificacion` DECIMAL(3,2) DEFAULT 5.00,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ordenes_compra` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `numero` VARCHAR(20) NOT NULL UNIQUE,
  `proveedor_id` INT NOT NULL,
  `fecha_emision` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_esperada` DATE,
  `fecha_recepcion` DATETIME,
  `estado` ENUM('pendiente','enviada','recibida','cancelada') DEFAULT 'pendiente',
  `total` DECIMAL(10,2) DEFAULT 0.00,
  `usuario_id` INT NOT NULL,
  `observaciones` TEXT,
  FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`),
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ordenes_compra_detalle` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orden_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `precio_unitario` DECIMAL(10,2) DEFAULT 0.00,
  `cantidad_recibida` INT DEFAULT 0,
  FOREIGN KEY (`orden_id`) REFERENCES `ordenes_compra`(`id`),
  FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `solicitudes_reposicion` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `producto_id` INT NOT NULL,
  `fecha_solicitud` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_recepcion` DATETIME,
  `orden_compra_id` INT,
  `estado` ENUM('pendiente','en_proceso','recibido') DEFAULT 'pendiente',
  `usuario_id` INT NOT NULL,
  FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`),
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `clientes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(200) NOT NULL,
  `documento` VARCHAR(20),
  `telefono` VARCHAR(20),
  `email` VARCHAR(100),
  `direccion` TEXT,
  `zona` VARCHAR(50),
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `pedidos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `numero` VARCHAR(20) NOT NULL UNIQUE,
  `cliente_id` INT,
  `fecha_entrada` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_despacho` DATETIME,
  `fecha_entrega` DATETIME,
  `estado` ENUM('registrado','en_preparacion','despachado','entregado','cancelado') DEFAULT 'registrado',
  `tipo` VARCHAR(50) DEFAULT 'minorista',
  `zona` VARCHAR(50),
  `subtotal` DECIMAL(10,2) DEFAULT 0.00,
  `descuento` DECIMAL(10,2) DEFAULT 0.00,
  `total` DECIMAL(10,2) DEFAULT 0.00,
  `usuario_id` INT NOT NULL,
  `observaciones` TEXT,
  FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `pedidos_detalle` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pedido_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `precio_unitario` DECIMAL(10,2) DEFAULT 0.00,
  `subtotal` DECIMAL(10,2) DEFAULT 0.00,
  FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id`),
  FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `requerimientos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `area_origen` VARCHAR(50) NOT NULL,
  `area_destino` VARCHAR(50) NOT NULL,
  `tipo` VARCHAR(100),
  `asunto` VARCHAR(200) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `prioridad` ENUM('baja','media','alta','urgente') DEFAULT 'media',
  `estado` ENUM('pendiente','en_atencion','atendido') DEFAULT 'pendiente',
  `fecha_envio` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_atencion` DATETIME,
  `usuario_envio` INT NOT NULL,
  `usuario_atencion` INT,
  `respuesta` TEXT,
  FOREIGN KEY (`usuario_envio`) REFERENCES `usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `despachos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pedido_id` INT NOT NULL,
  `numero` VARCHAR(20) NOT NULL UNIQUE,
  `fecha_picking_inicio` DATETIME,
  `fecha_picking_fin` DATETIME,
  `estado` ENUM('pendiente','en_picking','verificado','despachado','entregado') DEFAULT 'pendiente',
  `usuario_picking` INT,
  `costo_flete` DECIMAL(10,2) DEFAULT 0.00,
  `costo_embalaje` DECIMAL(10,2) DEFAULT 0.00,
  `costo_personal` DECIMAL(10,2) DEFAULT 0.00,
  `costo_total` DECIMAL(10,2) DEFAULT 0.00,
  `codigo_confirmacion` VARCHAR(20),
  `tiene_error` TINYINT(1) DEFAULT 0,
  `observaciones` TEXT,
  FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `picking_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `despacho_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `cantidad_solicitada` INT NOT NULL,
  `cantidad_pickeada` INT DEFAULT 0,
  `ubicacion` VARCHAR(50),
  `estado` ENUM('pendiente','confirmado','error') DEFAULT 'pendiente',
  `tiene_error` TINYINT(1) DEFAULT 0,
  `tipo_error` ENUM('producto_incorrecto','cantidad_erronea','destino_equivocado','otro') NULL,
  FOREIGN KEY (`despacho_id`) REFERENCES `despachos`(`id`),
  FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `datos_financieros` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `periodo` DATE NOT NULL,
  `utilidad_neta` DECIMAL(12,2) DEFAULT 0.00,
  `ventas_netas` DECIMAL(12,2) DEFAULT 0.00,
  `activos_totales` DECIMAL(12,2) DEFAULT 0.00,
  `costos_logisticos` DECIMAL(12,2) DEFAULT 0.00,
  `usuario_id` INT,
  `observaciones` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_periodo` (`periodo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
