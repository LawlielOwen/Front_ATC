import Swal from 'sweetalert2';

export function mostrarGenerandoExcel() {
  return Swal.fire({
    width: 620,
    padding: '30px 32px',
    html: `
      <div style="text-align:center;">

        <div style="
          width:60px;
          height:60px;
          margin:0 auto 18px auto;
          border-radius:15px;
          background:#ecfdf5;
          display:flex;
          align-items:center;
          justify-content:center;
        ">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#059669"
            stroke-width="2">
            
            <path d="M4 3h12l4 4v14H4z"/>
            <path d="M16 3v5h5"/>
            <path d="M8 12l2 3-2 3"/>
            <path d="M14 12l-2 3 2 3"/>
          </svg>
        </div>

        <div style="
          font-size:20px;
          font-weight:700;
          color:#0f172a;
          margin-bottom:8px;
        ">
          Generando reporte
        </div>

        <div style="
          font-size:14px;
          color:#64748b;
          margin-bottom:20px;
        ">
          Estamos preparando el archivo de inventario.
        </div>

        <div
          id="excel-loader"
          style="
            width:42px;
            height:42px;
            margin:auto;
            border:4px solid #d1fae5;
            border-top-color:#059669;
            border-radius:50%;
            animation:excelSpin .7s linear infinite;
          ">
        </div>

        <style>
          @keyframes excelSpin {
            to {
              transform: rotate(360deg);
            }
          }
        </style>

        <div style="
          margin-top:18px;
          font-size:12px;
          color:#94a3b8;
        ">
          Esto puede tardar unos segundos
        </div>

      </div>
    `,
    showConfirmButton: false,
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    heightAuto: false
  });
}

export function cerrarGenerandoExcel() {
  Swal.close();
}

export function mostrarErrorExcel(
  mensaje: string = 'No se pudo generar el reporte de inventario.'
) {
  return Swal.fire({
    width: 520,
    icon: 'error',
    title: 'No se pudo generar',
    text: mensaje,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#003B8A',
    heightAuto: false
  });
}