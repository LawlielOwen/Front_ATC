import Swal from 'sweetalert2';
import { Cliente } from '../model/clientes.model';

export interface DatosCredito {
  tiene_credito: boolean;
  limite_credito: number;
  fecha_vencimiento: string | null;   
}
export interface DatosCodigoCliente {
  codigo_cliente: string;
}

export interface DatosVigenciaCredito {
  fecha_vencimiento_credito: string;
}
export function mostrarAsignarCredito(cliente: Cliente): Promise<DatosCredito | null> {
  const tieneCreditoActual = !!cliente.tiene_credito;
  const limiteActual = cliente.limite_credito ?? 0;
  const fechaActual = (cliente as any).fecha_vencimiento_credito
    ? String((cliente as any).fecha_vencimiento_credito).substring(0, 10)
    : '';
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const fechaMinima = manana.toISOString().substring(0, 10);

  return Swal.fire({
    title: 'Línea de Crédito',
    html: `
      <div style="text-align:left; font-size:13px; color:#475569;">
        <p style="margin-bottom: 12px;">Cliente: <strong>${cliente.Nombre || cliente.Razon_social}</strong></p>

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
export function mostrarActualizarCodigo(
  cliente: Cliente
): Promise<DatosCodigoCliente | null> {

  const codigoActual = cliente.codigo_cliente || '';

  return Swal.fire({
    title: 'Código del Cliente',
    html: `
      <div style="text-align:left; font-size:13px; color:#475569;">

        <p style="margin-bottom:16px;">
          Cliente:
          <strong style="color:#0f172a;">
            ${cliente.Nombre || cliente.Razon_social}
          </strong>
        </p>

        <label
          for="swal-codigo-cliente"
          style="
            display:block;
            margin-bottom:5px;
            color:#94a3b8;
            font-size:11px;
            font-weight:700;
            text-transform:uppercase;
          ">
          Código del cliente
        </label>

        <input
          id="swal-codigo-cliente"
          type="text"
          maxlength="50"
          value="${codigoActual}"
          placeholder="Ej. CLI-00125"
          class="swal2-input"
          style="
            width:100%;
            margin:0;
            text-transform:uppercase;
          ">

        <p style="
          margin:7px 0 0 0;
          font-size:10px;
          color:#94a3b8;
        ">
          Este código debe ser único para cada cliente.
        </p>

      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Guardar código',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#0f766e',
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    heightAuto: false,

    preConfirm: () => {
      const codigoInput =
        document.getElementById('swal-codigo-cliente') as HTMLInputElement;

      const codigo_cliente =
        codigoInput.value.trim().toUpperCase();

      if (!codigo_cliente) {
        Swal.showValidationMessage(
          'Debes ingresar un código para el cliente.'
        );

        return false;
      }

      if (codigo_cliente.length > 50) {
        Swal.showValidationMessage(
          'El código no puede superar los 50 caracteres.'
        );

        return false;
      }

      return {
        codigo_cliente
      };
    }

  }).then(result => {

    if (result.isConfirmed && result.value) {
      return result.value as DatosCodigoCliente;
    }

    return null;
  });
}
function obtenerProximaFechaValida(
  mes: number,
  dia: number
): Date | null {

  const hoy = new Date();

  hoy.setHours(
    0,
    0,
    0,
    0
  );

  const anioActual =
    hoy.getFullYear();

  for (
    let anio = anioActual;
    anio <= anioActual + 8;
    anio++
  ) {

    const fecha =
      new Date(
        anio,
        mes - 1,
        dia
      );

    fecha.setHours(
      0,
      0,
      0,
      0
    );

    const fechaValida =
      fecha.getFullYear() === anio &&
      fecha.getMonth() === mes - 1 &&
      fecha.getDate() === dia;

    if (
      fechaValida &&
      fecha > hoy
    ) {
      return fecha;
    }
  }

  return null;
}

function fechaToISO(fecha: Date): string {

  const anio =
    fecha.getFullYear();

  const mes =
    (fecha.getMonth() + 1)
      .toString()
      .padStart(2, '0');

  const dia =
    fecha.getDate()
      .toString()
      .padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}
export function mostrarActualizarVigencia(
  cliente: Cliente
): Promise<DatosVigenciaCredito | null> {

  let mesActual = '';
  let diaActual = '';

  if (cliente.fecha_vencimiento_credito) {
    const partes =
      String(cliente.fecha_vencimiento_credito)
        .substring(0, 10)
        .split('-');

    if (partes.length === 3) {
      mesActual = partes[1];
      diaActual = partes[2];
    }
  }

  const meses = [
    { valor: '01', nombre: 'Enero' },
    { valor: '02', nombre: 'Febrero' },
    { valor: '03', nombre: 'Marzo' },
    { valor: '04', nombre: 'Abril' },
    { valor: '05', nombre: 'Mayo' },
    { valor: '06', nombre: 'Junio' },
    { valor: '07', nombre: 'Julio' },
    { valor: '08', nombre: 'Agosto' },
    { valor: '09', nombre: 'Septiembre' },
    { valor: '10', nombre: 'Octubre' },
    { valor: '11', nombre: 'Noviembre' },
    { valor: '12', nombre: 'Diciembre' }
  ];

  const opcionesMes = meses.map(mes => `
    <option
      value="${mes.valor}"
      ${mes.valor === mesActual ? 'selected' : ''}>
      ${mes.nombre}
    </option>
  `).join('');

  return Swal.fire({
    title: 'Renovar Vigencia',
    html: `
      <div style="text-align:left; font-size:13px; color:#475569;">

        <p style="margin-bottom:16px;">
          Cliente:
          <strong style="color:#0f172a;">
            ${cliente.Nombre || cliente.Razon_social}
          </strong>
        </p>

        <div style="
          background:#eff6ff;
          border:1px solid #bfdbfe;
          border-radius:9px;
          padding:10px 12px;
          margin-bottom:16px;
          color:#1e40af;
          font-size:11px;
        ">
          Selecciona únicamente el mes y el día.
          El sistema calculará automáticamente el siguiente año válido.
        </div>

        <label style="
          display:block;
          margin-bottom:7px;
          color:#94a3b8;
          font-size:11px;
          font-weight:700;
          text-transform:uppercase;
        ">
          Nueva fecha de vencimiento
        </label>

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
        ">

          <div>
            <span style="
              display:block;
              font-size:10px;
              font-weight:700;
              color:#64748b;
              margin-bottom:5px;
            ">
              MES
            </span>

            <select
              id="swal-mes-credito"
              class="swal2-select"
              style="
                width:100%;
                height:44px;
                margin:0;
                font-size:13px;
              ">
              <option value="">Seleccionar...</option>
              ${opcionesMes}
            </select>
          </div>

          <div>
            <span style="
              display:block;
              font-size:10px;
              font-weight:700;
              color:#64748b;
              margin-bottom:5px;
            ">
              DÍA
            </span>

            <select
              id="swal-dia-credito"
              class="swal2-select"
              style="
                width:100%;
                height:44px;
                margin:0;
                font-size:13px;
              ">
              <option value="">Seleccionar...</option>
            </select>
          </div>

        </div>

        <div
          id="swal-fecha-resultado"
          style="
            display:none;
            margin-top:14px;
            background:#ecfdf5;
            border:1px solid #a7f3d0;
            border-radius:8px;
            padding:10px 12px;
            color:#047857;
            font-size:11px;
            font-weight:600;
          ">
        </div>

      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Actualizar vigencia',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#7c3aed',
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    heightAuto: false,

    didOpen: () => {
      const mesSelect =
        document.getElementById('swal-mes-credito') as HTMLSelectElement;

      const diaSelect =
        document.getElementById('swal-dia-credito') as HTMLSelectElement;

      const resultado =
        document.getElementById('swal-fecha-resultado') as HTMLDivElement;

      const mostrarResultado = () => {

        if (!mesSelect.value || !diaSelect.value) {
          resultado.style.display = 'none';
          return;
        }

        const fecha = obtenerProximaFechaValida(
          Number(mesSelect.value),
          Number(diaSelect.value)
        );

        if (!fecha) {
          resultado.style.display = 'none';
          return;
        }

        resultado.style.display = 'block';

        resultado.textContent =
          `Nueva vigencia: ${fecha.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}`;
      };

      const cargarDias = () => {

        const mes = Number(mesSelect.value);
        const diaSeleccionado =
          diaSelect.value || diaActual;

        diaSelect.innerHTML =
          '<option value="">Seleccionar...</option>';

        if (!mes) {
          resultado.style.display = 'none';
          return;
        }

        const diasDelMes =
          mes === 2
            ? 29
            : [4, 6, 9, 11].includes(mes)
              ? 30
              : 31;

        for (let dia = 1; dia <= diasDelMes; dia++) {

          const valor =
            dia.toString().padStart(2, '0');

          const opcion =
            document.createElement('option');

          opcion.value = valor;
          opcion.textContent = valor;

          if (valor === diaSeleccionado) {
            opcion.selected = true;
          }

          diaSelect.appendChild(opcion);
        }

        mostrarResultado();
      };

      mesSelect.addEventListener(
        'change',
        cargarDias
      );

      diaSelect.addEventListener(
        'change',
        mostrarResultado
      );

      if (mesActual) {
        cargarDias();
      }
    },

    preConfirm: () => {
      const mesSelect =
        document.getElementById('swal-mes-credito') as HTMLSelectElement;

      const diaSelect =
        document.getElementById('swal-dia-credito') as HTMLSelectElement;

      const mes = Number(mesSelect.value);
      const dia = Number(diaSelect.value);

      if (!mes || !dia) {
        Swal.showValidationMessage(
          'Debes seleccionar el mes y el día.'
        );

        return false;
      }

      const fecha =
        obtenerProximaFechaValida(mes, dia);

      if (!fecha) {
        Swal.showValidationMessage(
          'La fecha seleccionada no es válida.'
        );

        return false;
      }

      return {
        fecha_vencimiento_credito:
          fechaToISO(fecha)
      };
    }

  }).then(result => {

    if (result.isConfirmed && result.value) {
      return result.value as DatosVigenciaCredito;
    }

    return null;
  });
}