-- Script para insertar datos de prueba (opcional)
-- Útil para desarrollo y testing

USE finanzas_app;

-- Insertar usuario de prueba (contraseña: "test123")
INSERT INTO usuarios (nombre, apellidos, email, password) 
VALUES ('Juan', 'Pérez García', 'juan@ejemplo.com', 'test123')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Obtener el ID del usuario recién creado
SET @user_id = LAST_INSERT_ID();

-- Insertar ingresos de prueba
INSERT INTO ingresos (user_id, nombre, monto) VALUES
(@user_id, 'Sueldo', 1500000),
(@user_id, 'Freelance', 300000);

-- Insertar gastos de prueba
INSERT INTO gastos (user_id, nombre, monto) VALUES
(@user_id, 'Arriendo', 400000),
(@user_id, 'Alimentación', 200000),
(@user_id, 'Transporte', 80000);

-- Insertar deuda de prueba
INSERT INTO deudas (user_id, nombre, monto, tasa_interes) VALUES
(@user_id, 'Tarjeta de Crédito', 500000, 2.5);

-- Insertar meta de ahorro de prueba
INSERT INTO metas_ahorro (user_id, titulo, meta_monto, monto_actual) VALUES
(@user_id, 'Vacaciones', 1000000, 250000);

-- Mensaje de confirmación
SELECT 'Datos de prueba insertados exitosamente' AS mensaje;
SELECT 'Usuario: juan@ejemplo.com | Contraseña: test123' AS credenciales;
