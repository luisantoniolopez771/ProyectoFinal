const formulario = document.getElementById('login-form');

formulario.addEventListener('submit', async function (event) {
    event.preventDefault();

    const usuarioCapturado = document.getElementById('username').value;
    const passwordCapturado = document.getElementById('password').value;

    const datosLogin = {
        usuario: usuarioCapturado,
        password: passwordCapturado,
    };

    try {
        const respuesta = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosLogin)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            localStorage.setItem('usuarioLogueado', resultado.mensaje);
            localStorage.setItem('rolUsuario', resultado.rol);
            localStorage.setItem('idUsuario', resultado.idUsuario);
            localStorage.setItem('estadoUsuario', resultado.estado)
            alert("¡Bienvenido, " + resultado.mensaje + "!");
            window.location.href = "inventario.html";
        } else {
            alert("Error: " + resultado.error);
        }
    } catch (error) {
        alert("No se pudo conectar con el servidor. Verifica que Node esté corriendo.");
    }
});