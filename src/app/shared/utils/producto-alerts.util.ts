import Swal from 'sweetalert2';

export async function confirmarEliminarProducto(): Promise<boolean> {
  const resultado = await Swal.fire({
    icon: 'warning',
    title: 'Dar de baja producto',
    width: 480,
    html: `
      <div style="text-align:center; font-size:14px; color:#475569;">
        <p style="margin-bottom:14px;">
          ¿Estás seguro de que deseas dar de baja este producto?
        </p>


        <p style="font-size:12px; color:#64748b; margin-top:14px;">
          El producto y su historial permanecerán registrados.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Sí, dar de baja',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    focusCancel: true,
    heightAuto: false
  });

  return resultado.isConfirmed;
}

export async function confirmarActivarProducto(): Promise<boolean> {
  const resultado = await Swal.fire({
    icon: 'question',
    title: 'Reactivar producto',
    width: 460,
    html: `
      <div style="text-align:center; font-size:14px; color:#475569;">
        <p style="margin-bottom:14px;">
          ¿Deseas activar nuevamente este producto?
        </p>

        <div style="
          background:#ecfdf5;
          border:1px solid #a7f3d0;
          border-radius:10px;
          padding:14px;
          text-align:left;
          font-size:12px;
          color:#065f46;
        ">
          <strong>Al reactivar el producto:</strong>
          <ul style="margin:10px 0 0 18px; padding:0; line-height:1.9;">
            <li>Volverá a estar disponible en el sistema.</li>
            <li>Conservará sus datos registrados.</li>
            <li>No se restaurarán las existencias anteriores.</li>
          </ul>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Sí, activar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#059669',
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    focusCancel: false,
    heightAuto: false
  });

  return resultado.isConfirmed;
}