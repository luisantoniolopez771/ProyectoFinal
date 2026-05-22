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
        document.getElementById("cabezera-editar-maquina").style.display = "none";
        document.getElementById("cabezera-editar-pieza").style.display = "none";
    }
}

//VALIDAR INICIO DE SESION --------------------------------------------------------------------------------------------------------------
function validarSesion() {
    const idu = localStorage.getItem('idUsuario');
    const estado = localStorage.getItem('estadoUsuario')
    if (idu == null) {
        alert("Se necesita iniciar sesion!");
        window.location.href = "index.html";
    } else if (estado.trim() == 'INACTIVO') {
        alert("Usuario no activo, contacte con un administrador!");
        window.location.href = "index.html";
    }
}

validarSesion();
comprobarRol();

//CARGAR TABLA DE PIEZAS ----------------------------------------------------------------------------------------------------------------
async function cargarInventario() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/inventario');
        const resultado = await respuesta.json();

        if (respuesta.ok) {
            const tbodyInventario = document.getElementById('tabla-inventario');
            const tbodyMaquina = document.getElementById('tabla-maquinas');
            tbodyInventario.innerHTML = "";
            tbodyMaquina.innerHTML = "";

            if (localStorage.getItem('rolUsuario') === "Trabajador") {

                resultado.datosInventario.forEach(pieza => {

                    const fila = tbodyInventario.insertRow();
                    fila.innerHTML = `
                    <td>${pieza.NOMBRE}</td>
                    <td>${pieza.MARCA || 'N/A'}</td>
                    <td>${pieza.MEDIDA || 'N/A'}</td>
                    <td>${pieza.CATEGORIA || 'N/A'}</td>
                    <td>${pieza.UBICACION || 'N/A'}</td>
                    <td>${pieza.COLOR_TIPO || 'N/A'}</td>
                    <td>${pieza.STOCK_ACTUAL}</td>
                `;
                });

                resultado.datosMaquina.forEach(maquina => {

                    botonAccion = `<button class="btn-secundario" onclick="abrirModalPiezas(${maquina.ID_MAQUINA}, '${maquina.MODELO}')">Ver Piezas</button>`;

                    const fila = tbodyMaquina.insertRow();
                    fila.innerHTML = `
                <td>${maquina.NOSERIE}</td>
                <td>${maquina.MARCA}</td>
                <td>${maquina.MODELO}</td>
                <td>${maquina.AREA || 'N/A'}</td>
                <td>${maquina.DESCRIPCION || 'N/A'}</td>
                <td>${botonAccion}</td>
                `;
                });

            } else {
                resultado.datosInventario.forEach(pieza => {

                    botonAccion = `<button class="btn-secundario" onclick="abrirModalEditar(${pieza.ID_PIEZA})">Editar Pieza</button>`;

                    const fila = tbodyInventario.insertRow();
                    fila.innerHTML = `
                    <td>${pieza.NOMBRE}</td>
                    <td>${pieza.MARCA || 'N/A'}</td>
                    <td>${pieza.MEDIDA || 'N/A'}</td>
                    <td>${pieza.CATEGORIA || 'N/A'}</td>
                    <td>${pieza.UBICACION || 'N/A'}</td>
                    <td>${pieza.COLOR_TIPO || 'N/A'}</td>
                    <td>${pieza.STOCK_ACTUAL}</td>
                    <td>${botonAccion}</td>
                `;
                });

                resultado.datosMaquina.forEach(maquina => {

                    botonVer = `<button class="btn-secundario" onclick="abrirModalPiezas(${maquina.ID_MAQUINA}, '${maquina.MODELO}')">Ver Piezas</button>`;
                    botonEditar = `<button class="btn-secundario" onclick="abrirModalMaquina(${maquina.ID_MAQUINA})">Editar Maquina</button>`;

                    const fila = tbodyMaquina.insertRow();
                    fila.innerHTML = `
                <td>${maquina.NOSERIE}</td>
                <td>${maquina.MARCA}</td>
                <td>${maquina.MODELO}</td>
                <td>${maquina.AREA || 'N/A'}</td>
                <td>${maquina.DESCRIPCION || 'N/A'}</td>
                <td>${botonVer}</td>
                <td>${botonEditar}</td>
                `;
                });
            }

        } else {
            console.error("Error desde el servidor :", resultado.error);
        }
    } catch (error) {
        console.error("No se pudo conectar al backend: ", error);
    }
}

cargarInventario();

//MOSTRAR PIEZAS POR MAQUINA --------------------------------------------------------------------------------------------------------------
async function abrirModalPiezas(MAQ, MOD) {
    const idMaquina = MAQ;
    let modeloMaquina = '';

    try {
        const respuesta = await fetch(`http://localhost:3000/api/piezas-por-maquina/${idMaquina}`);
        const resultado = await respuesta.json();

        if (resultado.exito) {
            modeloMaquina = MOD;
            document.getElementById('modal-maquina-titulo').innerText = MOD;
            document.getElementById('modal-ver-piezas').classList.add("activo");

            const tbodyPiezasMaquinas = document.getElementById('tabla-piezas-compatibles');
            tbodyPiezasMaquinas.innerHTML = "";

            resultado.piezas.forEach(pieza => {
                const fila = tbodyPiezasMaquinas.insertRow();
                fila.innerHTML = `
                <td>${pieza.ID_PIEZA}</td>
                <td>${pieza.NOMBRE}</td>
                <td>${pieza.STOCK}</td>
                <td>${pieza.UBICACION}</td>`
            });
        } else {
            console.error("Error desde el servidor: ", resultado.error);
        }
    } catch (error) {
        console.error("No se pudo conectar con al backend: ", error);
    }
}

function cerrarModalPiezas() {
    document.getElementById('modal-ver-piezas').classList.remove("activo");
}

//EDITAR MAQUINA --------------------------------------------------------------------------------------------------------------------------
async function abrirModalMaquina(MAQ) {
    const idMaquina = MAQ

    try {
        const respuesta = await fetch('http://localhost:3000/api/catalogos');

        const resultado = await respuesta.json();

        if (resultado.exito) {

            document.getElementById('modal-editar-maquina').classList.add("activo");

            const selectMarca = document.getElementById('edit-maq-marca');
            selectMarca.innerHTML = '<option value="">Seleccione...</option>';
            resultado.marcas.forEach(mar => {
                selectMarca.innerHTML += `<option value="${mar.ID_MARCA}"> ${mar.NOMBRE_MARCA} </option>`;
            });

            const selectArea = document.getElementById('edit-maq-area');
            selectArea.innerHTML = '<option value="">Seleccione...</option>';
            resultado.areasbordado.forEach(are => {
                selectArea.innerHTML += `<option value="${are.ID_AREA}"> ${are.NOMBRE_AREA} </option>`;
            });
        } else {
            console.error("Error desde el servidor: ", resultado.error);
        }
    } catch (error) {
        console.error("No se pudo conectar con el backend: ", error);
    }

    try {
        const respuesta = await fetch(`http://localhost:3000/api/datos-maquina/${idMaquina}`);

        const resultado = await respuesta.json();

        if (resultado.exito) {
            document.getElementById('edit-maq-modelo').value = resultado.maquina[0].NOMBRE_MODELO;
            document.getElementById('edit-maq-serie').value = resultado.maquina[0].NOSERIE;
            document.getElementById('edit-maq-marca').value = resultado.maquina[0].ID_MARCA;
            document.getElementById('edit-maq-area').value = resultado.maquina[0].ID_AREA;
            document.getElementById('edit-maq-descripcion').value = resultado.maquina[0].DESCRIPCION_MAQUINA;
            document.getElementById('edit-maq-id').value = idMaquina;
        } else {
            console.error("Error desde el servidor: ", resultado.error);
        }
    } catch (error) {
        console.error("No se pudo conectar al backend: ", error);
    }
}

function cerrarModalEditarMaquina() {
    document.getElementById('modal-editar-maquina').classList.remove("activo");
}

//CONFIRMAR EDICION DE MAQUINA ------------------------------------------------------------------------------------------------------------
async function guardarCambiosMaquina(){
    const datosActualizacionMaquina = {
        id: document.getElementById('edit-maq-id').value,
        modelo: document.getElementById('edit-maq-modelo').value,
        serie: document.getElementById('edit-maq-serie').value,
        marca:  document.getElementById('edit-maq-marca').value,
        area:  document.getElementById('edit-maq-area').value,
        descripcion: document.getElementById('edit-maq-descripcion').value
    }

    try {
        const respuesta = await fetch('http://localhost:3000/api/actualizar-maquina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizacionMaquina)
        });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert(resultado.mensaje);
            cerrarModalEditarMaquina();
            cargarInventario();
        } else {
            console.error("Error desde el servidor: ", error);
        }
    } catch (error) {
        console.error("No se pudo conectar al backend: ", error);
    }
}

//EDITAR PIEZAS POR MAQUINA ---------------------------------------------------------------------------------------------------------------
async function abrirModalEditar(PIE) {
    const idPieza = PIE;

    try {
        const respuesta = await fetch('http://localhost:3000/api/catalogos');
        const resultado = await respuesta.json();

        if (resultado.exito) {

            document.getElementById('modal-editar-pieza').classList.add("activo");

            const selectCategoria = document.getElementById('edit-prod-categoria');
            selectCategoria.innerHTML = '<option value="">Seleccione...</option>';
            resultado.categorias.forEach(cat => {
                selectCategoria.innerHTML += `<option value="${cat.ID_CATEGORIA}"> ${cat.NOMBRE_CATEGORIA} </option>`;
            });

            const selectMarca = document.getElementById('edit-prod-marca');
            selectMarca.innerHTML = '<option value="">Seleccione...</option>';
            resultado.marcas.forEach(mar => {
                selectMarca.innerHTML += `<option value="${mar.ID_MARCA}"> ${mar.NOMBRE_MARCA} </option>`;
            });

            const selectMedida = document.getElementById('edit-prod-medida');
            selectMedida.innerHTML = '<option value="">Seleccione...</option>';
            resultado.medidas.forEach(med => {
                selectMedida.innerHTML += `<option value="${med.ID_MEDIDA}"> ${med.VALOR_MEDIDA} </option>`;
            });

            const selectUbicacion = document.getElementById('edit-prod-ubicacion');
            selectUbicacion.innerHTML = '<option value="">Seleccione...</option>';
            resultado.ubicaciones.forEach(ubi => {
                selectUbicacion.innerHTML += `<option value="${ubi.ID_UBICACION}"> ${ubi.ANAQUEL} - ${ubi.NIVEL} </option>`;
            });
        } else {
            console.error("Error desde el servidor: ", resultado.error);
        }
    } catch (error) {
        console.error("No se pudo conectar al backend: ", error);
    }


    try {
        const respuesta = await fetch(`http://localhost:3000/api/datos-pieza/${idPieza}`);
        const resultado = await respuesta.json();

        if (resultado.exito) {
            document.getElementById('edit-prod-nombre').value = resultado.pieza[0].NOMBRE || 'N/A';
            document.getElementById('edit-prod-color').value = resultado.pieza[0].COLOR_TIPO || 'N/A';
            document.getElementById('edit-prod-categoria').value = resultado.pieza[0].ID_CATEGORIA || 'N/A';
            document.getElementById('edit-prod-marca').value = resultado.pieza[0].ID_MARCA || 'N/A';
            document.getElementById('edit-prod-medida').value = resultado.pieza[0].ID_MEDIDA || 'N/A';
            document.getElementById('edit-prod-ubicacion').value = resultado.pieza[0].ID_UBICACION || 'N/A';
            document.getElementById('edit-prod-id').value = resultado.pieza[0].ID_PIEZA;
            document.getElementById('edit-prod-stock').value = resultado.pieza[0].STOCK_ACTUAL;
        } else {
            console.error("Error desde el servidor: ", resultado.error);
        }
    } catch (error) {
        console.error("No se pudo conectar al backend: ", error);
    }
}

function cerrarModalEditar() {
    document.getElementById('modal-editar-pieza').classList.remove("activo");
}

//CONFIRMAR EDICION DE PIEZA --------------------------------------------------------------------------------------------------------------
async function guardarCambiosPieza() {

    const datosActualizacionPieza = {
        id: document.getElementById('edit-prod-id').value,
        nombre: document.getElementById('edit-prod-nombre').value,
        color: document.getElementById('edit-prod-color').value,
        marca: document.getElementById('edit-prod-marca').value,
        ubicacion: document.getElementById('edit-prod-ubicacion').value,
        categoria: document.getElementById('edit-prod-categoria').value,
        medida: document.getElementById('edit-prod-medida').value
    }

    try {
        const respuesta = await fetch('http://localhost:3000/api/actualizar-pieza', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizacionPieza)
        });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert(resultado.mensaje);
            cerrarModalEditar();
            cargarInventario();
        } else {
            console.error("Error desde el servidor: ", error);
        }
    } catch (error) {
        console.error("Error desde el servidor: ", error);
    }
}

//FILTRO DE BUSQUEDA INVENTARIO -----------------------------------------------------------------------------------------------------------
document.getElementById('buscador').addEventListener('keyup', function () {
    const textoBusqueda = this.value.toLowerCase();
    const filas = document.querySelectorAll('#tabla-inventario tr');

    filas.forEach(fila => {
        const contenidoFila = fila.textContent.toLowerCase();
        fila.style.display = contenidoFila.includes(textoBusqueda) ? '' : 'none';
    });
});

//FILTRO DE BUSQUEDA MAQUINA -------------------------------------------------------------------------------------------------------------
document.getElementById('buscador-maquina').addEventListener('keyup', function () {
    const textoBusqueda = this.value.toLowerCase();
    const filas = document.querySelectorAll('#tabla-maquinas tr');

    filas.forEach(fila => {
        const contenidoFila = fila.textContent.toLowerCase();
        fila.style.display = contenidoFila.includes(textoBusqueda) ? '' : 'none';
    });
});

//FILTRO DE TABLA ------------------------------------------------------------------------------------------------------------------------
let ordenAscendente = true;
let columnaActual = -1;

function ordenarTabla(columnaIndex, tipoDato, elementoCabecera) {
    const tbody = document.getElementById("tabla-inventario");
    const filas = Array.from(tbody.querySelectorAll("tr"));

    if (columnaActual !== columnaIndex) {
        ordenAscendente = true;
        columnaActual = columnaIndex;
    } else {
        ordenAscendente = !ordenAscendente;
    }

    const todosLosIconos = document.querySelectorAll(".icono-orden");
    todosLosIconos.forEach(icono => icono.innerText = "↕");

    const iconoClickeado = elementoCabecera.querySelector(".icono-orden");
    iconoClickeado.innerText = ordenAscendente ? "▲" : "▼";

    filas.sort((filaA, filaB) => {
        const valorA = filaA.children[columnaIndex].innerText.trim();
        const valorB = filaB.children[columnaIndex].innerText.trim();

        if (tipoDato === 'numero') {
            return ordenAscendente ? parseFloat(valorA) - parseFloat(valorB) : parseFloat(valorB) - parseFloat(valorA);
        } else {
            return ordenAscendente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
        }
    });

    filas.forEach(fila => tbody.appendChild(fila));
}