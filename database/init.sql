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
    Descripcion_Maquina VARCHAR2(100),
    CONSTRAINT ID_Mar_Maq_Mar FOREIGN KEY (ID_Marca) REFERENCES Marca (ID_Marca),
    CONSTRAINT ID_Are_Maq_Are FOREIGN KEY (ID_Area) REFERENCES Area_Bordado (ID_Area)
);

CREATE TABLE Pieza (
    ID_Pieza NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ID_Categoria NUMBER NOT NULL,
    ID_Medida NUMBER NOT NULL,
    ID_Marca NUMBER NOT NULL,
    ID_Ubicacion NUMBER,
    Nombre VARCHAR2(50) NOT NULL,
    Color_Tipo VARCHAR2(50),
    Stock_Actual NUMBER(4) DEFAULT 0 CHECK (Stock_Actual >= 0),
    Estado VARCHAR2(20) DEFAULT 'ACTIVO',
    CONSTRAINT ID_Cat_Pie_Cat FOREIGN KEY (ID_Categoria) REFERENCES Categoria (ID_Categoria),
    CONSTRAINT ID_Ubi_Pie_Ubi FOREIGN KEY (ID_Ubicacion) REFERENCES Ubicacion (ID_Ubicacion),
    CONSTRAINT ID_Med_Pie_Med FOREIGN KEY (ID_Medida) REFERENCES Medida (ID_Medida),
    CONSTRAINT ID_Mar_Pie_Mar FOREIGN KEY (ID_Marca) REFERENCES Marca (ID_Marca)
);

CREATE TABLE Compatibilidad (
    ID_Pieza NUMBER NOT NULL,
    ID_Maquina NUMBER NOT NULL,
    CONSTRAINT PK_Compatibilidad PRIMARY KEY (ID_Pieza, ID_Maquina),
    CONSTRAINT FK_Compat_Prod FOREIGN KEY (ID_Pieza) REFERENCES Pieza(ID_Pieza),
    CONSTRAINT FK_Compat_Maq FOREIGN KEY (ID_Maquina) REFERENCES Maquina(ID_Maquina)
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
INSERT INTO Categoria (Nombre_Categoria) VALUES ('Aros de gorra');
INSERT INTO Categoria (Nombre_Categoria) VALUES ('Bastidores');
INSERT INTO Categoria (Nombre_Categoria) VALUES ('Tornillos');
INSERT INTO Categoria (Nombre_Categoria) VALUES ('Huaraches');
INSERT INTO Categoria (Nombre_Categoria) VALUES ('Grapas');
INSERT INTO Categoria (Nombre_Categoria) VALUES ('Brazos');
INSERT INTO Categoria (Nombre_Categoria) VALUES ('Embastadores');

-- MARCAS
INSERT INTO Marca (Nombre_Marca) VALUES ('SWF');
INSERT INTO Marca (Nombre_Marca) VALUES ('Tajima');
INSERT INTO Marca (Nombre_Marca) VALUES ('Pantogram');
INSERT INTO Marca (Nombre_Marca) VALUES ('Barudan');
INSERT INTO Marca (Nombre_Marca) VALUES ('Brother');
INSERT INTO Marca (Nombre_Marca) VALUES ('Ultra Stitch');
INSERT INTO Marca (Nombre_Marca) VALUES ('Feiya');
INSERT INTO Marca (Nombre_Marca) VALUES ('Happy');
INSERT INTO Marca (Nombre_Marca) VALUES ('ZSK');
INSERT INTO Marca (Nombre_Marca) VALUES ('Toyota');

-- MEDIDAS
INSERT INTO Medida (Valor_Medida) VALUES ('09x35');
INSERT INTO Medida (Valor_Medida) VALUES ('12x35');
INSERT INTO Medida (Valor_Medida) VALUES ('15x35');
INSERT INTO Medida (Valor_Medida) VALUES ('18x35');
INSERT INTO Medida (Valor_Medida) VALUES ('21x35');
INSERT INTO Medida (Valor_Medida) VALUES ('30x30/35');
INSERT INTO Medida (Valor_Medida) VALUES ('24x24/35');
INSERT INTO Medida (Valor_Medida) VALUES ('09x40');
INSERT INTO Medida (Valor_Medida) VALUES ('12x40');
INSERT INTO Medida (Valor_Medida) VALUES ('15x40');
INSERT INTO Medida (Valor_Medida) VALUES ('18x40');
INSERT INTO Medida (Valor_Medida) VALUES ('30x30/40');
INSERT INTO Medida (Valor_Medida) VALUES ('33x30/40');
INSERT INTO Medida (Valor_Medida) VALUES ('45x35/40');
INSERT INTO Medida (Valor_Medida) VALUES ('09x45');
INSERT INTO Medida (Valor_Medida) VALUES ('12x45');
INSERT INTO Medida (Valor_Medida) VALUES ('15x45');
INSERT INTO Medida (Valor_Medida) VALUES ('18x45');
INSERT INTO Medida (Valor_Medida) VALUES ('24x24/45');
INSERT INTO Medida (Valor_Medida) VALUES ('30x30/45');
INSERT INTO Medida (Valor_Medida) VALUES ('09x50')
INSERT INTO Medida (Valor_Medida) VALUES ('12x50');
INSERT INTO Medida (Valor_Medida) VALUES ('15x50');
INSERT INTO Medida (Valor_Medida) VALUES ('18x50');
INSERT INTO Medida (Valor_Medida) VALUES ('30x30/50');
INSERT INTO Medida (Valor_Medida) VALUES ('33x45/50');
INSERT INTO Medida (Valor_Medida) VALUES ('42x34/50');
INSERT INTO Medida (Valor_Medida) VALUES ('50x50');
INSERT INTO Medida (Valor_Medida) VALUES ('5mm');
INSERT INTO Medida (Valor_Medida) VALUES ('10mm');
INSERT INTO Medida (Valor_Medida) VALUES ('15mm');
INSERT INTO Medida (Valor_Medida) VALUES ('XXL');
INSERT INTO Medida (Valor_Medida) VALUES ('Estándar');

-- UBICACIONES
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A1', 'N1');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A1', 'N2');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A1', 'N3');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A1', 'N4');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A1', 'N5');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A2', 'N1');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A2', 'N2');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A2', 'N3');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A2', 'N4');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A2', 'N5');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A3', 'N1');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A3', 'N2');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A3', 'N3');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A3', 'N4');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A3', 'N5');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A4', 'N1');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A4', 'N2');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A4', 'N3');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A4', 'N4');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A4', 'N5');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A5', 'N1');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A5', 'N2');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A5', 'N3');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A5', 'N4');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A5', 'N5');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A6', 'N1');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A6', 'N2');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A6', 'N3');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A6', 'N4');
INSERT INTO Ubicacion (Anaquel, Nivel) VALUES ('A6', 'N5');

-- AREAS DE BORDADO
INSERT INTO Area_Bordado (Nombre_Area) VALUES ('27x35');
INSERT INTO Area_Bordado (Nombre_Area) VALUES ('30x36');
INSERT INTO Area_Bordado (Nombre_Area) VALUES ('40x46');
INSERT INTO Area_Bordado (Nombre_Area) VALUES ('45x51');
INSERT INTO Area_Bordado (Nombre_Area) VALUES ('50x56');
INSERT INTO Area_Bordado (Nombre_Area) VALUES ('40x60');

-- MAQUINAS
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (1, 1, 'SWF/E-T1501C', 'SWF001', 'Máquina SWF de 1 cabeza');
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (1, 2, 'SWF/K-UH1504-45', 'SWF002', 'Máquina SWF de 4 cabezas');
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (1, 3, 'SWF/K-Uk1508-45', 'SWF003', 'Máquina SWF de 8 cabezas');
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (1, 4, 'SWF/KE-1506-45', 'SWF004', 'Máquina SWF de 6 cabezas');
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (1, 5, 'SWF/K-UHD1502-45', 'SWF005', 'Máquina SWF Dual de 2 cabezas');
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (1, 6, 'SWF/K-UHD1208-45', 'SWF006', 'Máquina SWF Dual de 8 cabezas');
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (1, 7, 'SWF/KX-1501C', 'SWF007', 'Máquina SWF de 1 cabezas');

INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (2, 8, 'TFMX-C', 'TAJ001', 'Máquina Tajima cilíndrica');
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (2, 9, 'TEHX-C', 'TAJ002', 'Máquina Tajima de 4 cabezas');
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (2, 10, 'TME-DC', 'TAJ003', 'Máquina Tajima de 12 cabezas, 9 colores');
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (2, 11, 'DM-C', 'TAJ004', 'Máquina Tajima de 15 cabezas 12 colores');
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (2, 12, 'HX-C', 'TAJ002', 'Máquina Tajima de 6 cabezas');

INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (3, 13, 'BTH-T1', 'BRO001', 'Máquina Brother de 4 cabezas tipo 1');
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (3, 14, 'BTH-T2', 'BRO002', 'Máquina Brother de 1 cabezas tipo 2');
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (3, 15, 'BTH-T3', 'BRO003', 'Máquina Brother de 6 cabezas tipo 3');

INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (4, 16, 'HPP1512', 'HPP001', 'Máquina Happy de 15 cabezas 12 colores');
INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Descripcion_Maquina) VALUES (4, 17, 'HPP1204', 'HPP002', 'Máquina Brother de 12 cabezas 4 colores');

-- PIEZAS
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (1, 1, 2, 1, 'Huaraches Tajima', 'Verde' 34);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (2, 2, 3, 7, 'Tornillo de ajuste', 'Negro', 45);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (3, 3, 4, 2, 'Grapa', 'XXL', 24);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (4, 4, 5, 3, 'Bastidor de gorra', 'Fijo', 4);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (5, 5, 6, 4, 'Bastidor tubular', 'brazo largo', 65);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (6, 6, 7, 5, 'Bastidor plano', 'SWF', 20);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (7, 7, 8, 6, 'Catcher', 'Popote izquierdo', 17);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (8, 8, 9, 8, 'Catcher', 'Popote derecho', 20);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (9, 9, 10, 9, 'Barra', 'SWF', 94);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (10, 10, 11, 10, 'Barra', 'Tajima', 65);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (11, 11, 12, 11, 'Prensa tela', 'No calibrable', 4);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (12, 12, 13, 12, 'Prensa tela', 'calibrable', 10);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (13, 13, 14, 13, 'Resortes', 'Copete', 400);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (14, 14, 15, 14, 'Tira hilo', 'Curvo', 34);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (15, 15, 16, 15, 'Manguera', 'tipo hilo', 53);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (16, 16, 17, 16, 'Manguera', 'tipo lubricación', 56);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (17, 17, 18, 17, 'Embastador', 'Tajima', 30);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (18, 18, 19, 18, 'Aro de gorra', 'Cincho simple', 12);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (19, 19, 20, 19, 'Aro de gorra', 'Doble cincho', 200);
INSERT INTO Pieza (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (20, 20, 21, 20, 'Aro de gorra', 'Media luna', 300);

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
