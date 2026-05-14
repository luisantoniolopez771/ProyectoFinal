//CERRAR SESION -------------------------------------------------------------------------------------------------------------------------
function cerrarSesion() {
    localStorage.clear();
    window.location.href = "index.html";
}

//COMPROBAR ROL ADMINISTRADOR -----------------------------------------------------------------------------------------------------------
function comprobarRol() {
    const rol = localStorage.getItem('rolUsuario');
    if (rol === "Trabajador") {
        document.getElementById("panel-admin").style.display = "none";
    }
}

//VALIDAR INICIO DE SESION --------------------------------------------------------------------------------------------------------------
function validarSesion() {
    const idu = localStorage.getItem('idUsuario');
    if (idu == null) {
        alert("Se necesita iniciar sesion!");
        window.location.href = "index.html";
    }
}

validarSesion();
comprobarRol();

//CARGAR FILTROS CATEGORIAS -------------------------------------------------------------------------------------------------------------
async function cargarCategorias() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/categorias');
        const resultado = await respuesta.json();

        if (resultado.exito) {
            const selectCategoria = document.getElementById('select-filtro-categoria');
            resultado.categorias.forEach(cat => {
                selectCategoria.innerHTML += `<option value="${cat.ID_CATEGORIA}"> ${cat.NOMBRE_CATEGORIA} </option>`;
            });
        }
    } catch (error) {
        console.error("Error al cargar listas:", error);
    }
}

cargarCategorias();

//FILTRAR PRODUCTOS POR CATEGORIA ------------------------------------------------------------------------------------------------------
async function filtrarProductosPorCategoria() {
    const selectCat = document.getElementById('select-filtro-categoria');
    const selectNom = document.getElementById('select-producto');
    const catSelected = selectCat.value;

    let url = `http://localhost:3000/api/productos-existentes/${catSelected}`;

    try {
        const respuesta = await fetch(url);
        const resultado = await respuesta.json();

        selectNom.innerHTML = '<option value="">Selecciona un producto...</option>';

        if (resultado.exito) {
            resultado.productos.forEach(producto => {
                selectNom.innerHTML += `<option value="${producto.ID_PIEZA}">${producto.NOMBRE} | ${producto.MARCA} | ${producto.STOCK}</option>`;
            });
        }
    } catch (error) {
        console.error("Error al buscar los productos por categoria: ", error);
    }
}

filtrarProductosPorCategoria();

//REGISTRAR TRANSACCION ----------------------------------------------------------------------------------------------------------------
async function registrarTransaccion() {
    const productoTransaccion = document.getElementById('select-producto');
    const productoCantidad = document.getElementById('input-cantidad');
    const tipoTransaccion = document.getElementById('select-tipo');
    const motivoTransaccion = document.getElementById('input-motivo');
    const idUsuarioTransaccion = localStorage.getItem('idUsuario');

    const datosTransaccion = {
        idPieza: productoTransaccion.value,
        cantidad: productoCantidad.value,
        transaccion: tipoTransaccion.value,
        motivo: motivoTransaccion.value,
        idUsuario: idUsuarioTransaccion
    };

    try {
        const respuesta = await fetch('http://localhost:3000/api/registrar-transaccion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosTransaccion)
        });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert(resultado.mensaje);
            limpiarFormulario();
            filtrarProductosPorCategoria();
            cargarMovimientos();
        } else {
            alert("Error: " + resultado.error);
        }
    } catch (error) {
        console.error("Error al realizar la transaccion: ", error);
    }
}

//LIMPIAR FORMULARIO --------------------------------------------------------------------------------------------------------------------
function limpiarFormulario() {
    document.getElementById('select-producto').innerHTML = '<option value="">Selecciona un producto...</option>';
    document.getElementById('input-cantidad').value = '';
    document.getElementById('input-motivo').value = '';
}

//CARGAR TODOS LOS MOVIMIENTOS ----------------------------------------------------------------------------------------------------------
async function cargarMovimientos() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/consultar-movimientos');
        const resultado = await respuesta.json();

        if (respuesta.ok) {
            const listaMovimientos = document.getElementById('tabla-movimientos');
            listaMovimientos.innerHTML = "";

            resultado.movimientos.forEach(movimiento => {
                const fila = listaMovimientos.insertRow();
                const colorTipo = movimiento.TIPO === 'ENTRADA' ? 'color: #2e7d32; font-weight: bold;' : 'color: #dc3545; font-weight: bold;';
                const fechaPlana = movimiento.FECHA_HORA;
                const fecha = fechaPlana.slice(0, 10);

                fila.innerHTML = `
                    <td>${fecha}</td>
                    <td>${movimiento.NOMBRE}</td>
                    <td style="${colorTipo}">${movimiento.TIPO}</td>
                    <td>${movimiento.CANTIDAD}</td>
                    <td>${movimiento.USUARIO}</td>
                    <td>${movimiento.STOCK}</td>
                    <td>${movimiento.NOTA || 'N/A'}</td>
                `;
            });

            const fechaHoy = new Date().toLocaleDateString('es-MX');
            const movimientosHoy = resultado.movimientos.filter(mov => {
                return new Date(mov.FECHA_HORA).toLocaleDateString('es-MX') === fechaHoy;
            });

            document.getElementById('stat-hoy').innerText = movimientosHoy.length;
            document.getElementById('stat-entradas').innerText = movimientosHoy.filter(mov => mov.TIPO === 'ENTRADA').length;
            document.getElementById('stat-salidas').innerText = movimientosHoy.filter(mov => mov.TIPO === 'SALIDA').length;

            const listaActividad = document.getElementById('lista-actividad');
            listaActividad.innerHTML = "";

            resultado.movimientos.slice(0, 4).forEach(mov => {
                const icono = mov.TIPO === 'ENTRADA' ? '🟢' : '🔴';
                const li = document.createElement('li');
                li.innerText = `${icono} ${mov.USUARIO} registró ${mov.CANTIDAD}x ${mov.NOMBRE}`;
                listaActividad.appendChild(li);
            });
        } else {
            console.error("Error desde el servidor:", resultado.error);
        }
    } catch (error) {
        console.error("No se pudo conectar al backend:", error);
    }
}

cargarMovimientos();

//CARGAR TODOS LOS PRODUCTOS ACTIVOS -------------------------------------------------------------------------------------------------
async function totalActivos() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/inventario');
        const resultado = await respuesta.json();
        if (respuesta.ok) {
            document.getElementById('stat-activos').innerText = resultado.datosInventario.length +resultado.datosMaquina.length ;
        }
    } catch (error) {
        console.error("No se pudo conectar al backend:", error);
    }
}

totalActivos();