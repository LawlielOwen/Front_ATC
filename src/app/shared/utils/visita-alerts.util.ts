import Swal from 'sweetalert2';

export function confirmarCompletarVisita(empresa?: string): Promise<boolean> {
  return Swal.fire({
    icon: 'question',
    title: 'Completar Visita',
    html: `¿Confirmas que deseas marcar como <b>completada</b> la visita a <b>${empresa || 'este destino'}</b>? `,
    showCancelButton: true,
    confirmButtonText: 'Sí, completar',
    cancelButtonText: 'Regresar',
    confirmButtonColor: '#003B8A',
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    allowOutsideClick: false,
    heightAuto: false
  }).then((result) => result.isConfirmed);
}