import Swal from 'sweetalert2';

export function solicitarOrdenCompra(): Promise<string | null> {
  return Swal.fire({
    title: 'Convertir a Pedido',
    html: 'Ingresa el número de <b>orden de compra</b> para confirmar y convertir esta cotización en un pedido formal.<br><br><span style="font-size: 0.85em; color: #64748b;">* Si el cliente no maneja orden de compra, puedes dejar este campo en blanco.</span>',
    input: 'text',
    inputPlaceholder: '(opcional) Número de orden de compra',
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
    heightAuto: false
    
  }).then((result) => {
    if (result.isConfirmed) {
      const valorIntroducido = (result.value as string || '').trim();
      
      return valorIntroducido !== '' ? valorIntroducido : 'Sin orden de compra';
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