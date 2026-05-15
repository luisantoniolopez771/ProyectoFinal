ALTER SESSION SET CONTAINER = XEPDB1;
ALTER SESSION SET CURRENT_SCHEMA = BODEGA_USER;

CREATE TABLE Categoria (
    ID_Categoria NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Nombre_Categoria  VARCHAR2(30) NOT NULL
);

CREATE TABLE Ubicacion (
    ID_Ubicacion NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Anaquel VARCHAR2(5) NOT NULL,
    Nivel VARCHAR2(5) NOT NUll
);

CREATE TABLE Medida (
    ID_Medida NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Valor_Medida VARCHAR2(50) NOT NULL
);

CREATE TABLE Marca (
    ID_Marca NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Nombre_Marca VARCHAR2(50) UNIQUE NOT NULL
);

CREATE TABLE Area_Bordado (
    ID_Area NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Nombre_Area VARCHAR2(50) NOT NULL
);

CREATE TABLE Maquina (
    ID_Maquina NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ID_Marca NUMBER NOT NULL, 
    ID_Area NUMBER, 
    Nombre_Modelo VARCHAR2(50) NOT NULL,
    NoSerie VARCHAR2(50) UNIQUE NOT NULL, 
    Tipo_Bastidor VARCHAR2(50), 
    Descripcion_Maquina VARCHAR2(100),
    CONSTRAINT ID_Mar_Maq_Mar FOREIGN KEY (ID_Marca) REFERENCES Marca (ID_Marca),
    CONSTRAINT ID_Are_Maq_Are FOREIGN KEY (ID_Area) REFERENCES Area_Bordado (ID_Area)
);

CREATE TABLE Pieza (
    ID_Pieza NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ID_Categoria NUMBER NOT NULL,
    ID_Medida NUMBER NOT NULL,
    ID_Marca NUMBER NOT NULL,
    ID_Maquina NUMBER,
    ID_Ubicacion NUMBER,
    ID_Area_Bordado NUMBER,
    Nombre VARCHAR2(50) NOT NULL,
    Modelo VARCHAR2(50),
    Color_Tipo VARCHAR2(50),
    Stock_Actual NUMBER(4) DEFAULT 0 CHECK (Stock_Actual >= 0),
    Estado VARCHAR2(20) DEFAULT 'ACTIVO',
    CONSTRAINT ID_Cat_Pie_Cat FOREIGN KEY (ID_Categoria) REFERENCES Categoria (ID_Categoria),
    CONSTRAINT ID_Maq_Pie_Maq FOREIGN KEY (ID_Maquina) REFERENCES Maquina (ID_Maquina),
    CONSTRAINT ID_Ubi_Pie_Ubi FOREIGN KEY (ID_Ubicacion) REFERENCES Ubicacion (ID_Ubicacion),
    CONSTRAINT ID_Med_Pie_Med FOREIGN KEY (ID_Medida) REFERENCES Medida (ID_Medida),
    CONSTRAINT ID_Mar_Pie_Mar FOREIGN KEY (ID_Marca) REFERENCES Marca (ID_Marca),
    CONSTRAINT ID_Are_Pie_Are FOREIGN KEY (ID_Area_Bordado) REFERENCES Area_Bordado (ID_Area)
);

CREATE TABLE Usuario (
    ID_Usuario NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Nombre_Completo VARCHAR2(40) NOT NULL,
    Rol VARCHAR2(20) NOT NULL,
    Estado VARCHAR2(20) NOT NULL,
    Contrasena VARCHAR2(255)
);

CREATE TABLE Movimiento (
    ID_Movimiento NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ID_Pieza NUMBER NOT NULL,
    ID_Usuario NUMBER NOT NULL,
    Tipo_Movimiento VARCHAR2(20) CHECK (Tipo_Movimiento IN ('ENTRADA', 'SALIDA')),
    Cantidad NUMBER(4) NOT NULL CHECK (Cantidad > 0),
    Nota VARCHAR2(100),
    Stock_Resultante NUMBER NOT NULL,
    Fecha_Hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ID_Pieza_Mov_Pie FOREIGN KEY (ID_Pieza) REFERENCES Pieza (ID_Pieza),
    CONSTRAINT ID_Usuario_Mov_Usu FOREIGN KEY (ID_Usuario) REFERENCES Usuario (ID_Usuario)
);

-------------------------------- INSERT PARA PRUEBAS -----------------------------------------------
-- USUARIOS
INSERT INTO Usuario (Nombre_Completo, Rol, Estado, Contrasena) VALUES ('Admin SWF', 'Administrador', 'ACTIVO', 'admin123');
INSERT INTO Usuario (Nombre_Completo, Rol, Estado, Contrasena) VALUES ('Trabajador SWF', 'Trabajador', 'ACTIVO', 'trabajador123');

-- CATEGORIAS
INSERT INTO Categoria (Nombre_Categoria) VALUES ('Aros');
INSERT INTO Categoria (Nombre_Categoria) VALUES ('Tornillos');
INSERT INTO Categoria (Nombre_Categoria) VALUES ('Bastidores');
INSERT INTO Categoria (Nombre_Categoria) VALUES ('Agujas');

-- MARCAS
INSERT INTO Marca (Nombre_Marca) VALUES ('SWF');
INSERT INTO Marca (Nombre_Marca) VALUES ('Tajima');
INSERT INTO Marca (Nombre_Marca) VALUES ('Pantogram');
INSERT INTO Marca (Nombre_Marca) VALUES ('Barudan');
INSERT INTO Marca (Nombre_Marca) VALUES ('Brother');

-- MEDIDAS
INSERT INTO Medida (Valor_Medida) VALUES ('18x35');
INSERT INTO Medida (Valor_Medida) VALUES ('15x15');
INSERT INTO Medida (Valor_Medida) VALUES ('12x12');
INSERT INTO Medida (Valor_Medida) VALUES ('5mm');
INSERT INTO Medida (Valor_Medida) VALUES ('10mm');
INSERT INTO Medida (Valor_Medida) VALUES ('15mm');
INSERT INTO Medida (Valor_Medida) VALUES ('XXL');
INSERT INTO Medida (Valor_Medida) VALUES ('Estándar');
INSERT INTO Medida (Valor_Medida) VALUES ('75/11');
INSERT INTO Medida (Valor_Medida) VALUES ('80/12');

-- UBICACIONES
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A1', 'N1');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A1', 'N2');

-- AREAS DE BORDADO
INSERT INTO Area_Bordado (Nombre_Area) VALUES ('Plano');
INSERT INTO Area_Bordado (Nombre_Area) VALUES ('Gorra');
INSERT INTO Area_Bordado (Nombre_Area) VALUES ('Tubular');
INSERT INTO Area_Bordado (Nombre_Area) VALUES ('Prenda Armada');

-- MAQUINAS
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (1, 1, 'SWF/E-T1501C', 'SWF001', 'Máquina SWF de 1 cabeza');

INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (2, 4, 'TFMX-C', 'TAJ001', 'Máquina Tajima cilíndrica');

INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (1, 2, 'SWF/K-UH1504-45', 'SWF002', 'Máquina SWF de 4 cabezas');

-- PIEZAS
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Stock_Actual) VALUES (1, 1, 2, 1, 'Aro Magnético', 12);

INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (2, 2, 3, 7, 'Tornillo de ajuste', 'Negro', 45);

COMMIT;

----------------------------- PROYECTO GESTION BASE DE DATOS -------------------------------
CREATE TABLE Auditoria_Inventario (
    ID_Auditoria NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ID_Pieza NUMBER,
    Nombre_Anterior VARCHAR2(50),
    Accion VARCHAR2(20),
    Usuario_Accion VARCHAR2(30),
    Fecha_Accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--- TRIGGER 1 ---
CREATE OR REPLACE TRIGGER TRG_AUDITORIA_PIEZA
AFTER UPDATE OR DELETE ON Pieza
FOR EACH ROW
BEGIN
    -- Si se actualiza y cambia el nombre
    IF UPDATING THEN
        IF :OLD.Nombre <> :NEW.Nombre THEN
            INSERT INTO Auditoria_Inventario (
                ID_Pieza,
                Nombre_Anterior,
                Accion,
                Usuario_Accion,
                Fecha_Accion
            ) VALUES (
                :OLD.ID_Pieza,
                :OLD.Nombre,
                'UPDATE',
                USER,
                CURRENT_TIMESTAMP
            );
        END IF;
    END IF;

    -- Si se elimina la pieza
    IF DELETING THEN
        INSERT INTO Auditoria_Inventario (
            ID_Pieza,
            Nombre_Anterior,
            Accion,
            Usuario_Accion,
            Fecha_Accion
        ) VALUES (
            :OLD.ID_Pieza,
            :OLD.Nombre,
            'DELETE',
            USER,
            CURRENT_TIMESTAMP
        );
    END IF;
END;
/

--- TRIGGER 2 ---
CREATE OR REPLACE TRIGGER TRG_VALIDAR_CONTRASENA
BEFORE INSERT ON Usuario
FOR EACH ROW
BEGIN
    IF LENGTH(:NEW.Contrasena) < 8 THEN
        RAISE_APPLICATION_ERROR(
            -20001,
            'La contrasena debe tener al menos 8 caracteres'
        );
    END IF;
END;
/

--- TRIGGER 3 ---
CREATE OR REPLACE TRIGGER TRG_BODEGA_CERRADA_DOMINGO
BEFORE INSERT ON Movimiento
BEGIN
    IF TO_CHAR(SYSDATE, 'DY', 'NLS_DATE_LANGUAGE=ENGLISH') = 'SUN' THEN
        RAISE_APPLICATION_ERROR(
            -20002,
            'Bodega cerrada: no se permiten movimientos en domingo'
        );
    END IF;
END;
/

--- PAQUETE 1 ---
CREATE OR REPLACE PACKAGE PKG_BODEGA AS

    PROCEDURE SP_Alta_Usuario(
        p_nombre_completo IN VARCHAR2,
        p_rol IN VARCHAR2,
        p_estado IN VARCHAR2,
        p_contrasena IN VARCHAR2
    );

    FUNCTION FN_Movimientos_Del_Mes(
        p_id_usuario IN NUMBER
    ) RETURN NUMBER;

END PKG_BODEGA;
/

-- Cuerpo del paquete
CREATE OR REPLACE PACKAGE BODY PKG_BODEGA AS

    PROCEDURE SP_Alta_Usuario(
        p_nombre_completo IN VARCHAR2,
        p_rol IN VARCHAR2,
        p_estado IN VARCHAR2,
        p_contrasena IN VARCHAR2
    )
    IS
    BEGIN
        INSERT INTO Usuario (
            Nombre_Completo,
            Rol,
            Estado,
            Contrasena
        ) VALUES (
            p_nombre_completo,
            p_rol,
            p_estado,
            p_contrasena
        );

        COMMIT;
    END SP_Alta_Usuario;


    FUNCTION FN_Movimientos_Del_Mes(
        p_id_usuario IN NUMBER
    ) RETURN NUMBER
    IS
        v_total NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO v_total
        FROM Movimiento
        WHERE ID_Usuario = p_id_usuario
        AND EXTRACT(MONTH FROM Fecha_Hora) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM Fecha_Hora) = EXTRACT(YEAR FROM CURRENT_DATE);

        RETURN v_total;
    END FN_Movimientos_Del_Mes;

END PKG_BODEGA;
/

--- CURSOR 1 EXPLICITO ---
DECLARE
    CURSOR cur_auditoria IS
        SELECT ID_Auditoria,
               ID_Pieza,
               Nombre_Anterior,
               Accion,
               Usuario_Accion,
               Fecha_Accion
        FROM Auditoria_Inventario
        WHERE Fecha_Accion >= SYSDATE - 7
        ORDER BY Fecha_Accion DESC;

    v_id_auditoria Auditoria_Inventario.ID_Auditoria%TYPE;
    v_id_pieza Auditoria_Inventario.ID_Pieza%TYPE;
    v_nombre Auditoria_Inventario.Nombre_Anterior%TYPE;
    v_accion Auditoria_Inventario.Accion%TYPE;
    v_usuario Auditoria_Inventario.Usuario_Accion%TYPE;
    v_fecha Auditoria_Inventario.Fecha_Accion%TYPE;

BEGIN
    OPEN cur_auditoria;

    LOOP
        FETCH cur_auditoria INTO
            v_id_auditoria,
            v_id_pieza,
            v_nombre,
            v_accion,
            v_usuario,
            v_fecha;

        EXIT WHEN cur_auditoria%NOTFOUND;

        DBMS_OUTPUT.PUT_LINE(
            'ID AUDITORIA: ' || v_id_auditoria ||
            ' | PIEZA: ' || v_id_pieza ||
            ' | NOMBRE: ' || v_nombre ||
            ' | ACCION: ' || v_accion ||
            ' | USUARIO: ' || v_usuario ||
            ' | FECHA: ' || v_fecha
        );
    END LOOP;

    CLOSE cur_auditoria;
END;
/

--- CURSOR 2 IMPLICITO ---
BEGIN
    FOR empleado IN (
        SELECT ID_Usuario,
               Nombre_Completo,
               Rol
        FROM Usuario
        WHERE Estado = 'ACTIVO'
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE(
            'ID: ' || empleado.ID_Usuario ||
            ' | Nombre: ' || empleado.Nombre_Completo ||
            ' | Rol: ' || empleado.Rol
        );
    END LOOP;
END;
/
-----------------------------------------------------------------------------
--- TRIGGER 4 ---
CREATE OR REPLACE TRIGGER TRG_AUDITORIA_MOV_MASIVO
AFTER INSERT ON Movimiento
FOR EACH ROW
BEGIN
    -- Si el movimiento es mayor a 50 unidades, dispara la alerta
    IF :NEW.Cantidad > 50 THEN
        INSERT INTO Auditoria_Inventario (
            ID_Pieza, 
            Nombre_Anterior,
            Accion, 
            Usuario_Accion 
        ) VALUES (
            :NEW.ID_Pieza,
            'MOV_GRANDE: ' || :NEW.Tipo_Movimiento,
            'ALERTA_CANTIDAD',
            USER
        );
        
        DBMS_OUTPUT.PUT_LINE('Se ha registrado un movimiento masivo de ' || :NEW.Cantidad || ' unidades.');
    END IF;
END;
/

--- TRIGGER 5 ---
CREATE OR REPLACE TRIGGER TRG_VALIDAR_STOCK_MINIMO
BEFORE UPDATE OF Stock_Actual ON Pieza
FOR EACH ROW
BEGIN
    -- Comprobamos que el nuevo stock no sea negativo
    IF :NEW.Stock_Actual < 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Stock Insuficiente para completar la operacion.');
    END IF;
END;
/

--- TRIGGER 6 ---
CREATE OR REPLACE TRIGGER TRG_SEGURIDAD_CATEGORIAS
BEFORE DELETE ON Categoria
FOR EACH ROW
DECLARE
    v_conteo NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_conteo 
    FROM Pieza
    WHERE ID_Categoria = :OLD.ID_Categoria;

    IF v_conteo > 0 THEN
        RAISE_APPLICATION_ERROR(-20004, 'No se puede eliminar la categoria porque tiene piezas asociadas.');
    END IF;
END;
/

--- TRIGGER 7 ---
CREATE OR REPLACE TRIGGER TRG_ACTUALIZAR_STOCK_AUTO
AFTER INSERT ON Movimiento
FOR EACH ROW
BEGIN
    -- Si es ENTRADA, sumamos; si es SALIDA, restamos
    IF :NEW.Tipo_Movimiento = 'ENTRADA' THEN
        UPDATE Pieza SET Stock_Actual = Stock_Actual + :NEW.Cantidad 
        WHERE ID_Pieza = :NEW.ID_Pieza;
    ELSIF :NEW.Tipo_Movimiento = 'SALIDA' THEN
        UPDATE Pieza SET Stock_Actual = Stock_Actual - :NEW.Cantidad 
        WHERE ID_Pieza = :NEW.ID_Pieza;
    END IF;
END;
/

--- PAQUETE 2 ---
CREATE OR REPLACE PACKAGE PKG_OPERACIONES AS
    PROCEDURE SP_Procesar_Salida(
        p_id_pieza IN NUMBER,
        p_cantidad IN NUMBER,
        p_id_usuario IN NUMBER 
    );

    FUNCTION FN_Estado_Pieza(
        p_stock_actual IN NUMBER
    ) RETURN VARCHAR2;
END PKG_OPERACIONES;
/

CREATE OR REPLACE PACKAGE BODY PKG_OPERACIONES AS

    -- 1. PROCEDIMIENTO: SP_Procesar_Salida
    PROCEDURE SP_Procesar_Salida(
        p_id_pieza IN NUMBER,
        p_cantidad IN NUMBER,
        p_id_usuario IN NUMBER
    ) IS
    BEGIN
        INSERT INTO Movimiento (
            ID_Pieza, 
            ID_Usuario, 
            Tipo_Movimiento, 
            Cantidad, 
            Nota,
            Stock_Resultante 
        ) VALUES (
            p_id_pieza,
            p_id_usuario,
            'SALIDA',
            p_cantidad,
            'Salida procesada via PKG',
            0
        );
    
        DBMS_OUTPUT.PUT_LINE('>>> Intento de salida registrado correctamente.');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            DBMS_OUTPUT.PUT_LINE('ERROR EN OPERACION: ' || SQLERRM);
            RAISE; 
    END SP_Procesar_Salida;

    -- 2. FUNCIÓN: FN_Estado_Pieza
    FUNCTION FN_Estado_Pieza(
        p_stock_actual IN NUMBER
    ) RETURN VARCHAR2 IS
    BEGIN
        -- Lógica de negocio para stock en la bodega
        IF p_stock_actual <= 5 THEN
            RETURN 'CRÍTICO - Reabastecer';
        ELSE
            RETURN 'ÓPTIMO';
        END IF;
    END FN_Estado_Pieza;

END PKG_OPERACIONES;
/

--- CURSOR 3 EXPLÍCITO ---
SET SERVEROUTPUT ON;
DECLARE
    CURSOR cur_reabastecimiento IS
        SELECT p.Nombre, 
               p.Stock_Actual, 
               m.Nombre_Marca,
               p.Modelo
        FROM Pieza p
        JOIN Marca m ON p.ID_Marca = m.ID_Marca;
    v_estado VARCHAR2(30);
    v_contador NUMBER := 0;

BEGIN
    DBMS_OUTPUT.PUT_LINE('REPORTE DE REABASTECIMIENTO');
    DBMS_OUTPUT.PUT_LINE(RPAD('PIEZA', 25) || RPAD('MARCA', 15) || 'STOCK');
    FOR r_pieza IN cur_reabastecimiento LOOP
        v_estado := PKG_OPERACIONES.FN_Estado_Pieza(r_pieza.Stock_Actual);

        IF v_estado LIKE 'CRÍTICO%' THEN 
            v_contador := v_contador + 1;
        
            DBMS_OUTPUT.PUT_LINE(
                RPAD(r_pieza.Nombre, 25) || 
                RPAD(r_pieza.Nombre_Marca, 15) || 
                LPAD(r_pieza.Stock_Actual, 5)
            );
        END IF;   
    END LOOP;
    IF v_contador > 0 THEN
        DBMS_OUTPUT.PUT_LINE('Total de articulos para reabastecer: ' || v_contador);
    ELSE
        DBMS_OUTPUT.PUT_LINE('El inventario se encuentra en niveles OPTIMOS.');
    END IF;
END;
/

--- CURSOR 4 IMPLÍCITO:
SET SERVEROUTPUT ON; 
DECLARE
    v_total_piezas NUMBER := 0;
    v_anaquel_buscado VARCHAR2(5) := 'A1'; 
BEGIN
    SELECT NVL(SUM(p.Stock_Actual), 0)
    INTO v_total_piezas
    FROM Pieza p
    JOIN Ubicacion u ON p.ID_Ubicacion = u.ID_Ubicacion
    WHERE u.Anaquel = v_anaquel_buscado;

    DBMS_OUTPUT.PUT_LINE('REPORTE DE CAPACIDAD POR ANAQUEL');
    DBMS_OUTPUT.PUT_LINE('Anaquel consultado: ' || v_anaquel_buscado);
    DBMS_OUTPUT.PUT_LINE('Total de piezas almacenadas: ' || v_total_piezas);
    
    IF v_total_piezas > 100 THEN
        DBMS_OUTPUT.PUT_LINE('ESTADO: Anaquel con alta carga.');
    ELSIF v_total_piezas = 0 THEN
        DBMS_OUTPUT.PUT_LINE('ESTADO: Anaquel vacio o no asignado.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('ESTADO: Espacio disponible.');
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Ocurrió un error inesperado: ' || SQLERRM);
END;
/
