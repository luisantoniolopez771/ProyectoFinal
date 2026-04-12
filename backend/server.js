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

app.post('/api/login', async (req, res) => {
    const usuarioRecibido = req.body.usuario;
    const passwordRecibido = req.body.password;


    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const consultaLogin = `SELECT * FROM Usuarios WHERE Nombre_Completo = :usr AND Contrasena = :pwd`;

        const resultLogin = await connection.execute(
            consultaLogin,
            {
                usr: usuarioRecibido,
                pwd: passwordRecibido
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        if (resultLogin.rows.length > 0) {
            const usuarioEncontrado = resultLogin.rows[0];

            const rolEncontrado = usuarioEncontrado.ROL;

            res.json({
                exito: true,
                mensaje: usuarioRecibido,
                rol: rolEncontrado
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


app.get('/api/inventario', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig)

        const consultaInventario = `SELECT Piezas.Nombre, Piezas.Marca, Piezas.Medida, Categorias.Nombre_Categoria AS Categoria, Ubicaciones.Anaquel, Piezas.Stock_Actual AS Stock FROM Piezas 
        JOIN Categorias ON Piezas.ID_Categoria = Categorias.ID_Categoria
        JOIN Ubicaciones ON Piezas.ID_Ubicacion = Ubicaciones.ID_Ubicacion`;

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
        if (connection){
            try {
                await connection.close();
            } catch (err){
                console.error("Error al cerrar la conexion: ", err);
            }
        }
    }
});

app.listen(port, () => {
    console.log(`API Backend de la Bodega corriendo en el puerto ${port}`);
});