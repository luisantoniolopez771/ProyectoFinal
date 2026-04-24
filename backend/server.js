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

// INICIO DE SESION
app.post('/api/login', async (req, res) => {
    const usuarioRecibido = req.body.usuario;
    const passwordRecibido = req.body.password;


    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const consultaLogin = `SELECT * FROM Usuarios WHERE Nombre_Completo = :usr AND Contrasena = :pwd`;

        const resultLogin = await connection.execute(consultaLogin, { usr: usuarioRecibido, pwd: passwordRecibido }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (resultLogin.rows.length > 0) {
            const usuarioEncontrado = resultLogin.rows[0];

            console.log("Fila del usuario desde Oracle:", usuarioEncontrado);

            const rolEncontrado = usuarioEncontrado.ROL;

            const idUsuarioEncontrado = usuarioEncontrado.ID_USUARIO;

            res.json({
                exito: true,
                mensaje: usuarioRecibido,
                rol: rolEncontrado,
                idUsuario: idUsuarioEncontrado
            });
        } else {
            res.status(401).json({
                exito: false,
                error: `Usuario o Contraseña incorrectos`
            })
        }
    } catch (err) {
        console.error("Error en el servidor: ", err);
        res.status(500).json({ exito: false, error: "Fallo la conexión a la base de datos" });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error al cerrar la conexion: ", err);
            }
        }
    }
});

app.listen(port, () => {
    console.log(`API Backend de la Bodega corriendo en el puerto ${port}`);
});

//CARGAR INVENTARIO PRINCIPAL
app.get('/api/inventario', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig)

        const consultaInventario = `SELECT 
        p.Nombre, 
        m.Nombre_Marca AS Marca, 
        med.Valor_Medida AS Medida, 
        c.Nombre_Categoria AS Categoria, 
        u.Anaquel, 
        u.Nivel, 
        p.Modelo, 
        p.Color_Tipo, 
        p.Area_Bordado,
        mq.Nombre_Modelo AS Maquina, 
        p.Stock_Actual
        FROM Piezas p
        INNER JOIN Categorias c ON p.ID_Categoria = c.ID_Categoria
        INNER JOIN Marcas m ON p.ID_Marca = m.ID_Marca
        LEFT JOIN Medidas med ON p.ID_Medida = med.ID_Medida
        LEFT JOIN Ubicaciones u ON p.ID_Ubicacion = u.ID_Ubicacion
        LEFT JOIN Maquinas mq ON p.ID_Maquina = mq.ID_Maquina
        `;

        const resultado = await connection.execute(
            consultaInventario,
            [],
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );
        res.json({
            exito: true,
            datos: resultado.rows
        });

    } catch (err) {
        console.error("Error consultando el inventario:", err);
        res.status(500).json({ exito: false, error: "Fallo al traer los datos" });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error al cerrar la conexion: ", err);
            }
        }
    }
});

//CARGAR CATEGORIAS
app.get('/api/categorias', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const sqlCategorias = `SELECT * FROM Categorias`;
        const resCat = await connection.execute(sqlCategorias, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({
            exito: true,
            categorias: resCat.rows,
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

//CARGAR LOS PRODUCTOS POR CATEGORIA
app.get('/api/productos-existentes/:idCategoria', async (req, res) => {
    const idCat = req.params.idCategoria;
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const sqlProductos = `SELECT p.Nombre, m.Nombre_Marca as Marca, p.Stock_Actual AS Stock, p.ID_Pieza FROM Piezas p INNER JOIN Marcas m ON p.ID_Marca =  m.ID_Marca WHERE p.ID_Categoria = :idc`;

        const resProductos = await connection.execute(sqlProductos, { idc: idCat }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({
            exito: true,
            productos: resProductos.rows
        });
    } catch (err) {
        console.error("Error buscando piezas por categoría:", err);
        res.status(500).json({ exito: false, error: "Fallo al buscar los nombres" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//CARGAR TODOS LOS PRODUCTOS EXISTENTES
app.get('/api/productos-existentes', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const sqlProductos = `SELECT p.Nombre, m.Nombre_Marca as Marca, p.Stock_Actual AS Stock, p.ID_Pieza FROM Piezas p INNER JOIN Marcas m ON p.ID_Marca =  m.ID_Marca`;

        const resProductos = await connection.execute(sqlProductos, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({
            exito: true,
            productos: resProductos.rows
        });
    } catch (err) {
        console.error("Error buscando piezas por categoría:", err);
        res.status(500).json({ exito: false, error: "Fallo al buscar los nombres" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//CARGAR LOS CATALOGOS PARA AGREGAR UN NUEVO PRODUCTO
app.get('/api/catalogos', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const sqlCategorias = `SELECT * FROM Categorias`;
        const resCat = await connection.execute(sqlCategorias, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json({
            exito: true,
            categorias: resCat.rows,
            ubicaciones: resUbi.rows,
            medidas: resMed.rows,
            marcas: resMar.rows
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

//FILTRADO DE PIEZAS POR CATEGORIA
app.get('/api/piezas-por-categoria/:idCategoria', async (req, res) => {
    const idCat = req.params.idCategoria;
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const buscarNombres = `SELECT ID_Pieza, Nombre FROM Piezas WHERE ID_Categoria = :idc`;

        const buscarMedidas = `SELECT ID_Medida, Valor_Medida FROM  Medidas WHERE ID_Categoria = :idc`;

        const resultadoNombres = await connection.execute(buscarNombres, { idc: idCat }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        const resultadoMedidas = await connection.execute(buscarMedidas, { idc: idCat }, { outFormat: oracledb.OUT_FORMAT_OBJECT });


        res.json({
            exito: true,
            nombres: resultadoNombres.rows,
            medidas: resultadoMedidas.rows
        });

    } catch (err) {
        console.error("Error buscando piezas por categoría:", err);
        res.status(500).json({ exito: false, error: "Fallo al buscar los nombres" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//REGISTRAR TRANSACCION
app.post('/api/registrar-transaccion', async (req, res) => {
    const idPieza = req.body.idPieza;
    const cantidad = req.body.cantidad;
    const transaccion = req.body.transaccion;
    const motivo = req.body.motivo;
    console.log("Datos recibidos del Frontend:", req.body);
    const idUsuario = parseInt(req.body.idUsuario);

    let connection;

    try {

        let crearTransaccion = '';

        let registrarTransaccion = '';

        let sim = '';

        if (transaccion === 'ENTRADA') {
            crearTransaccion = `UPDATE Piezas SET Stock_Actual = Stock_Actual + :can WHERE ID_Pieza = :idp`;

            registrarTransaccion = `INSERT INTO Movimientos (ID_Pieza, ID_Usuario, Tipo_Movimiento, Cantidad, Nota, Stock_Resultante) VALUES (:idp, :idu, :tip, :can, :mot, (SELECT Stock_Actual + :can FROM Piezas WHERE ID_Pieza = :idp))`;
        } else {
            crearTransaccion = `UPDATE Piezas SET Stock_Actual = Stock_Actual - :can WHERE ID_Pieza = :idp`;

            registrarTransaccion = `INSERT INTO Movimientos (ID_Pieza, ID_Usuario, Tipo_Movimiento, Cantidad, Nota, Stock_Resultante) VALUES (:idp, :idu, :tip, :can, :mot, (SELECT Stock_Actual - :can FROM Piezas WHERE ID_Pieza = :idp))`;
        };

        connection = await oracledb.getConnection(dbConfig);

        const resultadoRegistro = await connection.execute(registrarTransaccion, { idp: idPieza, idu: idUsuario, tip: transaccion, can: cantidad, mot: motivo }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        const resultadoTransaccion = await connection.execute(crearTransaccion, { can: cantidad, idp: idPieza }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        await connection.commit();

        res.json({ exito: true, mensaje: "Transacción registrada correctamente" });

    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Error en la transacción:", err);
        res.status(500).json({ exito: false, error: "Error al registrar el movimiento" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
});

//REGISTRAR NUEVO PRODUCTO
app.post('/api/registrar-pieza', async (req, res) => {
    const nombrePieza = req.body.pieza;
    const nombreMarca = req.body.marca;
    const medida = req.body.medida;
    const categoria = req.body.categoria;
    const ubicacion = req.body.ubicacion;
    const stock = req.body.stock;

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const insertarPieza = `INSERT INTO Piezas (Nombre, Marca, Medida) VALUES ()`;

    } catch { }
});

//CARGAR MOVIMIENTOS
app.get('/api/consultar-movimientos', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const consultaMovimientos = `SELECT m.Fecha_Hora, p.Nombre, m.Tipo_Movimiento AS TIPO, m.Cantidad, u.Nombre_Completo AS USUARIO, m.Stock_Resultante AS STOCK
        FROM Movimientos m INNER JOIN Piezas p ON m.ID_Pieza = p.ID_Pieza
        INNER JOIN Usuarios u ON m.ID_Usuario = u.ID_Usuario
        ORDER BY m.Fecha_Hora DESC`;

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
})