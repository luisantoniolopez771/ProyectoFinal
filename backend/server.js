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

app.listen(port, () => {
    console.log(`API Backend de la Bodega corriendo en el puerto ${port}`);
});