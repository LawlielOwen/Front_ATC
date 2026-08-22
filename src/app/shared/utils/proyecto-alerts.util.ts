import Swal from 'sweetalert2';

export interface DatosAvanceProyecto {
  estatus: number;
  comentario: string;
  se_cotizo: number;
}


const ESTATUS_IMPLICA_COTIZADO = [2, 3, 6];

export function solicitarAvanceProyecto(estatusActual?: number, cotizadoActual?: number): Promise<DatosAvanceProyecto | null> {

  const yaEstaCotizado = cotizadoActual === 1;

  return Swal.fire({
    title: 'Registrar Avance',
    width: 450,
    html: `
      <div style="text-align:left;">
        <label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:6px;">Siguiente paso / Estatus *</label>
        <select id="swal-estatus" style="width:100%; box-sizing:border-box; padding:9px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px; margin-bottom:16px; outline:none;">
          <option value="2">Revisión al cliente (Cotización enviada)</option>
          <option value="3">Ejecución (En proceso / Aceptado)</option>
          <option value="5">Pausa y espera (Falta de stock / Externa)</option>
          <option value="6">Completado (Venta concretada)</option>
        </select>

        <!-- Oculto por default; solo se muestra si el estatus elegido es ambiguo (Pausa) y aún no se ha cotizado -->
        <div id="swal-cotizo-wrapper" style="display:none;">
          <label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:6px;">¿Se cotizó este proyecto?</label>
          <select id="swal-cotizo" style="width:100%; box-sizing:border-box; padding:9px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px; margin-bottom:16px;">
            <option value="0">No</option>
            <option value="1">Sí</option>
          </select>
        </div>

        <label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:6px;">Comentarios (Opcional)</label>
        <textarea id="swal-comentario" rows="3" style="width:100%; box-sizing:border-box; padding:9px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px; resize:none; outline:none;"></textarea>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Guardar Avance',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#003B8A',
    heightAuto: false,
    scrollbarPadding: false,
    didOpen: () => {
      const selectEstatus = document.getElementById('swal-estatus') as HTMLSelectElement;
      const wrapperCotizo = document.getElementById('swal-cotizo-wrapper') as HTMLDivElement;

      if (estatusActual) {
        const optionExists = Array.from(selectEstatus.options).some(opt => opt.value === estatusActual.toString());
        if (optionExists) selectEstatus.value = estatusActual.toString();
      }

  
      const actualizarVisibilidadCotizo = () => {
        const estatusSeleccionado = Number(selectEstatus.value);
        const esAmbiguo = !ESTATUS_IMPLICA_COTIZADO.includes(estatusSeleccionado);
        wrapperCotizo.style.display = (!yaEstaCotizado && esAmbiguo) ? 'block' : 'none';
      };

      selectEstatus.addEventListener('change', actualizarVisibilidadCotizo);
      actualizarVisibilidadCotizo(); 
    },
    preConfirm: () => {
      const estatus = Number((document.getElementById('swal-estatus') as HTMLSelectElement).value);
      const comentario = (document.getElementById('swal-comentario') as HTMLTextAreaElement).value.trim();

      let seCotizo: number;
      if (yaEstaCotizado || ESTATUS_IMPLICA_COTIZADO.includes(estatus)) {
        seCotizo = 1;
      } else {
        seCotizo = Number((document.getElementById('swal-cotizo') as HTMLSelectElement).value);
      }

      return { estatus, se_cotizo: seCotizo, comentario };
    }
  }).then((res) => res.isConfirmed ? (res.value as DatosAvanceProyecto) : null);
}

export function mostrarExitoProyecto(mensaje: string): Promise<void> {
  return Swal.fire({
    icon: 'success',
    title: '¡Actualizado!',
    text: mensaje,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#1D9E75',
    heightAuto: false
  }).then(() => {});
}

export function mostrarErrorProyecto(mensaje: string): Promise<void> {
  return Swal.fire({
    icon: 'error',
    title: 'Ocurrió un error',
    text: mensaje,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#dc2626',
    heightAuto: false
  }).then(() => {});
}