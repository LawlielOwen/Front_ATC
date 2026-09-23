import { Component, OnInit, Inject} from '@angular/core';
import {EstatusComponent} from '../../../shared/components/UI/estatus/estatus.component';
import {IonicModule} from "@ionic/angular";
import { CommonModule } from '@angular/common';
import { Cliente, MovimientoCredito, ClienteConstancia, ClienteContacto } from '../../../shared/model/clientes.model';
import { ClientesService } from "../../../core/services/clientes.service";
import { toast, NgxSonnerToaster  } from 'ngx-sonner';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {FooterModalComponent} from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import {ButtonActionComponent} from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { RegimenFiscalPipe } from "./regimen-fiscal-pipe";
import { MatDialog } from '@angular/material/dialog';
import { ModalClientePage } from "../modal-cliente/modal-cliente.page";
import {CardDetailsComponent} from "../../../shared/components/UI/modal/card-details/card-details.component";
import { AuthService } from '../../../core/services/auth.service';
import { mostrarAsignarCredito, mostrarExitoCredito, mostrarActualizarCodigo, mostrarActualizarVigencia } from '../../../shared/utils/cliente-alerts.util';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalles-cliente',
  templateUrl: './detalles-cliente.page.html',
  styleUrls: ['./detalles-cliente.page.scss'],
  standalone: true,
  imports: [EstatusComponent, IonicModule, CommonModule,
     FooterModalComponent, ButtonActionComponent,RegimenFiscalPipe,
    CardDetailsComponent,NgxSonnerToaster]

})
export class DetallesClientePage implements OnInit {
Number = Number;
  private necesitaRecargarLista = false;
movimientosCredito: MovimientoCredito[] = [];
mostrarMovimientosCredito: boolean = false;
cargandoMovimientosCredito: boolean = false;
copiado: 'codigo' | 'rfc' | null = null;

constructor(
    private dialogRef: MatDialogRef<DetallesClientePage>,
    
    @Inject(MAT_DIALOG_DATA) public cliente: Cliente,
    private clientesService: ClientesService, public dialog: MatDialog,public authService: AuthService
  ) { }

  ngOnInit() {
  }
cerrarDetalle() {
    this.dialogRef.close(this.necesitaRecargarLista);
  }
  copiar(valor: string, tipo: 'codigo' | 'rfc') {
  navigator.clipboard.writeText(valor).then(() => {
    this.copiado = tipo;
    setTimeout(() => (this.copiado = null), 1500);
  });
}
eliminarCliente(id: number) {
    this.clientesService.deleteCliente(id).subscribe({
      next: (response: any) => {
        this.dialogRef.close(true);
        toast.success('Cliente eliminado correctamente');
      }
    });
  }
activarCliente(id: number) {
    this.clientesService.activateCliente(id).subscribe({
      next: (response: any) => {
        this.dialogRef.close(true);
        toast.success('Cliente activado correctamente');
      }
    });
  }
  procesarFuncion(){
    if(this.cliente.Estatus === 1){
      this.eliminarCliente(this.cliente.id);
    } else{
      this.activarCliente(this.cliente.id);
    }
  }
esVencido(fecha: string | null): boolean {
  if (!fecha) return true; 
  return new Date(fecha) < new Date(new Date().toDateString()); 
}
asignarCredito(cliente: Cliente) {
  mostrarAsignarCredito(cliente).then((datos) => {
    if (!datos) return;

    this.clientesService.asignarCredito(
      cliente.id,
      datos.tiene_credito,
      datos.limite_credito,
      datos.fecha_vencimiento
    ).subscribe({
      next: (res: any) => {
        this.recargarCliente();

        mostrarExitoCredito(
          res.mensaje ||
          'La línea de crédito se actualizó correctamente.'
        );
      },

      error: (err) => {
        const mensajeError =
          err.error?.error ||
          'No se pudo actualizar la línea de crédito.';

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensajeError,
          confirmButtonColor: '#003B8A',
          heightAuto: false
        });
      }
    });
  });
}

get contactosCliente(): ClienteContacto[] {
  if (Array.isArray(this.cliente.contactos) && this.cliente.contactos.length > 0) {
    return this.cliente.contactos;
  }

  if (
    this.cliente.nombre_contacto ||
    this.cliente.contacto_principal ||
    this.cliente.correo_contacto
  ) {
    return [{
      nombre: this.cliente.nombre_contacto || null,
      telefono: this.cliente.contacto_principal || null,
      correo: this.cliente.correo_contacto || null,
      puesto: null,
      es_principal: 1
    }];
  }

  return [];
}

get constanciasCliente(): ClienteConstancia[] {
  if (Array.isArray(this.cliente.constancias) && this.cliente.constancias.length > 0) {
    return this.cliente.constancias;
  }

  if (this.cliente.ruta_constancia) {
    return [{
      nombre: this.cliente.nombre_constancia || 'Constancia de Situación Fiscal',
      ruta: this.cliente.ruta_constancia,
      fecha: this.cliente.fecha_constancia || null,
      es_principal: 1
    }];
  }

  return [];
}

inicialesContacto(nombre?: string | null): string {
  if (!nombre || nombre.trim() === '') return '??';

  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase();
  }

  return (
    partes[0].charAt(0) +
    partes[1].charAt(0)
  ).toUpperCase();
}

descargarConstancia(constancia: ClienteConstancia) {
  if (!constancia.ruta) {
    toast.error('No se encontró la ruta de la constancia.');
    return;
  }

  const url = this.clientesService.obtenerUrlArchivo(constancia.ruta);
  const link = document.createElement('a');

  link.href = url;
  link.target = '_blank';
  link.download = constancia.nombre || 'constancia.pdf';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

descargarPDF() {
  const principal =
    this.constanciasCliente.find(c => Number(c.es_principal) === 1) ||
    this.constanciasCliente[0];

  if (principal) {
    this.descargarConstancia(principal);
  }
}
  truncarNombre(nombre: string, maxChars: number = 30): string {
    if (!nombre || nombre.length <= maxChars) return nombre;
    const ext = nombre.lastIndexOf('.');
    const extension = ext !== -1 ? nombre.substring(ext) : '';
    return nombre.substring(0, maxChars - extension.length) + '…' + extension;
}
abrirModalEdicion(clienteAEditar: any) {
  this.clientesService.getCliente(clienteAEditar.id).subscribe({
    next: (clienteCompleto: any) => {
      const dialogRef = this.dialog.open(ModalClientePage, {
        width: '630px',
        maxWidth: '105vw',
        backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
        panelClass: [],
        data: clienteCompleto
      });

      dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
        if (necesitaRecargar) {
          this.dialogRef.close(true);
        }
      });
    },
    error: () => {
      toast.error('No se pudo cargar el detalle del cliente');
    }
  });
}
abrirModalActualizarCsf(cliente: any) {
    const dialogRef = this.dialog.open(ModalClientePage, {
      data: {
        modo: 'updateCsf',
        width: '630px',
        maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
        cliente: cliente
      }
    });

  dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.dialogRef.close(true);
      }
    });
  }
  obtenerAsesores(nombresString: string | undefined): string[] {
    if (!nombresString) return ['Sin asignar'];
    return nombresString.split(' | ');
  }
  calcularDiasCredito(fecha: string | null): string {
    if (!fecha) return 'Sin fecha definida';

    const hoy = new Date(new Date().toDateString());
    const fechaLimite = new Date(fecha);
    fechaLimite.setHours(0, 0, 0, 0);

    const diffMs = fechaLimite.getTime() - hoy.getTime();
    const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias < 0) {
        return `Vencido hace ${this.formatearDias(Math.abs(diffDias))}`;
    }

    if (diffDias === 0) return 'Vence hoy';

    return `Vigente por ${this.formatearDias(diffDias)}`;
}

private formatearDias(totalDias: number): string {
    const meses = Math.floor(totalDias / 30);
    const dias = totalDias % 30;

    if (meses === 0) {
        return `${dias} día${dias !== 1 ? 's' : ''}`;
    }

    if (dias === 0) {
        return `${meses} mes${meses !== 1 ? 'es' : ''}`;
    }

    return `${meses} mes${meses !== 1 ? 'es' : ''} con ${dias} día${dias !== 1 ? 's' : ''}`;
}
recargarCliente() {
  this.clientesService.getCliente(this.cliente.id).subscribe({
    next: (clienteActualizado: Cliente) => {
      this.cliente = clienteActualizado;
      this.necesitaRecargarLista = true;
    },
    error: (err) => {
      console.error('Error al actualizar datos del cliente', err);
    }
  });
}

toggleMovimientosCredito() {
  this.mostrarMovimientosCredito = !this.mostrarMovimientosCredito;

  if (this.mostrarMovimientosCredito) {
    this.cargarMovimientosCredito();
  }
}

cargarMovimientosCredito() {
  this.cargandoMovimientosCredito = true;

  this.clientesService.obtenerMovimientosCredito(this.cliente.id).subscribe({
    next: (res) => {
      this.movimientosCredito = res.movimientos || [];
      this.cargandoMovimientosCredito = false;
    },
    error: (err) => {
      console.error(err);
      this.cargandoMovimientosCredito = false;
      toast.error('No se pudo cargar el historial de crédito');
    }
  });
}
registrarPagoCredito() {
  const utilizado = Number(this.cliente.credito_utilizado || 0);

  if (utilizado <= 0) {
    toast.info('El cliente no tiene crédito pendiente por pagar');
    return;
  }

  Swal.fire({
    title: 'Registrar pago',
    html: `
      <div style="text-align:left;">
        <p style="font-size:13px; color:#64748b; margin-bottom:14px;">
          Saldo pendiente:
          <strong style="color:#0d1f38;">
            $${utilizado.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </strong>
        </p>

        <label style="font-size:12px; font-weight:600;">
          Monto pagado *
        </label>

        <input
          id="pago-monto"
          type="number"
          min="0.01"
          step="0.01"
          class="swal2-input"
          placeholder="Ej. 3000.00"
          style="width:100%; margin:6px 0 14px 0;"
        >

        <label style="font-size:12px; font-weight:600;">
          Referencia
        </label>

        <input
          id="pago-referencia"
          type="text"
          class="swal2-input"
          placeholder="Ej. Transferencia 45872"
          style="width:100%; margin:6px 0 14px 0;"
        >

        <label style="font-size:12px; font-weight:600;">
          Observaciones
        </label>

        <textarea
          id="pago-observaciones"
          class="swal2-textarea"
          placeholder="Observaciones del pago"
          style="width:100%; margin:6px 0 0 0;"
        ></textarea>
      </div>
    `,

    showCancelButton: true,
    confirmButtonText: 'Registrar pago',
    cancelButtonText: 'Cancelar',

    confirmButtonColor: '#003B8A',
    cancelButtonColor: '#64748b',

    heightAuto: false,

    preConfirm: () => {
      const montoInput =
        document.getElementById('pago-monto') as HTMLInputElement;

      const referenciaInput =
        document.getElementById('pago-referencia') as HTMLInputElement;

      const observacionesInput =
        document.getElementById('pago-observaciones') as HTMLTextAreaElement;

      const monto = Number(montoInput.value);

      if (isNaN(monto) || monto <= 0) {
        Swal.showValidationMessage(
          'Ingresa un monto mayor a $0'
        );
        return false;
      }

      if (monto > utilizado) {
        Swal.showValidationMessage(
          `El pago no puede ser mayor al saldo pendiente de $${utilizado.toFixed(2)}`
        );
        return false;
      }

      return {
        monto,
        referencia: referenciaInput.value.trim(),
        observaciones: observacionesInput.value.trim()
      };
    }
  }).then((resultado) => {

    if (!resultado.isConfirmed || !resultado.value) {
      return;
    }

    const pago = resultado.value;

    this.clientesService.registrarPagoCredito(
      this.cliente.id,
      pago.monto,
      pago.referencia || null,
      pago.observaciones || null
    ).subscribe({

      next: (res) => {
        toast.success(
          res.mensaje || 'Pago registrado correctamente'
        );

        this.recargarCliente();

        if (this.mostrarMovimientosCredito) {
          this.cargarMovimientosCredito();
        }
      },

      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo registrar',
          text:
            err.error?.error ||
            'No se pudo registrar el pago.',
          confirmButtonColor: '#003B8A',
          heightAuto: false
        });
      }
    });
  });
}
porcentajeUso(cliente: any): number {
  if (!cliente.limite_credito || cliente.limite_credito === 0) return 0;
  const usado = cliente.credito_utilizado || 0;
  return Math.min(100, Math.round((usado / cliente.limite_credito) * 100));
}

nivelUso(cliente: any): 'ok' | 'medio' | 'alto' {
  const pct = this.porcentajeUso(cliente);
  if (pct >= 90) return 'alto';
  if (pct >= 60) return 'medio';
  return 'ok';
}
actualizarCodigoCliente() {

  mostrarActualizarCodigo(
    this.cliente
  ).then((datos) => {

    if (!datos) return;

    this.clientesService.actualizarCodigoCliente(
      this.cliente.id,
      datos.codigo_cliente
    ).subscribe({

      next: (res) => {

        toast.success(
          res.mensaje ||
          'Código actualizado correctamente'
        );

        this.recargarCliente();
      },

      error: (err) => {

        Swal.fire({
          icon: 'error',
          title: 'No se pudo actualizar',
          text:
            err.error?.error ||
            'No se pudo actualizar el código del cliente.',
          confirmButtonColor: '#003B8A',
          heightAuto: false
        });
      }
    });
  });
}
actualizarVigenciaCredito() {

  if (this.cliente.tiene_credito !== 1) {

    Swal.fire({
      icon: 'info',
      title: 'Sin línea de crédito',
      text: 'Este cliente todavía no tiene una línea de crédito activa. Primero debes asignarle crédito.',
      confirmButtonColor: '#003B8A',
      heightAuto: false
    });

    return;
  }

  mostrarActualizarVigencia(
    this.cliente
  ).then((datos) => {

    if (!datos) return;

    this.clientesService.actualizarVigenciaCredito(
      this.cliente.id,
      datos.fecha_vencimiento_credito
    ).subscribe({

      next: (res) => {

        toast.success(
          res.mensaje ||
          'Vigencia actualizada correctamente'
        );

        this.recargarCliente();
      },

      error: (err) => {

        Swal.fire({
          icon: 'error',
          title: 'No se pudo actualizar',
          text:
            err.error?.error ||
            'No se pudo actualizar la vigencia del crédito.',
          confirmButtonColor: '#003B8A',
          heightAuto: false
        });
      }
    });
  });
}
}