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

            resultado.datosInventario.forEach(pieza => {
                const fila = tbodyInventario.insertRow();
                fila.innerHTML = `
                    <td>${pieza.NOMBRE}</td>
                    <td>${pieza.MARCA || 'N/A'}</td>
                    <td>${pieza.MEDIDA || 'N/A'}</td>
                    <td>${pieza.CATEGORIA || 'N/A'}</td>
                    <td>${pieza.UBICACION || 'N/A'}</td>
                    <td>${pieza.MODELO || 'N/A'}</td>
                    <td>${pieza.COLOR_TIPO || 'N/A'}</td>
                    <td>${pieza.AREA || 'N/A'}</td>
                    <td>${pieza.STOCK_ACTUAL}</td>
                `;
            });

            resultado.datosMaquina.forEach(maquina => {

                botonAccion = `<a href="#" style="color:#272a4d; font-weight:bold;" onclick="cambiarEstadoUsuario(${maquina.ID_MAQUINA})">Ver Piezas</a>`;

                const fila = tbodyMaquina.insertRow();
                fila.innerHTML = `
                <td>${maquina.NOSERIE}</td>
                <td>${maquina.MARCA}</td>
                <td>${maquina.MODELO}</td>
                <td>${maquina.AREA || 'N/A'}</td>
                <td>${maquina.BASTIDOR || 'N/A'}</td>
                <td>${maquina.DESCRIPCION || 'N/A'}</td>
                <td>${botonAccion}</td>
                `;
            });
        } else {
            console.error("Error desde el servidor:", resultado.error);
        }
    } catch (error) {
        console.error("No se pudo conectar al backend:", error);
    }
}

cargarInventario();

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