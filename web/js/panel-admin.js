function cambiarPestana(idSeccion, boton) {
    const secciones = document.querySelectorAll('.seccion-admin');
    secciones.forEach(sec => sec.classList.remove('activa'));

    const botones = document.querySelectorAll('.btn-tab');
    botones.forEach(btn => btn.classList.remove('activo'));

    document.getElementById('sec-' + idSeccion).classList.add('activa');
    boton.classList.add('activo');
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = "index.html";
}

function comprobarRol() {
    const rol = localStorage.getItem('rolUsuario');
    if (!rol || rol.trim().toLocaleLowerCase() !== "administrador") {
        alert("No tienes permisos para acceder a esta pagina");
        window.location.href = "inventario.html";
    }
}

comprobarRol();

function limpiarFormularioUsuarios() {
    document.getElementById('input-usuario-nombre').value = "";
    document.getElementById('input-usuario-pass').value = "";
}

limpiarFormularioUsuarios();

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

                if (usuario.ID_USUARIO == localStorage.getItem('idUsuario')) {
                    botonAccion = `<span style="color: grey; font-weight: bold;">(Tú)</span>`;
                } else {
                    botonAccion = `<a href="#" style="color:#72273b; font-weight:bold;" onclick="cambiarEstadoUsuario(${usuario.ID_USUARIO}, '${usuario.ESTADO}')">${accion}</a>`;
                }

                const fila = tbody.insertRow();
                fila.innerHTML = `
                    <td>${usuario.ID_USUARIO}</td>
                    <td>${usuario.NOMBRE_COMPLETO}</td>
                    <td>${usuario.ROL}</td>
                    <td><span class="${colorEstado}">${usuario.ESTADO}</span></td>
                    <td>${botonAccion}</td>
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
            console.error("ERROR DESDE EL SERVIDOR:", resultado.error);
        }
    } catch (error) {
        console.error("NO SE PUDO CONECTAR A LA BASE DE DATOS:", error);
    }
}

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

            const selectMaquina = document.getElementById('select-prod-maquina');
            resultado.maquinas.forEach(maq => {
                selectMaquina.innerHTML += `<option value="${maq.ID_MAQUINA}"> ${maq.NOMBRE_MODELO} </option>`;
            });

            const selectUbicacion = document.getElementById('select-prod-ubi');
            resultado.ubicaciones.forEach(ubi => {
                selectUbicacion.innerHTML += `<option value="${ubi.ID_UBICACION}"> ${ubi.ANAQUEL} - ${ubi.NIVEL} </option>`;
            });

            const selectAreaBordado = document.getElementById('select-prod-area');
            resultado.areasbordado.forEach(are => {
                selectAreaBordado.innerHTML += `<option value="${are.ID_AREA}"> ${are.NOMBRE_AREA} </option>`;
            });
        }
    } catch (error) {
        console.error("Error al cargar listas:", error);
    }
}

cargarCatalogos();

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
        }
    } catch (error) {
        console.error("ERROR AL AGREGAR EL PRODUCTO:", error);
    }
}

async function mostrarTablasSecundarias() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/catalogos');
        const resultado = await respuesta.json();

        if (resultado.exito) {
            const tbodyCategorias = document.getElementById('tabla-categorias-admin');
            const tbodyMarcas = document.getElementById('tabla-marcas-admin');
            const tbodyMaquinas = document.getElementById('tabla-maquinas-admin');
            const tbodyMedidas = document.getElementById('tabla-medidas-admin');
            const tbodyAreas = document.getElementById('tabla-areas-admin');
            const tbodyUbicaciones = document.getElementById('tabla-ubicaciones-admin');

            tbodyCategorias.innerHTML = ""; tbodyMarcas.innerHTML = "";
            tbodyMaquinas.innerHTML = ""; tbodyMedidas.innerHTML = "";
            tbodyAreas.innerHTML = ""; tbodyUbicaciones.innerHTML = "";

            resultado.categorias.forEach(categoria => {
                tbodyCategorias.insertRow().innerHTML = `<td>${categoria.ID_CATEGORIA}</td><td>${categoria.NOMBRE_CATEGORIA}</td>`;
            });
            resultado.marcas.forEach(marca => {
                tbodyMarcas.insertRow().innerHTML = `<td>${marca.ID_MARCA}</td><td>${marca.NOMBRE_MARCA}</td>`;
            });
            resultado.maquinas.forEach(maquina => {
                tbodyMaquinas.insertRow().innerHTML = `<td>${maquina.ID_MAQUINA}</td><td>${maquina.NOMBRE_MODELO}</td>`;
            });
            resultado.medidas.forEach(medida => {
                tbodyMedidas.insertRow().innerHTML = `<td>${medida.ID_MEDIDA}</td><td>${medida.VALOR_MEDIDA}</td>`;
            });
            resultado.areasbordado.forEach(area => {
                tbodyAreas.insertRow().innerHTML = `<td>${area.ID_AREA}</td><td>${area.NOMBRE_AREA}</td>`;
            });
            resultado.ubicaciones.forEach(ubi => {
                tbodyUbicaciones.insertRow().innerHTML = `<td>${ubi.ID_UBICACION}</td><td>${ubi.ANAQUEL} - ${ubi.NIVEL}</td>`;
            });
        } else {
            console.error("ERROR DESDE EL SERVIDOR:", resultado.error);
        }
    } catch (error) {
        console.error("ERROR AL CARGAR LAS TABLAS SECUNDARIAS:", error);
    }
}

mostrarTablasSecundarias();

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