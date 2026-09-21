import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { ValeService } from "../../../core/services/Vales.service";
import { FormsModule } from '@angular/forms';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import Swal from 'sweetalert2';

export type ModoObservacion = 'producto' | 'general';

@Component({
  selector: 'app-detalles-vale',
  templateUrl: './detalles-vale.page.html',
  styleUrls: ['./detalles-vale.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FooterModalComponent,
    HeaderModalComponent,
    ButtonActionComponent,
    FormsModule,
    NgxSonnerToaster
  ]
})
export class DetallesValePage implements OnInit {

  /** Límites pensados para que el texto quepa en la celda del PDF. Ajústalos a tu plantilla. */
  readonly MAX_OBS_PRODUCTO = 80;
  readonly MAX_COMENTARIO_GENERAL = 200;
  readonly MAX_MOTIVO_RECHAZO = 300;

  private readonly swalBase = { heightAuto: false, scrollbarPadding: false } as const;

  vale: any = null;
  cargandoProductos: boolean = true;
  comentarioResolucion: string = '';
  rolUsuario: string = '';
  modoObservacion: ModoObservacion = 'producto';
  enviando: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<DetallesValePage>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private valeService: ValeService
  ) { }

  ngOnInit() {
    if (this.data && this.data.vale) {
      this.vale = { ...this.data.vale };
      this.cargarProductos(this.vale.id_vale);
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.rolUsuario = payload.Rol || '';
      } catch (error) {
        console.error('Error al decodificar el token en DetallesValePage:', error);
      }
    }
  }

  get puedeEditar(): boolean {
    return this.vale?.estatus === 0 &&
      (this.rolUsuario === 'Administrador' || this.rolUsuario === 'Almacen');
  }

  get totalObsProductos(): number {
    if (!this.vale?.productos) return 0;
    return this.vale.productos.filter((p: any) => (p.observaciones || '').trim()).length;
  }

  get tieneObsProductos(): boolean {
    return this.totalObsProductos > 0;
  }

  get tieneComentarioGeneral(): boolean {
    return !!this.comentarioResolucion?.trim();
  }

  // ───────────────────────── Utilidades de vista ─────────────────────────

  getColorEstatus(estatus: number): string {
    switch (estatus) {
      case 0: return 'bg-orange-100 text-orange-700 border-orange-200';
      case 1: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 2: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-200 text-slate-700 border-slate-200';
    }
  }

  getTextoEstatus(estatus: number): string {
    switch (estatus) {
      case 0: return 'Pendiente';
      case 1: return 'Aceptado';
      case 2: return 'Rechazado';
      default: return 'Desconocido';
    }
  }

  getTotalPiezas(): number {
    if (!this.vale || !this.vale.productos) return 0;
    return this.vale.productos.reduce((total: number, prod: any) => total + (prod.piezas || 0), 0);
  }

  getObservacionLectura(prod: any, index: number): string {
    const propia = (prod.observaciones || '').trim();
    if (propia) return propia;

    if (index === 0 && this.vale?.estatus === 1 && !this.tieneObsProductos && this.vale.comentario) {
      return this.vale.comentario;
    }
    return '';
  }

  cerrar() {
    this.dialogRef.close();
  }

  cargarProductos(id: number) {
    this.cargandoProductos = true;
    this.valeService.getValId(id).subscribe({
      next: (response: any) => {
        this.vale.productos = response.productos || [];
        this.cargandoProductos = false;
      },
      error: (err) => {
        console.error('Error al cargar los productos del vale', err);
        this.vale.productos = [];
        this.cargandoProductos = false;
      }
    });
  }


  async cambiarModo(nuevoModo: ModoObservacion): Promise<void> {
    if (this.modoObservacion === nuevoModo || this.enviando) return;

    const perderiaDatos =
      (nuevoModo === 'general' && this.tieneObsProductos) ||
      (nuevoModo === 'producto' && this.tieneComentarioGeneral);

    if (perderiaDatos) {
      const n = this.totalObsProductos;
      const detalle = nuevoModo === 'general'
        ? `Se borrarán las ${n} observación${n === 1 ? '' : 'es'} que escribiste por producto.`
        : 'Se borrará el comentario general que escribiste.';

      const r = await Swal.fire({
        ...this.swalBase,
        icon: 'warning',
        title: '¿Cambiar de tipo de observación?',
        text: detalle,
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#003B8A',
        reverseButtons: true,
        focusCancel: true
      });
      if (!r.isConfirmed) return;
    }

    // Limpia lo del modo que se abandona para que nunca queden ambos llenos
    if (nuevoModo === 'general') {
      this.vale.productos?.forEach((p: any) => (p.observaciones = ''));
    } else {
      this.comentarioResolucion = '';
    }
    this.modoObservacion = nuevoModo;
  }

  async aceptarVale(): Promise<void> {
    if (this.enviando || !this.puedeEditar) return;

    const esGeneral = this.modoObservacion === 'general';
    const comentarios = esGeneral ? (this.comentarioResolucion || '').trim() : '';
    const tipo = this.vale.tipo_vale ? this.vale.tipo_vale.toString().toLowerCase() : 'indefinido';
    const observacionesDetalles = (this.vale.productos ?? []).map((item: any) => {
    const idPartida = item.id || item.id_detalle || item.id_detalles_vale || item.id_producto;

    if (!idPartida) {
      console.error('¡ATENCIÓN! No se encontró el ID de la partida en este objeto:', item);
    }

    return {
      id: idPartida,
      observaciones: esGeneral ? '' : (item.observaciones || '').trim()
    };
  });
    const confirmacion = await Swal.fire({
      ...this.swalBase,
      icon: 'question',
      title: '¿Aceptar este vale?',
      html: this.construirResumenAceptacion(comentarios),
      showCancelButton: true,
      confirmButtonText: 'Sí, aceptar',
      cancelButtonText: 'Revisar',
      confirmButtonColor: '#1D9E75',
      reverseButtons: true
    });
    if (!confirmacion.isConfirmed) return;

    this.enviando = true;

    if (tipo === 'demostracion' || tipo === 'demo') {
      this.valeService.aceptarValeDemo(this.vale.id_vale, comentarios, this.vale.id_asesor, observacionesDetalles).subscribe({
        next: () => {
          toast.success('Vale de demostración aceptado y equipos descontados.');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.enviando = false;
          toast.error(err.error?.error || 'Error al aceptar el vale de demostración.');
        }
      });
    } else {
      this.valeService.aceptarVal(this.vale.id_vale, comentarios, this.vale.id_asesor, observacionesDetalles).subscribe({
        next: () => {
          toast.success('Vale de salida aceptado exitosamente.');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.enviando = false;
          toast.error(err.error?.error || 'Error al aceptar el vale.');
        }
      });
    }
  }

  async rechazarVale(): Promise<void> {
    if (this.enviando || !this.puedeEditar) return;

    const resultado = await Swal.fire({
      ...this.swalBase,
      icon: 'warning',
      title: `Rechazar vale ${this.vale.folio_vale || ''}`.trim(),
      text: 'Escribe el motivo. Quedará registrado en el vale.',
      input: 'textarea',
      inputLabel: 'Motivo del rechazo',
      inputPlaceholder: 'Ej. Material sin existencia en almacén',
      inputAttributes: {
        maxlength: String(this.MAX_MOTIVO_RECHAZO),
        'aria-label': 'Motivo del rechazo'
      },
      inputValidator: (valor: string) =>
        !valor?.trim() ? 'El motivo es obligatorio para rechazar el vale.' : null,
      showCancelButton: true,
      confirmButtonText: 'Rechazar vale',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      reverseButtons: true
    });
    if (!resultado.isConfirmed) return;

    const motivo = String(resultado.value).trim();
    this.enviando = true;

    this.valeService.rechazarVal(this.vale.id_vale, motivo, this.vale.id_asesor).subscribe({
      next: () => {
        toast.success('Vale rechazado exitosamente');
        this.dialogRef.close(true);
      },
      error: () => {
        this.enviando = false;
        toast.error('Error al rechazar el vale.');
      }
    });
  }

  private construirResumenAceptacion(comentarios: string): string {
    const productos = this.vale.productos?.length || 0;
    const piezas = this.getTotalPiezas();

    let lineaObs: string;
    if (this.modoObservacion === 'general') {
      lineaObs = comentarios
        ? `<b>Comentario general</b> (primera fila del PDF):<br><em>“${this.escapeHtml(comentarios)}”</em>`
        : 'Sin observaciones en el PDF.';
    } else {
      const n = this.totalObsProductos;
      lineaObs = n
        ? `<b>${n}</b> producto${n === 1 ? '' : 's'} con observación propia en el PDF.`
        : 'Sin observaciones en el PDF.';
    }

    return `
      <div style="text-align:left;font-size:14px;line-height:1.6;color:#334155">
        <p style="margin:0 0 6px"><b>${productos}</b> producto${productos === 1 ? '' : 's'} · <b>${piezas}</b> pieza${piezas === 1 ? '' : 's'}</p>
        <p style="margin:0 0 10px">${lineaObs}</p>
        <p style="margin:0;font-size:12px;color:#64748b">Después de aceptarlo ya no podrás editar las observaciones.</p>
      </div>`;
  }

  private escapeHtml(texto: string): string {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  abrirPdfVale(vale: any): void {
    const nombreAsesor = String(vale.nombre_asesor || 'Sin asesor')
      .trim()
      .replace(/\s+/g, ' ');

    const nombreArchivo = `VALE ALMACEN ATC LEON ${nombreAsesor}.pdf`
      .replace(/[\/\\:*?"<>|\u0000-\u001F]/g, '');

    Swal.fire({
      title: 'Generando vale...',
      text: 'Por favor espera un momento',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false,
      scrollbarPadding: false,
      didOpen: () => Swal.showLoading()
    });

    this.valeService.verPdfVale(vale.id_vale).subscribe({
      next: (blob: Blob) => {
        Swal.close();

        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(pdfBlob);
        const enlace = document.createElement('a');

        enlace.href = fileURL;
        enlace.download = nombreArchivo;
        enlace.style.display = 'none';

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
      },
      error: (err: unknown) => {
        console.error('Error descargando el PDF del vale:', err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el PDF del vale.',
          heightAuto: false,
          scrollbarPadding: false
        });
      }
    });
  }
  async asignarFolioCotizacionManual(): Promise<void> {
    if (this.vale.num_cotizacion && this.vale.num_cotizacion !== 'Sin cotización') {
      toast.warning('Este vale ya cuenta con un folio de cotización.');
      return;
    }

    const resultado = await Swal.fire({
      ...this.swalBase,
      icon: 'info',
      title: 'Asignar folio de cotización',
      text: 'Ingresa el número de cotización manual para este vale:',
      input: 'text',
      inputPlaceholder: 'Ej. COT-12345',
      inputAttributes: {
        maxlength: '40',
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar cotización',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#003B8A',
      reverseButtons: true,
      inputValidator: (valor: string) => {
        if (!valor || !valor.trim()) {
          return 'Debes ingresar un folio válido.';
        }
        return null;
      }
    });

    if (resultado.isConfirmed) {
      const folio = String(resultado.value).trim();
      this.enviando = true;

      this.valeService.asignarFolioCotizacion(this.vale.id_vale, folio).subscribe({
        next: (res: any) => {
          this.enviando = false;
          toast.success(res.message || 'Folio de cotización asignado');
          
          // Actualizamos la vista local
          this.vale.num_cotizacion = folio;
        },
        error: (err) => {
          this.enviando = false;
          const mensajeError = err.error?.error || 'Error al asignar el folio de cotización.';
          
          Swal.fire({
            ...this.swalBase,
            icon: 'error',
            title: 'No se pudo asignar',
            text: mensajeError,
            confirmButtonColor: '#003B8A'
          });
        }
      });
    }
  }
  async asignarFolioManual(): Promise<void> {
    // Si el vale ya tiene folio, podemos evitar que lo intente sobreescribir desde el frontend
   
    const resultado = await Swal.fire({
      ...this.swalBase,
      icon: 'info',
      title: 'Asignar folio de cotización',
      text: 'Ingresa el número de folio para asignarlo manualmente a este vale:',
      input: 'text',
      inputPlaceholder: 'Ej. COT-12345',
      inputAttributes: {
        maxlength: '40',
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar folio',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#003B8A',
      reverseButtons: true,
      inputValidator: (valor: string) => {
        if (!valor || !valor.trim()) {
          return 'Debes ingresar un folio válido.';
        }
        return null;
      }
    });

    if (resultado.isConfirmed) {
      const folio = String(resultado.value).trim();
      this.enviando = true;

      this.valeService.asignarFolioManual(this.vale.id_vale, folio).subscribe({
        next: (res: any) => {
          this.enviando = false;
          toast.success(res.message || 'Folio asignado correctamente');
          
          this.vale.folio_vale = folio;
          
          if (!this.vale.num_cotizacion) {
            this.vale.num_cotizacion = folio;
          }
        },
        error: (err) => {
          this.enviando = false;
          const mensajeError = err.error?.error || 'Ocurrió un error al asignar el folio.';
          
          Swal.fire({
            ...this.swalBase,
            icon: 'error',
            title: 'No se pudo asignar',
            text: mensajeError,
            confirmButtonColor: '#003B8A'
          });
        }
      });
    }
  }
}