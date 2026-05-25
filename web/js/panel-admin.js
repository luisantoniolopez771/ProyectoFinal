//ALTERNAR PESTAÑAS -----------------------------------------------------------------------------------------------------------------------------------------
function cambiarPestana(idSeccion, boton) {
    const secciones = document.querySelectorAll('.seccion-admin');
    secciones.forEach(sec => sec.classList.remove('activa'));

    const botones = document.querySelectorAll('.btn-tab');
    botones.forEach(btn => btn.classList.remove('activo'));

    document.getElementById('sec-' + idSeccion).classList.add('activa');
    boton.classList.add('activo');
}

//CERRAR SESION ---------------------------------------------------------------------------------------------------------------------------------------------
function cerrarSesion() {
    localStorage.clear();
    window.location.href = "index.html";
}

//COMPROBAR ROL ADMINISTRADOR -------------------------------------------------------------------------------------------------------------------------------
function comprobarRol() {
    const rol = localStorage.getItem('rolUsuario');
    const estado = localStorage.getItem('estadoUsuario');
    if (!rol || rol.trim().toLocaleLowerCase() !== "administrador") {
        alert("No tienes permisos para acceder a esta pagina");
        window.location.href = "inventario.html";
    } else if (estado.trim() == 'INACTIVO') {
        alert("Usuario no activo, contacte con un administrador!");
        window.location.href = "index.html";
    }
}

comprobarRol();

//LIMPIAR FORMULARIO ----------------------------------------------------------------------------------------------------------------------------------------
function limpiarFormularioUsuarios() {
    document.getElementById('input-usuario-nombre').value = "";
    document.getElementById('input-usuario-pass').value = "";
}

limpiarFormularioUsuarios();

//REGISTRAR NUEVO USUARIO -----------------------------------------------------------------------------------------------------------------------------------
async function registrarUsuario() {
    const nombreUsuario = document.getElementById('input-usuario-nombre');
    const contraUsuario = document.getElementById('input-usuario-pass');
    const rolUsuario = document.getElementById('select-usuario-rol');

    const datosUsuario = {
        nombre: nombreUsuario.value,
        contra: contraUsuario.value,
        rol: rolUsuario.value
    };

    try {
        const respuesta = await fetch('http://localhost:3000/api/registrar-usuario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUsuario)
        });

        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert(resultado.mensaje);
            limpiarFormularioUsuarios();
            mostrarUsuarios();
        }
    } catch (error) {
        console.error("ERROR AL DAR DE ALTA AL USUARIO: ", error);
    }
}

//MOSTRAR USUARIOS ------------------------------------------------------------------------------------------------------------------------------------------
async function mostrarUsuarios() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/mostrar-usuarios');
        const resultado = await respuesta.json();

        if (resultado.exito) {
            const tbody = document.getElementById('tabla-usuarios');
            tbody.innerHTML = "";

            resultado.usuarios.forEach(usuario => {
                let accion = usuario.ESTADO === 'INACTIVO' ? 'Reactivar' : 'Desactivar';
                const colorEstado = usuario.ESTADO === 'ACTIVO' ? 'badge-estado estado-activo' : 'badge-estado estado-inactivo';
                let botonAccion = "";
                let botonEditar = "";

                if (usuario.ID_USUARIO == localStorage.getItem('idUsuario')) {
                    botonAccion = `<span style="color: grey; font-weight: bold;">(Tú)</span>`;

                } else {
                    botonAccion = `<a href="#" style="color:#72273b; font-weight:bold;" onclick="cambiarEstadoUsuario(${usuario.ID_USUARIO}, '${usuario.ESTADO}')">${accion}</a>`;

                    botonEditar = ` | <a href="#" style="color:#72273b; font-weight:bold;" onclick="abrirModalUsuario(${usuario.ID_USUARIO})">Editar</a>`;
                }

                const fila = tbody.insertRow();
                fila.innerHTML = `
                    <td>${usuario.ID_USUARIO}</td>
                    <td>${usuario.NOMBRE_COMPLETO}</td>
                    <td>${usuario.ROL}</td>
                    <td><span class="${colorEstado}">${usuario.ESTADO}</span></td>
                    <td>${botonAccion}${botonEditar}</td>
                `;
            });
        } else {
            console.error("ERROR DESDE EL SERVIDOR:", resultado.error);
        }
    } catch (error) {
        console.error("NO SE PUDO CONECTAR A LA BASE DE DATOS:", error);
    }
}

mostrarUsuarios();

//CAMBIAR ESTADO USUARIOS ----------------------------------------------------------------------------------------------------------------------------------
async function cambiarEstadoUsuario(idUsuario, estadoActual) {
    const datosCambioEstado = { idUsuario: idUsuario, estadoActual: estadoActual };
    try {
        const respuesta = await fetch('http://localhost:3000/api/cambiar-estado-usuario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCambioEstado)
        });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            alert(resultado.mensaje);
            mostrarUsuarios();
        } else {
            console.error("ERROR DESDE EL SERVIDOR: ", resultado.error);
        }
    } catch (error) {
        console.error("NO SE PUDO CONECTAR A LA BASE DE DATOS: ", error);
    }
}

//MODIFICAR USUARIO ---------------------------------------------------------------------------------------------------------------------------------------
async function abrirModalUsuario(USR) {
    const idUsuario = USR;

    try {
        const respuesta = await fetch(`http://localhost:3000/api/datos-usuario/${idUsuario}`);
        const resultado = await respuesta.json();

        if (resultado.exito){
            document.getElementById('modal-editar-usuario').classList.add("activo");

            document.getElementById('edit-usr-rol').value = resultado.usuario[0].ROL;
            document.getElementById('edit-usr-nombre').value = resultado.usuario[0].NOMBRE_COMPLETO;
            document.getElementById('edit-usr-password').value = resultado.usuario[0].CONTRASENA;
            document.getElementById('edit-usr-id').value = idUsuario;
        } else {
            console.error("Error desde el servidor: ", resultado.error);
        }
    } catch (error) {
        console.error("NO SE PUDO CONECTAR A LA BASE DE DATOS: ", error);
    }
}

function cerrarModalUsuario() {
    document.getElementById('modal-editar-usuario').classList.remove("activo");
}

//CONFIRMAR EDICION USUARIO -------------------------------------------------------------------------------------------------------------------------------
async function guardarCambiosUsuario(){

    const datosActualizacionUsuario = {
        id: document.getElementById('edit-usr-id').value,
        rol: document.getElementById('edit-usr-rol').value,
        nombre: document.getElementById('edit-usr-nombre').value,
        contrasena: document.getElementById('edit-usr-password').value
    }

    try {
        const respuesta = await fetch('http://localhost:3000/api/actualizar-usuario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizacionUsuario)
        });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert(resultado.mensaje);
            cerrarModalUsuario();
            mostrarUsuarios();
        } else {
            console.error("Error desde el servidor: ", error);
        }
    } catch (error) {
        console.error("NO SE PUDO CONECTAR A LA BASE DE DATOS: ", error);
    }
}

//CARGAR CATALOGOS INVENTARIO -----------------------------------------------------------------------------------------------------------------------------
async function cargarCatalogos() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/catalogos');
        const resultado = await respuesta.json();

        if (resultado.exito) {
            const selectCategoria = document.getElementById('select-prod-cat');
            resultado.categorias.forEach(cat => {
                selectCategoria.innerHTML += `<option value="${cat.ID_CATEGORIA}"> ${cat.NOMBRE_CATEGORIA} </option>`;
            });

            const selectMarca = document.getElementById('select-prod-marca');
            resultado.marcas.forEach(mar => {
                selectMarca.innerHTML += `<option value="${mar.ID_MARCA}"> ${mar.NOMBRE_MARCA} </option>`;
            });

            const selectMedida = document.getElementById('select-prod-medida');
            resultado.medidas.forEach(med => {
                selectMedida.innerHTML += `<option value="${med.ID_MEDIDA}"> ${med.VALOR_MEDIDA} </option>`;
            });

            const selectUbicacion = document.getElementById('select-prod-ubi');
            resultado.ubicaciones.forEach(ubi => {
                selectUbicacion.innerHTML += `<option value="${ubi.ID_UBICACION}"> ${ubi.ANAQUEL} - ${ubi.NIVEL} </option>`;
            });

            const selectMarcaMaq = document.getElementById('select-maq-marca');
            resultado.marcas.forEach(mar => {
                selectMarcaMaq.innerHTML += `<option value="${mar.ID_MARCA}"> ${mar.NOMBRE_MARCA} </option>`;
            });

            const selectAreaBordadoMaq = document.getElementById('select-maq-area');
            resultado.areasbordado.forEach(are => {
                selectAreaBordadoMaq.innerHTML += `<option value="${are.ID_AREA}"> ${are.NOMBRE_AREA} </option>`;
            });
        }
    } catch (error) {
        console.error("Error al cargar listas:", error);
    }
}

cargarCatalogos();

//ALTA DE PIEZA ----------------------------------------------------------------------------------------------------------------------------------------
async function altaProducto() {
    const nombreProducto = document.getElementById('input-prod-nombre');
    const stockInicial = document.getElementById('input-prod-stock');
    const categoriaProducto = document.getElementById('select-prod-cat');
    const marcaProducto = document.getElementById('select-prod-marca');
    const medidaProducto = document.getElementById('select-prod-medida');
    const maquinaProducto = document.getElementById('select-prod-maquina');
    const modeloProducto = document.getElementById('input-prod-modelo');
    const ubicacionProducto = document.getElementById('select-prod-ubi');
    const areaProducto = document.getElementById('select-prod-area');
    const colorProducto = document.getElementById('input-prod-color');

    const datosProducto = {
        nombre: nombreProducto.value,
        stock: stockInicial.value,
        categoria: categoriaProducto.value,
        marca: marcaProducto.value,
        medida: medidaProducto.value,
        maquina: maquinaProducto.value,
        modelo: modeloProducto.value,
        ubicacion: ubicacionProducto.value,
        area: areaProducto.value,
        color: colorProducto.value
    };

    try {
        const respuesta = await fetch('http://localhost:3000/api/registrar-producto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosProducto)
        });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            alert(resultado.mensaje);
            mostrarPiezasMaquinas();
        }
    } catch (error) {
        console.error("ERROR AL AGREGAR EL PRODUCTO:", error);
    }
}

//ALTA DE MAQUINA ----------------------------------------------------------------------------------------------------------------------------------------
async function altaMaquina() {
    const nombreModelo = document.getElementById('input-maq-modelo');
    const noSerie = document.getElementById('input-maq-serie');
    const marca = document.getElementById('select-maq-marca');
    const areaBordado = document.getElementById('select-maq-area');
    const bastidor = document.getElementById('input-maq-bastidor');
    const descripcion = document.getElementById('input-maq-descripcion');

    const datosMaquina = {
        modelo: nombreModelo.value,
        serie: noSerie.value,
        marca: marca.value,
        area: areaBordado.value || 'N/A',
        bastidor: bastidor.value || 'N/A',
        descripcion: descripcion.value || 'N/A'
    };

    try {
        const respuesta = await fetch('http://localhost:3000/api/registrar-maquina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosMaquina)
        });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            alert(resultado.mensaje);
            mostrarPiezasMaquinas();
        }
    } catch (error) {
        console.error("ERROR AL AGREGAR LA MAQUINA: ", error);
    }
}

//TABLAS SECUNDARIAS ------------------------------------------------------------------------------------------------------------------------------------
async function mostrarTablasSecundarias() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/catalogos');
        const resultado = await respuesta.json();

        if (resultado.exito) {
            const tbodyCategorias = document.getElementById('tabla-categorias-admin');
            const tbodyMarcas = document.getElementById('tabla-marcas-admin');
            const tbodyMedidas = document.getElementById('tabla-medidas-admin');
            const tbodyAreas = document.getElementById('tabla-areas-admin');
            const tbodyUbicaciones = document.getElementById('tabla-ubicaciones-admin');

            tbodyCategorias.innerHTML = "";
            tbodyMarcas.innerHTML = "";
            tbodyMedidas.innerHTML = "";
            tbodyAreas.innerHTML = "";
            tbodyUbicaciones.innerHTML = "";

            resultado.categorias.forEach(categoria => {
                tbodyCategorias.insertRow().innerHTML = `
                <td>${categoria.ID_CATEGORIA}</td><td>${categoria.NOMBRE_CATEGORIA}</td>
                <td><button class="btn-secundario" onclick="abrirModalCatalogo('CATEGORIA', ${categoria.ID_CATEGORIA}, '${categoria.NOMBRE_CATEGORIA}')">Editar Categoria</button></td>
                `;
            });
            resultado.marcas.forEach(marca => {
                tbodyMarcas.insertRow().innerHTML = `
                <td>${marca.ID_MARCA}</td><td>${marca.NOMBRE_MARCA}</td>
                <td><button class="btn-secundario" onclick="abrirModalCatalogo('MARCA', ${marca.ID_MARCA}, '${marca.NOMBRE_MARCA}')">Editar Marca</button></td>`;
            });
            resultado.medidas.forEach(medida => {
                tbodyMedidas.insertRow().innerHTML = `
                <td>${medida.ID_MEDIDA}</td><td>${medida.VALOR_MEDIDA}</td>
                <td><button class="btn-secundario" onclick="abrirModalCatalogo('MEDIDA', ${medida.ID_MEDIDA}, '${medida.VALOR_MEDIDA}')">Editar Medida</button></td>`;
            });
            resultado.areasbordado.forEach(area => {
                tbodyAreas.insertRow().innerHTML = `
                <td>${area.ID_AREA}</td><td>${area.NOMBRE_AREA}</td>
                <td><button class="btn-secundario" onclick="abrirModalCatalogo('AREA', ${area.ID_AREA}, '${area.NOMBRE_AREA}')">Editar Area</button></td>`;
                
            });
            resultado.ubicaciones.forEach(ubi => {
                tbodyUbicaciones.insertRow().innerHTML = `
                <td>${ubi.ID_UBICACION}</td><td>${ubi.ANAQUEL} - ${ubi.NIVEL}</td>
                <td><button class="btn-secundario" onclick="abrirModalCatalogo('UBICACION', ${ubi.ID_UBICACION}, '${ubi.ANAQUEL}', '${ubi.NIVEL}')">Editar NIVEL</button></td>`;
            });
        } else {
            console.error("ERROR DESDE EL SERVIDOR:", resultado.error);
        }
    } catch (error) {
        console.error("ERROR AL CARGAR LAS TABLAS SECUNDARIAS:", error);
    }
}

mostrarTablasSecundarias();

//AGREGAR A CATALOGO -------------------------------------------------------------------------------------------------------------------------------------
async function agregarCatalogo(TIPO, DATO) {
    const datosTransaccion = { tipo: TIPO, dato: DATO };
    try {
        const respuesta = await fetch('http://localhost:3000/api/alta-catalogos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosTransaccion)
        });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            alert(resultado.mensaje);
            mostrarTablasSecundarias();
        }
    } catch (error) {
        console.error("ERROR AL AGREGAR EL PRODUCTO:", error);
    }
}

//MODIFICAR TABLAS SECUNDARIAS ----------------------------------------------------------------------------------------------------------------------------
async function abrirModalCatalogo(TIPO, ID, VALOR1, VALOR2){
    const tipoTransaccion = TIPO;
    const idCatalogo = ID;
    const dato1 = VALOR1;
    const dato2 = VALOR2;

    try {
        document.getElementById('modal-editar-catalogo').classList.add("activo");
        
        if (tipoTransaccion === 'UBICACION') {
            document.getElementById('grupo-campo-unico').style.display = 'none';
            document.getElementById('grupo-campo-doble').style.display = 'grid';
            document.getElementById('edit-cat-input-anaquel').value = dato1;
            document.getElementById('edit-cat-input-nivel').value = dato2;
            document.getElementById('edit-cat-id').value = idCatalogo;
            document.getElementById('edit-cat-tipo').value = tipoTransaccion;
        } else {
            document.getElementById('grupo-campo-unico').style.display = 'grid';
            document.getElementById('grupo-campo-doble').style.display = 'none';
            document.getElementById('edit-cat-input-unico').value = dato1;
            document.getElementById('edit-cat-id').value = idCatalogo;
            document.getElementById('edit-cat-tipo').value = tipoTransaccion;
        }
    } catch (error) {
        console.error("ERROR AL AGREGAR EL PRODUCTO:", error);
    }
}

function cerrarModalCatalogo() {
    document.getElementById('modal-editar-catalogo').classList.remove("activo");
}

//CONFIRMAR EDICION CATALOGO ------------------------------------------------------------------------------------------------------------------------------
async function guardarCambiosCatalogo() {
    const datosActualizacionCatalogo = {
        tipo: document.getElementById('edit-cat-tipo').value,
        id: document.getElementById('edit-cat-id').value,
        dato1: document.getElementById('edit-cat-input-anaquel').value,
        dato2: document.getElementById('edit-cat-input-nivel').value,
        dato3: document.getElementById('edit-cat-input-unico').value
    }

    try{
        const respuesta = await fetch('http://localhost:3000/api/editar-catalogo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizacionCatalogo)
        });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert(resultado.mensaje);
            cerrarModalCatalogo();
            mostrarTablasSecundarias();
        } else {
            console.error("Error desde el servidor: ", error);
        }
    } catch (error) {
        console.error("ERROR AL AGREGAR EL PRODUCTO:", error);
    }
}

//MOSTRAR PIEZAS Y MAQUINAS -------------------------------------------------------------------------------------------------------------------------------
async function mostrarPiezasMaquinas() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/consulta-piezas-maquinas');

        const resultado = await respuesta.json();

        if (resultado.exito) {

            const selectPieza = document.getElementById('select-comp-producto');
            resultado.piezas.forEach(pieza => {
                selectPieza.innerHTML += `<option value="${pieza.ID_PIEZA}">${pieza.NOMBRE} | ${pieza.COLOR_TIPO} | ${pieza.MARCA}</option>`;
            });

            const selectMaquina = document.getElementById('select-comp-maquina');
            resultado.maquinas.forEach(maquina => {
                selectMaquina.innerHTML += `<option value="${maquina.ID_MAQUINA}">${maquina.NOMBRE_MODELO}</option>`;
            });

            const tbodyComp = document.getElementById('tabla-compatibilidad');

            tbodyComp.innerHTML = "";

            resultado.relaciones.forEach(relacion => {

                botonBorrar = `<a href="#" style="color:red; font-weight:bold;" onclick="eliminarRelacion(${relacion.ID_PIEZA}, ${relacion.ID_MAQUINA})">Eliminar</a>`;

                tbodyComp.insertRow().innerHTML = 
                `<td>${relacion.PIEZA}</td>
                <td>${relacion.MAQUINA}</td>
                <td>${botonBorrar}<td>`
            })
        }
    } catch (error) {
        console.error("ERROR AL CARGAR LAS PIEZAS Y/O PRODUCTOS: ", error);
    }
}

mostrarPiezasMaquinas();

//VINCULAR PIEZA Y MAQUINA --------------------------------------------------------------------------------------------------------------------------------
async function vincularPiezaMaquina(PIE, MAQ) {

    const datosRelacion = {pieza: PIE, maquina: MAQ};

    try {
        const respuesta = await fetch ('http://localhost:3000/api/vincular-pieza-maquina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosRelacion)
        });

        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert(resultado.mensaje);
            mostrarPiezasMaquinas();
        }
    } catch (error) {
        console.error("ERROR AL REALIZAR LA VINCULACION: ", error);
    }
}

//BORRAR RELACION PIEZA MAQUINA ---------------------------------------------------------------------------------------------------------------------------
async function eliminarRelacion(PIE, MAQ){
    const pieza = PIE;
    const maquina = MAQ;

    const datosBajaRelacion = {
        pieza: pieza,
        maquina: maquina
    }

    try{
        const respuesta = await fetch ('http://localhost:3000/api/borrar-relacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosBajaRelacion)
        });

        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert(resultado.mensaje);
            mostrarPiezasMaquinas();
        }
    } catch (error) {
        console.error("ERROR AL BORRAR LA RELACION MAQUINA - PIEZA: ", error);
    }
}

//ALERTAS STOCK -------------------------------------------------------------------------------------------------------------------------------------------
async function consultarBajoStock() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/emergencia-stock');
        const resultado = await respuesta.json();

        if (resultado.exito) {
            const listaEmergencias = document.getElementById('lista-alertas');
            listaEmergencias.innerHTML = "";

            resultado.emergencias.forEach(emergencia => {
                const li = document.createElement('li');
                li.innerText = `❗ ${emergencia.NOMBRE}, Stock actual: ${emergencia.STOCK_ACTUAL}`;
                listaEmergencias.appendChild(li);
            });
        } else {
            console.error("ERROR DESDE EL SERVIDOR:", resultado.error);
        }
    } catch (error) {
        console.error("ERROR AL CARGAR LAS EMERGENCIAS:", error);
    }
}

consultarBajoStock();