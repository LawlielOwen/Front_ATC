import Swal from 'sweetalert2';
import { Cliente } from '../model/clientes.model';

export interface DatosCredito {
  tiene_credito: boolean;
  limite_credito: number;
}

export function mostrarAsignarCredito(cliente: Cliente): Promise<DatosCredito | null> {
  const tieneCreditoActual = !!cliente.tiene_credito;
  const limiteActual = cliente.limite_credito ?? 0;

  return Swal.fire({
    title: 'Línea de Crédito',
    html: `
      <div style="text-align:left; font-size:13px; color:#475569;">
        <p style="margin-bottom: 12px;">Cliente: <strong>${cliente.Razon_social || cliente.Nombre}</strong></p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:14px; cursor:pointer;">
          <input type="checkbox" id="swal-tiene-credito" ${tieneCreditoActual ? 'checked' : ''} style="width:16px; height:16px;">
          <span>Cliente con línea de crédito autorizada</span>
        </label>

        <label for="swal-limite-credito" style="font-size:11px; font-weight:700; text-transform:uppercase; color:#94a3b8; display:block; margin-bottom:4px;">
          Límite autorizado (MXN)
        </label>
        <input 
          id="swal-limite-credito" 
          type="number" 
          min="0" 
          step="0.01" 
          value="${limiteActual}" 
          placeholder="0.00"
          class="swal2-input" 
          style="margin:0; width:100%;">
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#003B8A',
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    heightAuto: false,
    preConfirm: () => {
      const tieneCreditoInput = document.getElementById('swal-tiene-credito') as HTMLInputElement;
      const limiteInput = document.getElementById('swal-limite-credito') as HTMLInputElement;

      const tiene_credito = tieneCreditoInput.checked;
      const limite_credito = parseFloat(limiteInput.value);

      if (tiene_credito && (isNaN(limite_credito) || limite_credito <= 0)) {
        Swal.showValidationMessage('Debes capturar un límite de crédito mayor a $0 para autorizar crédito.');
        return false;
      }

      if (!tiene_credito) {
        return { tiene_credito: false, limite_credito: 0 };
      }

      return { tiene_credito, limite_credito };
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      return result.value as DatosCredito;
    }
    return null;
  });
}

export function mostrarExitoCredito(mensaje: string) {
  return Swal.fire({
    icon: 'success',
    title: 'Crédito actualizado',
    text: mensaje,
    confirmButtonColor: '#10b981',
    heightAuto: false
  });
}