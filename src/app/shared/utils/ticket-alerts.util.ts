import Swal from 'sweetalert2';

export function confirmarAvanceEstatus(pregunta: string, textoEstatus: string): Promise<boolean> {
  return Swal.fire({
    icon: 'question',
    title: pregunta,
    text: `El ticket avanzará a estatus: ${textoEstatus}.`,
    showCancelButton: true,
    confirmButtonText: 'Sí, avanzar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#003B8A',
    heightAuto: false
  }).then((resultado) => resultado.isConfirmed);
}

export interface DatosCierreTicket {
  ventaExitosa: number;
  clienteRegistrado: number;
}

export function solicitarDatosCierreTicket(): Promise<DatosCierreTicket | null> {
  return Swal.fire({
    title: 'Cerrar Ticket',
    width: 420,
    html: `
      <div style="text-align:left;">
        <label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:6px;">
          ¿Se concretó la venta?
        </label>
        <select id="swal-venta" style="width:100%; box-sizing:border-box; padding:9px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px; color:#0d1f38; background:#fff; margin-bottom:16px;">
          <option value="1">Sí</option>
          <option value="0">No</option>
        </select>
 
        <label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:6px;">
          ¿El cliente quedó registrado?
        </label>
        <select id="swal-registrado" style="width:100%; box-sizing:border-box; padding:9px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px; color:#0d1f38; background:#fff;">
          <option value="1">Sí</option>
          <option value="0">No</option>
        </select>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Cerrar ticket',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#1D9E75',
    cancelButtonColor: '#64748b',
    heightAuto: false,
    preConfirm: () => {
      const ventaExitosa = (document.getElementById('swal-venta') as HTMLSelectElement).value;
      const clienteRegistrado = (document.getElementById('swal-registrado') as HTMLSelectElement).value;
      return { ventaExitosa: Number(ventaExitosa), clienteRegistrado: Number(clienteRegistrado) };
    }
  }).then((resultado) => {
    if (!resultado.isConfirmed) return null;
    return resultado.value as DatosCierreTicket;
  });
}

export function mostrarExitoTicket(mensaje: string): Promise<void> {
  return Swal.fire({
    icon: 'success',
    title: '¡Listo!',
    text: mensaje,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#1D9E75',
    heightAuto: false
  }).then(() => {});
}

export function mostrarErrorTicket(mensaje: string): Promise<void> {
  return Swal.fire({
    icon: 'error',
    title: 'Ocurrió un error',
    text: mensaje,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#dc2626',
    heightAuto: false
  }).then(() => {});
}