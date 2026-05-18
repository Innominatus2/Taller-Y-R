// buscador.js - Lógica independiente del buscador global
document.addEventListener('DOMContentLoaded', function() {
  const buscador = document.getElementById('buscadorGlobal');
  const resultados = document.getElementById('resultadosGlobal');
  
  if (!buscador || !resultados) return;

  let todosProductos = [];
  let todosServicios = [];

  // Función para escanear productos en el DOM
  function escanearProductos() {
    const productos = [];
    document.querySelectorAll('.producto-card').forEach((card, index) => {
      const img = card.querySelector('img');
      const nombre = card.querySelector('h3')?.textContent.trim() || 'Sin nombre';
      const link = card.querySelector('a')?.href;
      
      let categoria = 'desconocida';
      let imgNum = '?';
      
      if (img && img.src) {
        const matchNeumatico = img.src.match(/neumaticos?[\/\\]neumatico(\d+)\./i);
        const matchCandado = img.src.match(/candados?[\/\\]candado(\d+)\./i);
        const matchAccesorio = img.src.match(/accesorios?[\/\\]accesorio(\d+)\./i);
        
        if (matchNeumatico) { categoria = 'neumaticos'; imgNum = matchNeumatico[1]; }
        else if (matchCandado) { categoria = 'candados'; imgNum = matchCandado[1]; }
        else if (matchAccesorio) { categoria = 'accesorios'; imgNum = matchAccesorio[1]; }
      }
      
      productos.push({
        nombre: nombre,
        link: link,
        categoria: categoria,
        numero: imgNum,
        card: card,
        id: card.id || `prod-${categoria}-${imgNum}-${index}`
      });
    });
    return productos;
  }

  // Función para escanear servicios en el DOM
  function escanearServicios() {
    const servicios = [];
    document.querySelectorAll('.servicio-card').forEach((servicio, index) => {
      const titulo = servicio.querySelector('h3')?.textContent.trim() || '';
      const descripcion = servicio.querySelector('.servicio-descripcion')?.textContent.trim() || '';
      const precio = servicio.querySelector('.servicio-precio')?.textContent.trim() || '';
      
      servicios.push({
        nombre: titulo,
        descripcion: descripcion,
        precio: precio,
        categoria: 'servicios',
        numero: index + 1,
        card: servicio,
        id: `servicio-${index}`,
        esServicio: true
      });
    });
    return servicios;
  }

  // Inicializar o actualizar los índices de búsqueda
  window.actualizarIndiceBuscador = function() {
    todosProductos = escanearProductos();
    todosServicios = escanearServicios();
    console.log(`📦 Buscador indexado: ${todosProductos.length} productos + ${todosServicios.length} servicios.`);
  };

  // Ejecución inicial
  setTimeout(window.actualizarIndiceBuscador, 500);

  function getHoverColor() {
    return document.body.classList.contains('light-mode') ? '#e2e8f0' : '#2a2a2a';
  }
  
  function getBorderColor() {
    return document.body.classList.contains('light-mode') ? '#e2e8f0' : '#333';
  }

  // EVENTO PRINCIPAL DE BÚSQUEDA
  buscador.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase().trim();
    
    if (texto.length < 2) {
      resultados.style.display = 'none';
      return;
    }

    const todosItems = [...todosProductos, ...todosServicios];
    const filtrados = todosItems.filter(item => {
      const nombreMatch = item.nombre.toLowerCase().includes(texto);
      const numMatch = item.numero?.toString().includes(texto);
      const categoriaMatch = item.categoria?.includes(texto);
      const descripcionMatch = item.descripcion?.toLowerCase().includes(texto);
      const precioMatch = item.precio?.toLowerCase().includes(texto);
    
      return nombreMatch || numMatch || categoriaMatch || descripcionMatch || precioMatch;
    });

    const borderColor = getBorderColor();
    const hoverBgColor = getHoverColor();

    if (filtrados.length > 0) {
      resultados.innerHTML = filtrados.map(item => {
        const nombreResaltado = item.nombre.replace(
          new RegExp(`(${texto})`, 'gi'),
          '<span style="background:#00bfff20; color:#00bfff;">$1</span>'
        );
        
        const icono = item.categoria === 'neumaticos' ? '🛞' : 
                      item.categoria === 'candados' ? '🔒' : 
                      item.categoria === 'accesorios' ? '⚡' : 
                      item.categoria === 'servicios' ? '⚙️' : '📦';
        
        return `
          <div style="padding:0.8rem 1rem; border-bottom:1px solid ${borderColor}; cursor:pointer; transition:0.2s;" 
               onclick="cambiarAPestanaYScroll('${item.categoria}', '${item.id}')"
               onmouseover="this.style.background='${hoverBgColor}'"
               onmouseout="this.style.background='transparent'">
            <div style="display:flex; align-items:center; gap:1rem;">
              <span style="color:#00bfff; font-size:1.2rem;">${icono}</span>
              <div style="flex:1;">
                <div style="font-weight:500;">${nombreResaltado}</div>
                <div style="display:flex; gap:1rem; font-size:0.8rem; color:#888;">
                  <span>📁 ${item.categoria}</span>
                  <span>🔢 ${item.numero || '—'}</span>
                </div>
              </div>
              <span style="color:#00bfff; font-size:0.9rem;">Ver →</span>
            </div>
          </div>
        `;
      }).join('');
      resultados.style.display = 'block';
    } else {
      resultados.innerHTML = `
        <div style="padding:2rem; text-align:center;">
          <div style="font-size:2rem; margin-bottom:0.5rem;">😕</div>
          <div style="color:#888;">No encontramos "${texto}"</div>
          <div style="font-size:0.8rem; color:#666; margin-top:0.5rem;">Prueba con: pinchazo, batería, 7, tubeless...</div>
        </div>
      `;
      resultados.style.display = 'block';
    }
  });

  // Forzar actualización si cambia el tema visual
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function() {
      if (resultados.style.display === 'block' && buscador.value.length >= 2) {
        setTimeout(() => { buscador.dispatchEvent(new Event('input')); }, 50);
      }
    });
  }

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.buscador-container')) {
      resultados.style.display = 'none';
    }
  });

  // Atajo de teclado: ESC para cerrar
  buscador.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      resultados.style.display = 'none';
      buscador.blur();
    }
  });

  // Adaptar placeholders según dispositivo
  function actualizarPlaceholder() {
    const esMovil = window.innerWidth <= 600;
    const placeholderPC = buscador.getAttribute('data-placeholder-pc');
    const placeholderMobile = buscador.getAttribute('data-placeholder-mobile');
    buscador.placeholder = (esMovil && placeholderMobile) ? placeholderMobile : placeholderPC;
  }
  
  actualizarPlaceholder();
  window.addEventListener('resize', actualizarPlaceholder);
});