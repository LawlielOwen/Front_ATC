import Swal from 'sweetalert2';
import { Ubicacion } from '../model/productos.model';

export type TipoUbicacionAlert = 'estanteria' | 'caja';

export interface DatosUbicacion {
  codigo: string;
  descripcion: string | null;
}

export function mostrarAgregarUbicacion(
  tipo: TipoUbicacionAlert
): Promise<DatosUbicacion | null> {

  const esEstanteria = tipo === 'estanteria';
  const titulo = esEstanteria ? 'Agregar Estantería' : 'Agregar Caja';
  const color = esEstanteria ? '#1d4ed8' : '#1D9E75';
  const placeholder = esEstanteria ? 'Ej. 31' : 'Ej. B';

  return Swal.fire({
    title: titulo,
    html: `
      <div style="text-align:left; font-size:13px; color:#475569;">

        <p style="margin-bottom:16px; color:#64748b; font-weight:600;">
          Registra una nueva ${esEstanteria ? 'estantería' : 'caja'} para utilizarla como ubicación de productos.
        </p>

        <label
          for="swal-codigo"
          style="
            display:block;
            margin-bottom:5px;
            font-size:11px;
            font-weight:700;
            text-transform:uppercase;
            color:#94a3b8;
          ">
          Código *
        </label>

        <input
          id="swal-codigo"
          type="text"
          maxlength="20"
          placeholder="${placeholder}"
          class="swal2-input"
          style="
            width:100%;
            margin:0 0 16px 0;
          ">

        <label
          for="swal-descripcion"
          style="
            display:block;
            margin-bottom:5px;
            font-size:11px;
            font-weight:700;
            text-transform:uppercase;
            color:#94a3b8;
          ">
          Descripción
        </label>

        <textarea
          id="swal-descripcion"
          maxlength="100"
          placeholder="Descripción opcional de la ubicación"
          class="swal2-textarea"
          style="
            width:100%;
            margin:0;
            min-height:85px;
            resize:none;
          ">
        </textarea>

      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: color,
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    focusConfirm: false,
    heightAuto: false,

    didOpen: () => {
      const codigoInput =
        document.getElementById('swal-codigo') as HTMLInputElement;

      codigoInput?.focus();
    },

    preConfirm: () => {
      const codigoInput =
        document.getElementById('swal-codigo') as HTMLInputElement;

      const descripcionInput =
        document.getElementById('swal-descripcion') as HTMLTextAreaElement;

      let codigo = codigoInput.value.trim();
      const descripcion = descripcionInput.value.trim();

      if (!codigo) {
        Swal.showValidationMessage(
          `Debes ingresar el código de la ${esEstanteria ? 'estantería' : 'caja'}.`
        );
        return false;
      }

      if (codigo.length > 20) {
        Swal.showValidationMessage(
          'El código no puede superar los 20 caracteres.'
        );
        return false;
      }

      if (descripcion.length > 100) {
        Swal.showValidationMessage(
          'La descripción no puede superar los 100 caracteres.'
        );
        return false;
      }

      if (!esEstanteria) {
        codigo = codigo.toUpperCase();
      }

      return {
        codigo,
        descripcion: descripcion || null
      };
    }
  }).then(result => {
    if (result.isConfirmed && result.value) {
      return result.value as DatosUbicacion;
    }

    return null;
  });
}

export function confirmarDesactivarUbicacion(
  tipo: TipoUbicacionAlert,
  ubicacion: Ubicacion
): Promise<boolean> {

  const nombre =
    tipo === 'estanteria'
      ? 'estantería'
      : 'caja';

  return Swal.fire({
    icon: 'warning',
    title: `Dar de baja ${nombre}`,
    html: `
      <div style="font-size:13px; color:#475569;">
        <p>
          ¿Deseas dar de baja la ${nombre}
          <strong style="color:#0f172a;">
            ${ubicacion.codigo}
          </strong>?
        </p>

        <p style="
          margin-top:10px;
          font-size:12px;
          color:#64748b;
        ">
          Los productos que ya tienen esta ubicación conservarán su relación,
          pero dejará de aparecer como opción para nuevos productos.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Dar de baja',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    heightAuto: false
  }).then(result => result.isConfirmed);
}

export function confirmarReactivarUbicacion(
  tipo: TipoUbicacionAlert,
  ubicacion: Ubicacion
): Promise<boolean> {

  const nombre =
    tipo === 'estanteria'
      ? 'estantería'
      : 'caja';

  const color =
    tipo === 'estanteria'
      ? '#1d4ed8'
      : '#1D9E75';

  return Swal.fire({
    icon: 'question',
    title: `Reactivar ${nombre}`,
    html: `
      <div style="font-size:13px; color:#475569;">
        <p>
          ¿Deseas reactivar la ${nombre}
          <strong style="color:#0f172a;">
            ${ubicacion.codigo}
          </strong>?
        </p>

        <p style="
          margin-top:10px;
          font-size:12px;
          color:#64748b;
        ">
          Volverá a estar disponible para asignarla a productos.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Reactivar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: color,
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
    heightAuto: false
  }).then(result => result.isConfirmed);
}