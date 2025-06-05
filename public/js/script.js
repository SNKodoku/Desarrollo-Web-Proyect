document.addEventListener('DOMContentLoaded', function () {
  // ---------------------- MENÚ RESPONSIVE ----------------------
  const menuIcon = document.getElementById("menu-icon");
  const navList = document.getElementById("nav-list");
  if (menuIcon && navList) {
    menuIcon.addEventListener("click", () => {
      navList.classList.toggle("active");
    });
  }

  // ---------------------- BUSQUEDA EN busqueda.html ----------------------
  const searchForm = document.getElementById('search-form');
  const resultadosBusqueda = document.getElementById('resultados-busqueda');
  if (searchForm && resultadosBusqueda) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const oficio = searchForm.oficio.value;
      const delegacion = searchForm.delegacion.value;

      const query = `oficio=${encodeURIComponent(oficio)}&delegacion=${encodeURIComponent(delegacion)}`;

      fetch(`/api/buscar?${query}`)
        .then(res => res.json())
        .then(data => mostrarResultadosBusqueda(data))
        .catch(err => {
          console.error(err);
          resultadosBusqueda.innerHTML = '<p>Error al cargar los resultados.</p>';
        });
    });

    function mostrarResultadosBusqueda(profesionales) {
      resultadosBusqueda.innerHTML = '';

      if (!profesionales.length) {
        resultadosBusqueda.innerHTML = '<p>No se encontraron profesionales para los criterios seleccionados.</p>';
        return;
      }

      profesionales.forEach(p => {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
          <img src="${p.foto || 'https://via.placeholder.com/150'}" alt="${p.nombre}">
          <h3>${p.nombre}</h3>
          <p><strong>Oficio:</strong> ${p.oficio}</p>
          <p><strong>Delegación:</strong> ${p.delegacion}</p>
          <p>${p.descripcion}</p>
          <p><strong>Contacto:</strong> ${p.contacto}</p>
        `;
        resultadosBusqueda.appendChild(div);
      });
    }
  }

  // ---------------------- CARGA DE PROFESIONALES EN profesionales.html ----------------------
  const listaProfesionales = document.getElementById('lista-profesionales');
  if (listaProfesionales) {
    fetch('/api/profesionales')
      .then(res => res.json())
      .then(data => {
        listaProfesionales.innerHTML = '';
        if (!data.length) {
          listaProfesionales.innerHTML = '<p>No hay profesionales registrados aún.</p>';
          return;
        }

        data.forEach(p => {
          const div = document.createElement('div');
          div.classList.add('card');
          div.innerHTML = `
            <img src="${p.foto || 'https://via.placeholder.com/100'}" alt="${p.nombre}">
            <h3>${p.nombre}</h3>
            <p><strong>Oficio:</strong> ${p.oficio}</p>
            <p><strong>Delegación:</strong> ${p.delegacion}</p>
            <p>${p.descripcion}</p>
            <p><strong>Contacto:</strong> ${p.contacto}</p>
            <button onclick="window.location.href='perfil.html?id=${p.id}'">Ver Perfil</button>
          `;
          listaProfesionales.appendChild(div);
        });
      })
      .catch(err => {
        listaProfesionales.innerHTML = `<p>Error al cargar los profesionales.</p>`;
        console.error(err);
      });
  }

  // ---------------------- PERFIL.HTML ----------------------
  const perfilContainer = document.getElementById('perfil-container');
  if (perfilContainer) {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      perfilContainer.innerHTML = '<p>Error: No se proporcionó un ID.</p>';
      return;
    }

    fetch(`/api/profesional/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data || !data.nombre) {
          perfilContainer.innerHTML = '<p>No se encontró el profesional.</p>';
          return;
        }

        perfilContainer.innerHTML = `
          <img src="${data.foto || 'https://via.placeholder.com/150'}" alt="${data.nombre}" class="perfil-foto">
          <h2>${data.nombre}</h2>
          <p><strong>Oficio:</strong> ${data.oficio}</p>
          <p><strong>Delegación:</strong> ${data.delegacion}</p>
          <p><strong>Descripción:</strong> ${data.descripcion}</p>
          <p><strong>Contacto:</strong> ${data.contacto}</p>
        `;
      })
      .catch(error => {
        perfilContainer.innerHTML = '<p>Error al cargar los datos.</p>';
        console.error(error);
      });
  }

  // ---------------------- REGISTRAR.HTML ----------------------
  const formRegistro = document.getElementById('form-registro');
  if (formRegistro) {
    formRegistro.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(formRegistro);
      const data = {};
      formData.forEach((value, key) => data[key] = value);

      fetch('/api/profesionales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(res => {
          alert('¡Profesional registrado con éxito!');
          window.location.href = 'profesionales.html';
        })
        .catch(err => {
          alert('Error al registrar profesional');
          console.error(err);
        });
    });
  }

  // ---------------------- CONTACTO.HTML ----------------------
  const formContacto = document.getElementById('form-contacto');
  if (formContacto) {
    formContacto.addEventListener('submit', function (e) {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value;
      const correo = document.getElementById('correo').value;
      const mensaje = document.getElementById('mensaje').value;

      fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, mensaje })
      })
        .then(res => res.json())
        .then(() => {
          alert('Mensaje enviado correctamente');
          formContacto.reset();
        })
        .catch(err => {
          alert('Error al enviar el mensaje');
          console.error(err);
        });
    });
  }

  // ---------------------- ADMIN.HTML ----------------------
  const adminLista = document.getElementById('lista-profesionales-admin');
  if (adminLista) {
    fetch('/api/profesionales')
      .then(res => res.json())
      .then(data => {
        adminLista.innerHTML = '';
        document.getElementById('total-profesionales').textContent = data.length;

        if (!data.length) {
          adminLista.innerHTML = '<p>No hay profesionales registrados.</p>';
          return;
        }

        data.forEach(p => {
          const div = document.createElement('div');
          div.classList.add('admin-card');
          div.innerHTML = `
            <h3>${p.nombre}</h3>
            <p><strong>Oficio:</strong> ${p.oficio}</p>
            <p><strong>Delegación:</strong> ${p.delegacion}</p>
            <button onclick="eliminarProfesional(${p.id})">🗑️ Eliminar</button>
          `;
          adminLista.appendChild(div);
        });
      })
      .catch(err => {
        adminLista.innerHTML = '<p>Error al cargar profesionales.</p>';
        console.error(err);
      });
  }

  // ---------------------- ADMIN - ELIMINAR PROFESIONAL ----------------------
  window.eliminarProfesional = function (id) {
    if (!confirm('¿Seguro que deseas eliminar este profesional?')) return;
    fetch(`/api/profesionales/${id}`, { method: 'DELETE' })
      .then(() => location.reload())
      .catch(err => alert('Error al eliminar profesional'));
  };

  // ---------------------- ADMIN - BORRAR TODOS ----------------------
  const btnBorrarTodos = document.getElementById('btn-borrar-todos');
  if (btnBorrarTodos) {
    btnBorrarTodos.addEventListener('click', async () => {
      if (!confirm('¿Seguro que deseas eliminar TODOS los profesionales?')) return;

      const res = await fetch('/api/borrar-todos', { method: 'DELETE' });
      const data = await res.json();
      alert(data.message);
      location.reload();
    });
  }
});
