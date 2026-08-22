import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from "@ionic/angular";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toast, NgxSonnerToaster } from 'ngx-sonner';

import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { StepItemComponent } from "../../../shared/components/UI/modal/step-item/step-item.component";
import { CardSelectComponent, CardOption } from "../../../shared/components/UI/modal/card-option/card-option.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { ProveedorService } from '../../../core/services/Proveedores.service';

@Component({
  selector: 'app-confirmar-recepcion',
  templateUrl: './confirmar-recepcion.page.html',
  styleUrls: ['./confirmar-recepcion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    HeaderModalComponent,
    FooterModalComponent,
    ButtonActionComponent,
    StepItemComponent, 
    CardSelectComponent,
    NgxSonnerToaster
  ]
})
export class ConfirmarRecepcionPage implements OnInit {
  paso: number = 1;
  pedido: any;
  productosDetalle: any[] = [];
descripcionGeneral: string = '';
  estadoRecepcion: 'completo' | 'incidencia' | null = null;
  opcionesEstado: CardOption[] = [
    { value: 'completo', titulo: 'Completo y en buen estado', descripcion: 'Todo coincide con la solicitud' },
    { value: 'incidencia', titulo: 'Con incidencias / Dañado', descripcion: 'Faltantes, daños o errores' }
  ];

  opcionesDano = [
    { label: 'Material Roto / Dañado', value: 'roto' },
    { label: 'Piezas Faltantes', value: 'faltante' },
    { label: 'Producto Equivocado', value: 'equivocado' },
    { label: 'Defecto de Fábrica', value: 'defecto' }
  ];
  
  incidencia = {
    piezasAfectadas: null,
    tipoDano: '',
  };

constructor(
    private dialogRef: MatDialogRef<ConfirmarRecepcionPage>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ps: ProveedorService
  ) {
    this.pedido = data?.pedido || {};
    
    this.productosDetalle = (data?.productos || []).map((p: any) => ({
      ...p,
      buenas: p.cantidad, 
      afectadas: 0,     
      tipoDano: '',
      descripcion: ''
    }));
  }
calcularBuenas(item: any) {

    if (item.afectadas !== null && item.afectadas !== '') {
      item.afectadas = parseInt(item.afectadas, 10);
    }

    if (item.afectadas < 0) {
      item.afectadas = 0;
    }
    

    if (item.afectadas > item.cantidad) {
      toast.error(`No puedes registrar más piezas afectadas de las solicitadas (${item.cantidad} pz máx).`);
      item.afectadas = item.cantidad; 
    }
    
    const afectadasReales = item.afectadas || 0;
    item.buenas = item.cantidad - afectadasReales;

    if (afectadasReales === 0) {
      item.tipoDano = '';
    }
  }
  ngOnInit() {}
  get pasosStepper() {
    return [
      { numero: 1, etiqueta: 'Estado' },
      { numero: 2, etiqueta: this.estadoRecepcion === 'incidencia' ? 'Detalle Problema' : 'Resumen Stock' },
      { numero: 3, etiqueta: 'Confirmar' }
    ];
  }

  getTotalPiezas(): number {
    return this.productosDetalle.reduce((total, item) => total + (item.cantidad || 0), 0);
  }

  avanzarPaso() {
    if (this.paso === 1 && !this.estadoRecepcion) {
      toast.error('Selecciona el estado en el que llegó el pedido');
      return;
    }
    
    if (this.paso === 2 && this.estadoRecepcion === 'incidencia') {
      const hayAfectados = this.productosDetalle.some(p => p.afectadas > 0);
      if (!hayAfectados) {
        toast.error('Debes reportar al menos una pieza dañada, o regresar y marcar el pedido como "Completo".');
        return;
      }

      const incompletos = this.productosDetalle.some(p => p.afectadas > 0 && !p.tipoDano);
      if (incompletos) {
        toast.error('Por favor, selecciona el tipo de incidencia para los productos afectados.');
        return;
      }

      if (!this.descripcionGeneral || this.descripcionGeneral.trim() === '') {
        toast.error('Por favor, agrega una descripción general del incidente.');
        return;
      }
    }
    this.paso++;
  }

  retrocederPaso() {
    this.paso--;
  }

  cerrar() {
    this.dialogRef.close();
  }

confirmarRecepcion() {
    const usuarioString = localStorage.getItem('user');
    const idAsesor = usuarioString ? JSON.parse(usuarioString).id : null;
    const idPedido = this.pedido.id_pedido;

    if (this.estadoRecepcion === 'completo') {
      this.ps.recibirPedido(idPedido, idAsesor).subscribe({
        next: (res) => {
          this.paso = 3; 
          toast.success('Recepción confirmada correctamente');
        },
        error: (err) => { console.error(err); toast.error('Error al confirmar el pedido'); }
      });

    } else if (this.estadoRecepcion === 'incidencia') {
      
      const descLimpia = (this.descripcionGeneral || '').toString().trim();
      if (!descLimpia) {
        toast.error('Debes ingresar una descripción detallada de la incidencia.');
        return;
      }
      this.descripcionGeneral = descLimpia;

      let totalAfectadasPedido = 0;

      for (let i = 0; i < this.productosDetalle.length; i++) {
        const p = this.productosDetalle[i];

        const buenasNum = Number(p.buenas || 0);
        if (isNaN(buenasNum) || !Number.isInteger(buenasNum) || buenasNum < 0) {
          toast.error(`Error en la fila ${i + 1}: Las piezas buenas deben ser un número entero (0 o mayor).`);
          return;
        }
        p.buenas = buenasNum; 

        const afectadasNum = Number(p.afectadas || 0);
        if (isNaN(afectadasNum) || !Number.isInteger(afectadasNum) || afectadasNum < 0) {
          toast.error(`Error en la fila ${i + 1}: Las piezas afectadas deben ser un número entero (0 o mayor).`);
          return;
        }
        p.afectadas = afectadasNum; 

        totalAfectadasPedido += afectadasNum;

        if (afectadasNum > 0) {
          if (!p.tipoDano || p.tipoDano.toString().trim() === '') {
            toast.error(`Falta seleccionar el "Tipo de Daño" para el producto de la fila ${i + 1}.`);
            return;
          }
        }
      }


      if (totalAfectadasPedido <= 0) {
        toast.error('Para reportar una incidencia, al menos un producto debe tener 1 o más piezas afectadas.');
        return;
      }

      const productosIncidencia = this.productosDetalle.map(p => ({
        id_producto: p.id_producto,
        cantidad_buena: p.buenas,                
        cantidad_afectada: p.afectadas,          
        Tipo: p.tipoDano ? p.tipoDano.toString().trim() : null,                    
        Descripcion: p.afectadas > 0 ? this.descripcionGeneral : null 
      }));

      this.ps.recibirPedidoIncidencia(idPedido, idAsesor, productosIncidencia).subscribe({
        next: (res) => {
          this.paso = 3; 
          toast.success('Incidencias registradas correctamente');
        },
        error: (err) => { 
          console.error(err); 
          toast.error('Error al registrar las incidencias'); 
        }
      });
    }
  }

  finalizar() {
    this.dialogRef.close(true);
  }
}