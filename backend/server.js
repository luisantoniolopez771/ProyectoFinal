const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
    user: process.env.DB_USER || 'BODEGA_USER',
    password: process.env.DB_PASSWORD || 'bodega_pass',
    connectString: process.env.DB_CONNECTION_STRING || 'database:1521/XEPDB1'
};

app.get('/api/test', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(`SELECT table_name FROM user_tables`);

        res.json({
            mensaje: "¡Conexión exitosa a Oracle!",
            tablas: result.rows
        });

    } catch (err) {
        console.error("Error conectando a Oracle:", err);
        res.status(500).json({ error: "Fallo la conexión a la base de datos", detalle: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

// INICIO DE SESION ---------------------------------------------------------------------------------------------------------------------------------------------------------------
app.get('/api/login', async (req, res) => {
    const usuarioRecibido = req.body.usuario;
    const passwordRecibido = req.body.password;


    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const consultaLogin = `SELECT * FROM Usuario WHERE Nombre_Completo = :usr AND Contrasena = :pwd`;

        const resultLogin = await connection.execute(consultaLogin, { usr: usuarioRecibido, pwd: passwordRecibido }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (resultLogin.rows.length > 0) {
            const usuarioEncontrado = resultLogin.rows[0];

            console.log("Fila del usuario desde Oracle:", usuarioEncontrado);

            const rolEncontrado = usuarioEncontrado.ROL;

            const idUsuarioEncontrado = usuarioEncontrado.ID_USUARIO;

            const estadoEncontrado = usuarioEncontrado.ESTADO;

            res.json({
                exito: true,
                mensaje: usuarioRecibido,
                rol: rolEncontrado,
                idUsuario: idUsuarioEncontrado,
                estado: estadoEncontrado
            });
        } else {
            res.status(401).json({
                exito: false,
                error: `Usuario o Contraseña incorrectos`
            });
        }
    } catch (err) {
        console.error("Error en el servidor: ", err);
        res.status(500).json({ exito: false, error: "Fallo la conexión a la base de datos" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error("Error al cerrar la conexion: ", err); }
        }
    }
});

app.listen(port, () => {
    console.log(`API Backend de la Bodega corriendo en el puerto ${port}`);
});

//CARGAR INVENTARIO PRINCIPAL -----------------------------------------------------------------------------------------------------------------------------------------
app.get('/api/inventario', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const consultaInventario = `SELECT 
        p.ID_Pieza,
        p.Nombre, 
        m.Nombre_Marca AS Marca, 
        med.Valor_Medida AS Medida, 
        c.Nombre_Categoria AS Categoria, 
        u.Anaquel || '-' || u.Nivel AS Ubicacion,  
        p.Color_Tipo,  
        p.Stock_Actual
        FROM Pieza p
        INNER JOIN Categoria c ON p.ID_Categoria = c.ID_Categoria
        INNER JOIN Marca m ON p.ID_Marca = m.ID_Marca
        LEFT JOIN Medida med ON p.ID_Medida = med.ID_Medida
        LEFT JOIN Ubicacion u ON p.ID_Ubicacion = u.ID_Ubicacion
        WHERE p.Estado = 'ACTIVO'
        ORDER BY p.Nombre ASC`;

        const consultaMaquina = `SELECT
        m.ID_Maquina,
        ma.Nombre_Marca AS MARCA,
        a.Nombre_Area AS AREA,
        m.Nombre_Modelo AS MODELO,
        m.NoSerie,
        m.Descripcion_Maquina AS DESCRIPCION
        FROM Maquina m
        INNER JOIN Marca ma ON m.ID_Marca = ma.ID_Marca
        INNER JOIN Area_Bordado a ON m.ID_Area = a.ID_Area
        ORDER BY m.Nombre_Modelo ASC`;

        const resultadoInventario = await connection.execute(consultaInventario, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const resultadoMaquina = await connection.execute(consultaMaquina, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({ exito: true, datosInventario: resultadoInventario.rows, datosMaquina: resultadoMaquina.rows });

    } catch (err) {
        console.error("Error consultando el inventario:", err);
        res.status(500).json({ exito: false, error: "Fallo al traer los datos" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error("Error al cerrar la conexion: ", err); }
        }
    }
});

//MOSTRAR PIEZAS POR MAQUINA -------------------------------------------------------------------------------------------------------------------------------------
app.get('/api/piezas-por-maquina/:idMaquina', async (req, res) => {
    const idMaq = req.params.idMaquina;

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const sqlPiezasMaquina = `SELECT p.Nombre, p.ID_Pieza, p.STOCK_ACTUAL AS STOCK, u.Anaquel || '-' || u.Nivel AS UBICACION FROM Pieza p 
        INNER JOIN Compatibilidad c ON p.ID_Pieza = c.ID_Pieza
        INNER JOIN Ubicacion u ON p.ID_Ubicacion = u.ID_Ubicacion
        WHERE c.ID_Maquina = :idm`;
        const resPiezasMaquina = await connection.execute(sqlPiezasMaquina, { idm: idMaq }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({ exito: true, piezas: resPiezasMaquina.rows });

    } catch (err) {
        console.error("ERROR AL CONSULTAR LAS PIEZAS DE LA MAQUINA: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL CONSULTAR LAS PIEZAS DE LA MAQUINA" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//CARGAR DATOS ACTUALES MAQUINA ----------------------------------------------------------------------------------------------------------------------------------
app.get('/api/datos-maquina/:idMaquina', async (req, res) => {
    const idMaq = req.params.idMaquina;

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const sqlDatosMaquina = `SELECT * FROM Maquina WHERE ID_Maquina = :idm`;
        const resDatosMaquina = await connection.execute(sqlDatosMaquina, { idm: idMaq }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({ exito: true, maquina: resDatosMaquina.rows });

    } catch (err) {
        console.error("ERROR AL CONSULTAR LOS DATOS DE LA MAQUINA: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL CONSULTAR LA MAQUINA" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//ACTUALIZAR MAQUINA ---------------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/actualizar-maquina', async (req, res) => {
    const id = req.body.id;
    const modelo = req.body.modelo;
    const serie = req.body.serie;
    const marca = req.body.marca;
    const area = req.body.area;
    const descripcion = req.body.descripcion;

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const updateMaquina = `UPDATE Maquina SET Nombre_Modelo = :mod, NoSerie = :nos, ID_Marca = :mar, ID_Area = :are, Descripcion_Maquina = :des WHERE ID_Maquina = :idm`;
        const respuestaUpdateMaquina = await connection.execute(updateMaquina, { mod: modelo, nos: serie, mar: marca, are: area, des: descripcion, idm: id });

        await connection.commit();

        res.json({ exito: true, mensaje: "MAQUINA ACTUALIZADA CON EXITO!" });

    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (errRollback) { console.error("Error al hacer rollback: ", errRollback); }
        }
        console.error("ERROR AL ACTUALIZAR LA MAQUINA: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL ACTUALIZAR LA MAQUINA" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//CARGAR DATOS ACTUALES PIEZA ------------------------------------------------------------------------------------------------------------------------------------
app.get('/api/datos-pieza/:idPieza', async (req, res) => {
    const idPie = req.params.idPieza;

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const sqlDatosPieza = `SELECT * FROM Pieza Where ID_Pieza = :idp`;
        const resDatosPieza = await connection.execute(sqlDatosPieza, { idp: idPie }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({ exito: true, pieza: resDatosPieza.rows });

    } catch (err) {
        console.error("ERROR AL CONSULTAR LOS DATOS DE LA PIEZA: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL CONSULTAR LA PIEZA" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//ACTUALIZAR PIEZA -----------------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/actualizar-pieza', async (req, res) => {

    const id = req.body.id;
    const nombre = req.body.nombre;
    const color = req.body.color;
    const marca = req.body.marca;
    const ubicacion = req.body.ubicacion;
    const categoria = req.body.categoria;
    const medida = req.body.medida;

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const updatePieza = `UPDATE Pieza SET Nombre = :nom, Color_Tipo = :col, ID_Marca = :mar, ID_Ubicacion = :ubi, ID_Categoria = :cat, ID_Medida = :med WHERE ID_Pieza = :idp`;
        const respuestaUpdateRespuesta = await connection.execute(updatePieza, { nom: nombre, col: color, mar: marca, ubi: ubicacion, cat: categoria, med: medida, idp: id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        await connection.commit();

        res.json({ exito: true, mensaje: "PIEZA ACTUALIZADA CON EXITO!" });

    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (errRollback) { console.error("Error al hacer rollback: ", errRollback); }
        }
        console.error("ERROR AL ACTUALIZAR LA PIEZA: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL ACTUALIZAR LA PIEZA" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//CARGAR CATEGORIAS ----------------------------------------------------------------------------------------------------------------------------------------------
app.get('/api/categorias', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const sqlCategorias = `SELECT * FROM Categoria ORDER BY Nombre_Categoria ASC`;
        const resCat = await connection.execute(sqlCategorias, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({ exito: true, categorias: resCat.rows });

    } catch (err) {
        console.error("Error al traer los catálogos:", err);
        res.status(500).json({ exito: false, error: "Error interno" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//CARGAR LOS PRODUCTOS POR CATEGORIA ---------------------------------------------------------------------------------------------------------------------------
app.get('/api/productos-existentes/:idCategoria', async (req, res) => {
    const idCat = req.params.idCategoria;
    let connection;
    let sqlProductos = ``;
    let resProductos = ``;

    try {

        connection = await oracledb.getConnection(dbConfig);

        if (idCat !== "x") {
            sqlProductos = `SELECT p.Nombre, m.Nombre_Marca as Marca, p.Stock_Actual AS Stock, p.ID_Pieza FROM Pieza p INNER JOIN Marca m ON p.ID_Marca =  m.ID_Marca WHERE p.ID_Categoria = :idc`;
            resProductos = await connection.execute(sqlProductos, { idc: idCat }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        } else {
            sqlProductos = `SELECT p.Nombre, m.Nombre_Marca as Marca, p.Stock_Actual AS Stock, p.ID_Pieza FROM Pieza p INNER JOIN Marca m ON p.ID_Marca =  m.ID_Marca ORDER BY p.Nombre ASC`;
            resProductos = await connection.execute(sqlProductos, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        };

        res.json({ exito: true, productos: resProductos.rows });

    } catch (err) {
        console.error("Error buscando piezas por categoría:", err);
        res.status(500).json({ exito: false, error: "Fallo al buscar los nombres" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//REGISTRAR TRANSACCION ---------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/registrar-transaccion', async (req, res) => {
    const idPieza = req.body.idPieza;
    const cantidad = req.body.cantidad;
    const transaccion = req.body.transaccion;
    const motivo = req.body.motivo;
    const idUsuario = parseInt(req.body.idUsuario);

    let connection;

    try {

        let crearTransaccion = '';
        let registrarTransaccion = '';
        let sim = '';

        if (transaccion === 'ENTRADA') {
            crearTransaccion = `UPDATE Pieza SET Stock_Actual = Stock_Actual + :can WHERE ID_Pieza = :idp`;
            registrarTransaccion = `INSERT INTO Movimiento (ID_Pieza, ID_Usuario, Tipo_Movimiento, Cantidad, Nota, Stock_Resultante) VALUES (:idp, :idu, :tip, :can, :mot, (SELECT Stock_Actual + :can FROM Pieza WHERE ID_Pieza = :idp))`;
        } else {
            crearTransaccion = `UPDATE Pieza SET Stock_Actual = Stock_Actual - :can WHERE ID_Pieza = :idp`;
            registrarTransaccion = `INSERT INTO Movimiento (ID_Pieza, ID_Usuario, Tipo_Movimiento, Cantidad, Nota, Stock_Resultante) VALUES (:idp, :idu, :tip, :can, :mot, (SELECT Stock_Actual - :can FROM Pieza WHERE ID_Pieza = :idp))`;
        };

        connection = await oracledb.getConnection(dbConfig);

        const resultadoRegistro = await connection.execute(registrarTransaccion, { idp: idPieza, idu: idUsuario, tip: transaccion, can: cantidad, mot: motivo }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const resultadoTransaccion = await connection.execute(crearTransaccion, { can: cantidad, idp: idPieza }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        await connection.commit();

        res.json({ exito: true, mensaje: "Transacción registrada correctamente" });

    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (errRollback) { console.error("Error al hacer rollback: ", errRollback); }
        }
        console.error("Error en la transacción:", err);
        res.status(500).json({ exito: false, error: "Error al registrar el movimiento" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//CARGAR MOVIMIENTOS ----------------------------------------------------------------------------------------------------------------------------------------------------
app.get('/api/consultar-movimientos', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const consultaMovimientos = `SELECT m.Fecha_Hora, p.Nombre, m.Tipo_Movimiento AS TIPO, m.Cantidad, u.Nombre_Completo AS USUARIO, m.Stock_Resultante AS STOCK, m.NOTA
        FROM Movimiento m INNER JOIN Pieza p ON m.ID_Pieza = p.ID_Pieza
        INNER JOIN Usuario u ON m.ID_Usuario = u.ID_Usuario
        ORDER BY m.Fecha_Hora ASC`;
        const respuestaMovimientos = await connection.execute(consultaMovimientos, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({ exito: true, movimientos: respuestaMovimientos.rows });

    } catch (err) {
        console.error("Error al consultar los movimentos: ", err);
        res.status(500).json({ exito: false, error: "Fallo al buscar los movimientos" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//REGISTRAR USUARIO NUEVO -----------------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/registrar-usuario', async (req, res) => {

    const nombreUsuario = req.body.nombre;
    const contraUsuario = req.body.contra;
    const rolUsuario = req.body.rol;

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const altaUsuario = `INSERT INTO Usuario (Nombre_Completo, Rol, Estado, Contrasena) VALUES ( :nom, :rol, 'ACTIVO', :con)`;
        const resAltaUsuario = await connection.execute(altaUsuario, { nom: nombreUsuario, rol: rolUsuario, con: contraUsuario }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({ exito: true, mensaje: "USUARIO REGISTRADO CON EXITO!" });

        await connection.commit();

    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (errRollback) { console.error("Error al hacer rollback: ", errRollback); }
        }
        console.error("ERROR AL REGISTRAR EL USUARIO: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL REGISTRAR EL USUARIO" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//MOSTRAR USUARIOS --------------------------------------------------------------------------------------------------------------------------------------------------------
app.get('/api/mostrar-usuarios', async (req, res) => {

    let connection;

    try {

        connection = await oracledb.getConnection(dbConfig);

        const consultarUsuarios = `SELECT ID_Usuario, Nombre_Completo, Rol, Estado FROM Usuario ORDER BY ID_Usuario ASC`;
        const respuestaUsuarios = await connection.execute(consultarUsuarios, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({ exito: true, usuarios: respuestaUsuarios.rows });

    } catch (err) {
        console.error("ERROR AL CARGAR LOS USUARIOS: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL CARGAR LOS USUARIOS" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//CAMBIAR ESTADO DE USUARIO ------------------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/cambiar-estado-usuario', async (req, res) => {

    const idUsuario = req.body.idUsuario;
    const estadoActual = req.body.estadoActual;

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        let nuevoEstado = '';

        if (estadoActual === 'ACTIVO') {
            nuevoEstado = 'INACTIVO';
        } else {
            nuevoEstado = 'ACTIVO';
        }

        const actualizarUsuario = `UPDATE Usuario SET Estado = :est WHERE ID_Usuario = :idu`;
        const respuestaActualizarusuario = await connection.execute(actualizarUsuario, { est: nuevoEstado, idu: idUsuario }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        await connection.commit();

        res.json({ exito: true, mensaje: "ESTADO CAMBIADO CON EXITO" });

    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (errRollback) { console.error("Error al hacer rollback: ", errRollback); }
        }
        console.error("ERROR AL ACTUALIZAR EL ESTADO DEL USUARIO: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL ACTUALIZAR EL USUARIO" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//DATOS ACTUALES USUARIO --------------------------------------------------------------------------------------------------------------------------------------
app.get('/api/datos-usuario/:idUsuario', async (req, res) => {
    const idUsr = req.params.idUsuario;

    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const sqlDatosUsuario = `SELECT * FROM Usuario WHERE ID_Usuario = :idu`;
        const resDatosUsuario = await connection.execute(sqlDatosUsuario, { idu: idUsr }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({ exito: true, usuario: resDatosUsuario.rows });

    } catch (err) {
        console.error("ERROR AL CONSULTAR EL USUARIO: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL CONSULTAR EL USUARIO" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//ACTUALIZAR USUARIO ------------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/actualizar-usuario', async (req, res) => {
    const id = req.body.id;
    const rol = req.body.rol;
    const nombre = req.body.nombre;
    const contrasena = req.body.contrasena;

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const updateUsuario = `UPDATE Usuario SET Rol = :rol, Nombre_Completo = :nom, Contrasena = :con WHERE ID_Usuario = :idu`;
        const respuestaUpdateUsuario = await connection.execute(updateUsuario, { rol: rol, nom: nombre, con: contrasena, idu: id });

        await connection.commit();

        res.json({ exito: true, mensaje: "USUARIO ACTUALIZADO CON EXITO!" });

    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (errRollback) { console.error("Error al hacer rollback: ", errRollback); }
        }
        console.error("ERROR AL ACTUALIZAR EL USUARIO: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL ACTUALIZAR EL USUARIO" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//CARGAR LOS CATALOGOS PARA AGREGAR UN NUEVO PRODUCTO ---------------------------------------------------------------------------------------------------------
app.get('/api/catalogos', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const sqlCategorias = await connection.execute(`SELECT * FROM Categoria ORDER BY ID_Categoria ASC`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const sqlMarcas = await connection.execute(`SELECT * FROM Marca ORDER BY ID_Marca ASC`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const sqlMedidas = await connection.execute(`SELECT * FROM Medida ORDER BY ID_Medida ASC`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const sqlMaquinas = await connection.execute(`SELECT * FROM Maquina ORDER BY ID_Maquina ASC`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const sqlUbicaciones = await connection.execute(`SELECT * FROM Ubicacion ORDER BY ID_Ubicacion ASC`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const sqlAreasBordado = await connection.execute(`SELECT * FROM Area_Bordado ORDER BY ID_Area ASC`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({
            exito: true,
            categorias: sqlCategorias.rows,
            marcas: sqlMarcas.rows,
            medidas: sqlMedidas.rows,
            ubicaciones: sqlUbicaciones.rows,
            areasbordado: sqlAreasBordado.rows
        });

    } catch (err) {
        console.error("Error al traer los catálogos:", err);
        res.status(500).json({ exito: false, error: "Error interno" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//REGISTRAR NUEVO PRODUCTO ---------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/registrar-producto', async (req, res) => {
    const nombre = req.body.nombre;
    const stock = req.body.stock || 0;
    const categoria = req.body.categoria || null;
    const marca = req.body.marca || null;
    const medida = req.body.medida || null;
    const maquina = req.body.maquina || null;
    const modelo = req.body.modelo || null;
    const ubicacion = req.body.ubicacion || null;
    const area = req.body.area || null;
    const color = req.body.color || null;

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const altaPieza = `INSERT INTO Pieza (ID_Categoria, ID_Medida, ID_Marca, ID_Maquina, ID_Ubicacion, ID_Area_Bordado, Nombre, Modelo, Color_Tipo, Stock_Actual) VALUES (:idcat, :idmed, :idmar, :idmaq, :idubi, :idare, :nom, :mod, :col, :sto)`;
        const respuestaAltaPieza = await connection.execute(altaPieza, { idcat: categoria, idmed: medida, idmar: marca, idmaq: maquina, idubi: ubicacion, idare: area, nom: nombre, mod: modelo, col: color, sto: stock }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        await connection.commit();

        res.json({ exito: true, mensaje: "PRODUCTO AGREGADO CON EXITO" });

    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (errRollback) { console.error("Error al hacer rollback: ", errRollback); }
        }
        console.error("ERROR AL AGREGAR EL PRODUCTO: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL AGREGAR EL PRODUCTO" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//REGISTRAR MAQUINA ----------------------------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/registrar-maquina', async (req, res) => {
    const modelo = req.body.modelo;
    const serie = req.body.serie;
    const marca = req.body.marca;
    const area = req.body.area;
    const bastidor = req.body.bastidor;
    const descripcion = req.body.descripcion;

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const altaMaquina = `INSERT INTO Maquina (ID_Marca, ID_Area, Nombre_Modelo, NoSerie, Tipo_Bastidor, Descripcion_Maquina) VALUES (:idmar, :idare, :nom, :ser, :bas, :des)`;

        const respuestaAltaMaquina = await connection.execute(altaMaquina, { idmar: marca, idare: area, nom: modelo, ser: serie, bas: bastidor, des: descripcion }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        await connection.commit();

        res.json({ exito: true, mensaje: "MAQUINA AGREGADA CON EXITO" });

    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (errRollback) { console.error("Error al hacer rollback: ", errRollback); }
        }
        console.error("ERROR AL AGREGAR LA MAQUINA: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL AGREGAR LA MAQUINA" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//ALTA TABLAS SECUNDARIAS ----------------------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/alta-catalogos', async (req, res) => {

    const tipo = req.body.tipo;
    const dato = req.body.dato;

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        let altaTipo = '';
        let parametros = {};
        let resultadoAltaCatalogo = ``;

        if (tipo === 'CATEGORIA') {
            altaTipo = `INSERT INTO Categoria (Nombre_Categoria) VALUES (:dat)`;

            resultadoAltaCatalogo = await connection.execute(altaTipo, { dat: dato }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        } else if (tipo === 'MARCA') {
            altaTipo = `INSERT INTO Marca (Nombre_Marca) VALUES (:dat)`;

            resultadoAltaCatalogo = await connection.execute(altaTipo, { dat: dato }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        } else if (tipo === 'MEDIDA') {
            altaTipo = `INSERT INTO Medida (Valor_Medida) VALUES (:dat)`;

            resultadoAltaCatalogo = await connection.execute(altaTipo, { dat: dato }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        } else if (tipo === 'AREA') {
            altaTipo = `INSERT INTO Area_Bordado (Nombre_Area) VALUES (:dat)`;

            resultadoAltaCatalogo = await connection.execute(altaTipo, { dat: dato }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        } else if (tipo === 'UBICACION') {
            altaTipo = `INSERT INTO Ubicacion (Anaquel, Nivel) VALUES (:anaq, :niv)`;
            parametros = { anaq: dato.anaquel, niv: dato.nivel };

            resultadoAltaCatalogo = await connection.execute(altaTipo, parametros, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        }

        await connection.commit();

        res.json({ exito: true, mensaje: dato + " AGREGADO CON EXITO " });

    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (errRollback) { console.error("Error al hacer rollback: ", errRollback); }
        }
        console.error("ERROR AL REALIZAR LA ALTA: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL DAR LA ALTA" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//EDITAR TABLAS SECUNDARIAS --------------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/editar-catalogo', async (req, res) => {
    const tipo = req.body.tipo;
    const id = req.body.id;
    const dato1 = req.body.dato1;
    const dato2 = req.body.dato2;
    const dato3 = req.body.dato3;

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        if (tipo == 'UBICACION') {
            const updateUbicacion = `UPDATE Ubicacion SET Anaquel = :ana, NIVEL = :niv WHERE ID_Ubicacion = :idu`;
            const resUpdateUbicacion = await connection.execute(updateUbicacion, { ana: dato1, niv: dato2, idu: id });
        } else if (tipo == 'CATEGORIA') {
            const updateCatalogo = `UPDATE Categoria SET Nombre_Categoria = :cat WHERE ID_Categoria = :idc`;
            const resUpdateCatalogo = await connection.execute(updateCatalogo, { cat: dato3, idc: id });
        } else if (tipo == 'MARCA') {
            const updateMarca = `UPDATE Marca SET Nombre_Marca = :mar WHERE ID_Marca = :idm`;
            const resUpdateMarca = await connection.execute(updateMarca, { mar: dato3, idm: id });
        } else if (tipo == 'MEDIDA') {
            const updateMedida = `UPDATE Medida SET Valor_Medida = :med WHERE ID_Medida = :idme`;
            const resUpdateMedida = await connection.execute(updateMedida, { med: dato3, idme: id });
        } else if (tipo == 'AREA') {
            const updateArea = `UPDATE Area_Bordado SET Nombre_Area = :are WHERE ID_Area = :ida`;
            const resUpdateArea = await connection.execute(updateArea, { are: dato3, ida: id });
        }

        await connection.commit();

        res.json({ exito: true, mensaje: tipo + " MODIFICADO CON EXITO!" });

    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (errRollback) { console.error("Error al hacer rollback: ", errRollback); }
        }
        console.error("ERROR AL ACTUALIZAR EL CATALOGO: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL ACTUALIZAR EL CATALOGO" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//LLENAR TABLA PIEZAS Y MAQUINAS ---------------------------------------------------------------------------------------------------------------------------------------
app.get('/api/consulta-piezas-maquinas', async (req, res) => {

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const consultaPiezas = `SELECT p.ID_Pieza, p.Nombre, p.Color_Tipo, m.Nombre_Marca AS MARCA, me.Valor_Medida AS MEDIDA FROM Pieza p
        INNER JOIN Marca m ON p.ID_Marca = m.ID_Marca
        INNER JOIN Medida me ON p.ID_Medida = me.ID_Medida`;

        const consultaMaquinas = `SELECT ID_Maquina, Nombre_Modelo FROM Maquina`;

        const consultaCompatibilidad = `SELECT p.ID_Pieza, p.Nombre AS Pieza, m.ID_Maquina, m.Nombre_Modelo AS Maquina FROM Compatibilidad c
        INNER JOIN Pieza p ON p.ID_Pieza = c.ID_Pieza
        INNER JOIN Maquina m ON m.ID_Maquina = c.ID_Maquina`;

        const respuestaPiezas = await connection.execute(consultaPiezas, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        const respuestaMaquinas = await connection.execute(consultaMaquinas, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        const respuestaCombatibilidad = await connection.execute(consultaCompatibilidad, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({ exito: true, piezas: respuestaPiezas.rows, maquinas: respuestaMaquinas.rows, relaciones: respuestaCombatibilidad.rows });

    } catch (err) {
        console.error("ERROR AL CONSULTAR LAS PIEZAS Y/O MAQUINAS: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL CONSULTAR LAS PIEZAS Y/O STOCK" });
    } finally {
        if (connection) {
            try { await connection.close() } catch (err) { console.error(err); }
        }
    }
});

//VINCULAR PIEZA Y MAQUINA --------------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/vincular-pieza-maquina', async (req, res) => {
    const idPieza = req.body.pieza;
    const idMaquina = req.body.maquina;

    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const altaVinvulacion = `INSERT INTO Compatibilidad (ID_Pieza, ID_Maquina) VALUES (:idp, :idm)`;
        const respuestaVinculacion = await connection.execute(altaVinvulacion, { idp: idPieza, idm: idMaquina }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        await connection.commit();

        res.json({ exito: true, mensaje: "VINCULACION REALIZADA CON EXITO" });

    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (errRollback) { console.error("Error al hacer rollback: ", errRollback); }
        }
        console.error("ERROR AL REALIZAR LA VINCULACION: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL REALIZAR LA VINCULACION" });
    } finally {
        if (connection) {
            try { await connection.close() } catch (err) { console.error(err); }
        }
    }
});

//BORRAR RELACION PIEZA Y MAQUINA --------------------------------------------------------------------------------------------------------------------------------------
app.post('/api/borrar-relacion', async (req, res) => {
    const idPieza = req.body.pieza;
    const idMaquina = req.body.maquina;

    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const bajaVinculacion = `DELETE FROM Compatibilidad WHERE ID_Pieza = :idp AND ID_Maquina = :idm`;
        const resBajaVinculacion = await connection.execute(bajaVinculacion, { idp: idPieza, idm: idMaquina }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        await connection.commit();

        res.json({ exito: true, mensaje: "RELACION BORRADA CON EXITO" });

    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (errRollback) { console.error("Error al hacer rollback: ", errRollback); }
        }
        console.error("ERROR AL BORRAR LA RELACION: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL BORRAR LA RELACION" });
    } finally {
        if (connection) {
            try { await connection.close() } catch (err) { console.error(err); }
        }
    }
});

//CONSULTAR STOCK BAJOS ------------------------------------------------------------------------------------------------------------------------------------------------
app.get('/api/emergencia-stock', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const bajoStock = `SELECT Nombre, Stock_Actual FROM Pieza WHERE Stock_Actual < 6`;
        const respuestaBajoStock = await connection.execute(bajoStock, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({ exito: true, emergencias: respuestaBajoStock.rows });

    } catch (err) {
        console.error("ERROR AL CONSULTAR LOS STOCK: ", err);
        res.status(500).json({ exito: false, error: "ERROR AL CONSULTAR EL STOCK" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

