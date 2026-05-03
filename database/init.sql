ALTER SESSION SET CONTAINER = XEPDB1;
ALTER SESSION SET CURRENT_SCHEMA = BODEGA_USER;

CREATE TABLE Categorias (
    ID_Categoria NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Nombre_Categoria  VARCHAR2(30) NOT NULL
);

CREATE TABLE Maquinas (
    ID_Maquina NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Nombre_Modelo VARCHAR2(30) NOT NULL,
    Descripcion_Maquina VARCHAR2(100) 
);

CREATE TABLE Ubicaciones (
    ID_Ubicacion NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Anaquel VARCHAR2(5) NOT NULL,
    Nivel VARCHAR2(5) NOT NUll
);

CREATE TABLE Medidas (
    ID_Medida NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Valor_Medida VARCHAR2(50) NOT NULL
);

CREATE TABLE Marcas (
    ID_Marca NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Nombre_Marca VARCHAR2(50) UNIQUE NOT NULL
);

CREATE TABLE Areas_Bordado (
    ID_Area NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Nombre_Area VARCHAR2(50) NOT NULL
);

CREATE TABLE Piezas (
    ID_Pieza NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ID_Categoria NUMBER NOT NULL,
    ID_Medida NUMBER NOT NULL,
    ID_Marca NUMBER NOT NULL,
    ID_Maquina NUMBER,
    ID_Ubicacion NUMBER,
    ID_Areas_Bordado NUMBER,
    Nombre VARCHAR2(50) NOT NULL,
    Modelo VARCHAR2(50),
    Color_Tipo VARCHAR2(50),
    Stock_Actual NUMBER(4) DEFAULT 0 CHECK (Stock_Actual >= 0),
    CONSTRAINT ID_Cat_Pie_Cat FOREIGN KEY (ID_Categoria) REFERENCES Categorias (ID_Categoria),
    CONSTRAINT ID_Maq_Pie_Maq FOREIGN KEY (ID_Maquina) REFERENCES Maquinas (ID_Maquina),
    CONSTRAINT ID_Ubi_Pie_Ubi FOREIGN KEY (ID_Ubicacion) REFERENCES Ubicaciones (ID_Ubicacion),
    CONSTRAINT ID_Med_Pie_Med FOREIGN KEY (ID_Medida) REFERENCES Medidas (ID_Medida),
    CONSTRAINT ID_Mar_Pie_Mar FOREIGN KEY (ID_Marca) REFERENCES Marcas (ID_Marca),
    CONSTRAINT ID_Are_Pie_Are FOREIGN KEY (ID_Areas_Bordado) REFERENCES Areas_Bordado (ID_Area)
);

CREATE TABLE Usuarios (
    ID_Usuario NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Nombre_Completo VARCHAR2(40) NOT NULL,
    Rol VARCHAR2(20) NOT NULL,
    Estado VARCHAR2(20) NOT NULL,
    Contrasena VARCHAR2(255)
);

CREATE TABLE Movimientos (
    ID_Movimiento NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ID_Pieza NUMBER NOT NULL,
    ID_Usuario NUMBER NOT NULL,
    Tipo_Movimiento VARCHAR2(20) CHECK (Tipo_Movimiento IN ('ENTRADA', 'SALIDA')),
    Cantidad NUMBER(4) NOT NULL CHECK (Cantidad > 0),
    Nota VARCHAR2(100),
    Stock_Resultante NUMBER NOT NULL,
    Fecha_Hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ID_Pieza_Mov_Pie FOREIGN KEY (ID_Pieza) REFERENCES Piezas (ID_Pieza),
    CONSTRAINT ID_Usuario_Mov_Usu FOREIGN KEY (ID_Usuario) REFERENCES Usuarios (ID_Usuario)
);

-------------------------------- INSERT PARA PRUEBAS -----------------------------------------------
INSERT INTO Usuarios (Nombre_Completo, Rol, Estado, Contrasena) VALUES ('Admin SWF', 'Administrador', 'ACTIVO', 'admin123');
INSERT INTO Usuarios (Nombre_Completo, Rol, Estado, Contrasena) VALUES ('Trabajador SWF', 'Trabajador', 'ACTIVO', 'trabajador123');

INSERT INTO Categorias (Nombre_Categoria) VALUES ('Aros');
INSERT INTO Categorias (Nombre_Categoria) VALUES ('Tornillos');
INSERT INTO Categorias (Nombre_Categoria) VALUES ('Bastidores');
INSERT INTO Categorias (Nombre_Categoria) VALUES ('Agujas');

INSERT INTO Marcas (Nombre_Marca) VALUES ('SWF');
INSERT INTO Marcas (Nombre_Marca) VALUES ('Tajima');
INSERT INTO Marcas (Nombre_Marca) VALUES ('Pantogram');
INSERT INTO Marcas (Nombre_Marca) VALUES ('Barudan');
INSERT INTO Marcas (Nombre_Marca) VALUES ('Brother');

INSERT INTO Medidas (Valor_Medida) VALUES ('18x35');
INSERT INTO Medidas (Valor_Medida) VALUES ('15x15');
INSERT INTO Medidas (Valor_Medida) VALUES ('12x12');
INSERT INTO Medidas (Valor_Medida) VALUES ('5mm');
INSERT INTO Medidas (Valor_Medida) VALUES ('10mm');
INSERT INTO Medidas (Valor_Medida) VALUES ('15mm');
INSERT INTO Medidas (Valor_Medida) VALUES ('XXL');
INSERT INTO Medidas (Valor_Medida) VALUES ('Estándar');
INSERT INTO Medidas (Valor_Medida) VALUES ('75/11');
INSERT INTO Medidas (Valor_Medida) VALUES ('80/12');

INSERT INTO Ubicaciones (Anaquel, Nivel) VALUES ('A1', 'N1');
INSERT INTO Ubicaciones (Anaquel, Nivel) VALUES ('A1', 'N2');

INSERT INTO Piezas (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Stock_Actual) VALUES (1, 1, 2, 1, 'Aro Magnético', 12);
INSERT INTO Piezas (ID_Categoria, ID_Ubicacion, ID_Marca, ID_Medida, Nombre, Color_Tipo, Stock_Actual) VALUES (2, 2, 3, 7, 'Tornillo de ajuste', 'Negro', 45);

INSERT INTO Maquinas (Nombre_Modelo, Descripcion_Maquina) VALUES ('SWF/E-T1501C', 'Máquina SWF de 1 cabeza');
INSERT INTO Maquinas (Nombre_Modelo, Descripcion_Maquina) VALUES ('TFMX-C', 'Máquina Tajima cilíndrica');
INSERT INTO Maquinas (Nombre_Modelo, Descripcion_Maquina) VALUES ('SWF/K-UH1504-45', 'Máquina SWF de 4 cabezas');

INSERT INTO Areas_Bordado (Nombre_Area) VALUES ('N/A');
INSERT INTO Areas_Bordado (Nombre_Area) VALUES ('Plano');
INSERT INTO Areas_Bordado (Nombre_Area) VALUES ('Gorra');
INSERT INTO Areas_Bordado (Nombre_Area) VALUES ('Tubular');
INSERT INTO Areas_Bordado (Nombre_Area) VALUES ('Prenda Armada');

COMMIT;

----------------------------- PROYECTO GESTION BASE DE DATOS -------------------------------