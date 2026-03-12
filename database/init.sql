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
    Nivel VARCHAR2(5) NOT NUll,
    Nivel_Uso NUMBER NOT NULL CHECK (Nivel_Uso BETWEEN 1 AND 5)
);

CREATE TABLE Piezas (
    ID_Pieza NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ID_Categoria NUMBER NOT NULL,
    ID_Maquina NUMBER,
    ID_Ubicacion NUMBER,
    Nombre VARCHAR2(50) NOT NULL,
    Marca VARCHAR2(50) NOT NULL,
    Descripcion VARCHAR2(50),
    Modelo VARCHAR2(50),
    Medida VARCHAR2(50),
    Area_Bordado VARCHAR2(50),
    Color_Tipo VARCHAR2(50),
    Stock_Actual NUMBER(4) DEFAULT 0 CHECK (Stock_Actual >= 0),
    Stock_Minimo NUMBER(4) DEFAULT 5,
    CONSTRAINT ID_Cat_Pie_Cat FOREIGN KEY (ID_Categoria) REFERENCES Categorias (ID_Categoria),
    CONSTRAINT ID_Maq_Pie_Maq FOREIGN KEY (ID_Maquina) REFERENCES Maquinas (ID_Maquina),
    CONSTRAINT ID_Ubi_Pie_Ubi FOREIGN KEY (ID_Ubicacion) REFERENCES Ubicaciones (ID_Ubicacion)
);

CREATE TABLE Usuarios (
    ID_Usuario NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Nombre_Completo VARCHAR2(40) NOT NULL,
    Rol VARCHAR2(20) NOT NULL,
    Contrasena VARCHAR2(20)
);

CREATE TABLE Movimientos (
    ID_Movimiento NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ID_Pieza NUMBER NOT NULL,
    ID_Usuario NUMBER NOT NULL,
    Tipo_Movimiento VARCHAR2(20) CHECK (Tipo_Movimiento IN ('ENTRADA', 'SALIDA')),
    Cantidad NUMBER(4) NOT NULL CHECK (Cantidad > 0),
    Fecha_Hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ID_Pieza_Mov_Pie FOREIGN KEY (ID_Pieza) REFERENCES Piezas (ID_Pieza),
    CONSTRAINT ID_Usuario_Mov_Usu FOREIGN KEY (ID_Usuario) REFERENCES Usuarios (ID_Usuario)
);
