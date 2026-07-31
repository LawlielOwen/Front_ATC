import Swal from 'sweetalert2';


export function solicitarOrdenCompra(): Promise<string | null> {
  return Swal.fire({
    title: 'Convertir a Pedido',
    html: 'Ingresa el número de <b>orden de compra</b> para confirmar y convertir esta cotización en un pedido formal.',
    input: 'text',
    inputPlaceholder: 'Ej. OC-2026-00123',
    inputAttributes: {
      autocapitalize: 'off',
      autocorrect: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'Confirmar y Convertir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#003B8A',
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    allowOutsideClick: false,
    heightAuto: false,
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return 'La orden de compra es obligatoria para continuar.';
      }
      return undefined;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      return (result.value as string).trim();
    }
    return null;
  });
}
export function confirmarRegistroCliente(nombreCliente?: string): Promise<boolean> {
  return Swal.fire({
    icon: 'warning',
    title: 'Cliente no registrado',
    html: `<b>${nombreCliente || 'Este cliente'}</b> aún no está dado de alta como cliente oficial. ` +
          `Debes registrarlo antes de convertir la cotización en un pedido.`,
    showCancelButton: true,
    confirmButtonText: 'Registrar cliente',
    cancelButtonText: 'Cerrar',
    confirmButtonColor: '#003B8A',
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    allowOutsideClick: false,
    heightAuto: false
  }).then((result) => result.isConfirmed);
}