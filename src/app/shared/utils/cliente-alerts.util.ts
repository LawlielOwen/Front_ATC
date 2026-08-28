import Swal from 'sweetalert2';
import { Cliente } from '../model/clientes.model';

export interface DatosCredito {
  tiene_credito: boolean;
  limite_credito: number;
  fecha_vencimiento: string | null;   // 'YYYY-MM-DD' o null si tiene_credito=false
}

export function mostrarAsignarCredito(cliente: Cliente): Promise<DatosCredito | null> {
  const tieneCreditoActual = !!cliente.tiene_credito;
  const limiteActual = cliente.limite_credito ?? 0;
  const fechaActual = (cliente as any).fecha_vencimiento_credito
    ? String((cliente as any).fecha_vencimiento_credito).substring(0, 10)
    : '';

  // Fecha mínima seleccionable: mañana (el SP exige estrictamente posterior a hoy)
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const fechaMinima = manana.toISOString().substring(0, 10);

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
          style="margin:0 0 14px 0; width:100%;">

        <label for="swal-fecha-vencimiento" style="font-size:11px; font-weight:700; text-transform:uppercase; color:#94a3b8; display:block; margin-bottom:4px;">
          Vigente hasta
        </label>
        <input 
          id="swal-fecha-vencimiento" 
          type="date" 
          min="${fechaMinima}"
          value="${fechaActual}"
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
      const fechaInput = document.getElementById('swal-fecha-vencimiento') as HTMLInputElement;

      const tiene_credito = tieneCreditoInput.checked;
      const limite_credito = parseFloat(limiteInput.value);
      const fecha_vencimiento = fechaInput.value || null;

      if (tiene_credito && (isNaN(limite_credito) || limite_credito <= 0)) {
        Swal.showValidationMessage('Debes capturar un límite de crédito mayor a $0 para autorizar crédito.');
        return false;
      }

      // NUEVO: fecha obligatoria si se autoriza crédito
      if (tiene_credito && !fecha_vencimiento) {
        Swal.showValidationMessage('Debes capturar una fecha de vigencia para la línea de crédito.');
        return false;
      }

      if (!tiene_credito) {
        return { tiene_credito: false, limite_credito: 0, fecha_vencimiento: null };
      }

      return { tiene_credito, limite_credito, fecha_vencimiento };
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