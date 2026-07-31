import Swal from 'sweetalert2';

export function mostrarAvisoStockIncompleto(mensaje: string): Promise<void> {
  return Swal.fire({
    icon: 'warning',
    title: 'Pedido con stock incompleto',
    html: `
      <p style="margin-bottom: 10px; font-size: 13px;">${mensaje}</p>
      <p style="font-size: 12px; color: #64748b; line-height: 1.4;">
        La factura quedó registrada correctamente, pero no había existencias suficientes 
        para apartar la totalidad de los productos solicitados. En cuanto haya stock disponible, 
        el pedido podrá completarse.
      </p>
    `,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#003B8A',
    allowOutsideClick: true,
    allowEscapeKey: true,
    heightAuto: false
  }).then(() => {});
}


export function mostrarExitoPedido(mensaje: string): Promise<void> {
  return Swal.fire({
    icon: 'success',
    title: '¡Pedido actualizado!',
    text: mensaje,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#1D9E75',
    heightAuto: false
  }).then(() => {});
}