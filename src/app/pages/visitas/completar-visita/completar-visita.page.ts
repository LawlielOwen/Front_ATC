import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toast } from 'ngx-sonner';

import { FooterModalComponent } from '../../../shared/components/UI/modal/footer-modal/footer-modal.component';
import { HeaderModalComponent } from '../../../shared/components/UI/modal/header-modal/header-modal.component';
import { ButtonActionComponent } from '../../../shared/components/UI/buttons/button-action/button-action.component';
import { CardDetailsComponent } from '../../../shared/components/UI/modal/card-details/card-details.component';

import { VisitaService } from '../../../core/services/Visitas.service';
import { confirmarCompletarVisita } from '../../../shared/utils/visita-alerts.util';

interface EquipoRetorno {
  id: number;
  nombre_modelo: string;
  numero_serie?: string;
  estatus_retorno: string;
  
  id_detalle?: number;
  cantidad?: number;
  piezas?: number;
}

@Component({
  selector: 'app-completar-visita',
  templateUrl: './completar-visita.page.html',
  styleUrls: ['./completar-visita.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    FooterModalComponent,
    HeaderModalComponent,
    ButtonActionComponent,
    CardDetailsComponent
  ]
})
export class CompletarVisitaPage implements OnInit {

  visita: any;
  resumenActividades: string = '';
  equipos: EquipoRetorno[] = [];
  cargandoDetalles: boolean = true;
  guardando: boolean = false;

  opcionesEstatusRetorno: string[] = [
    'Regresó a oficina',
    'Se quedó a prueba',
    'Cliente lo compró',
    'Dañado / En reparación'
  ];

  constructor(
    public dialogRef: MatDialogRef<CompletarVisitaPage>,
    @Inject(MAT_DIALOG_DATA) public data: { visita: any },
    private vs: VisitaService
  ) {
    this.visita = data.visita;
  }

  ngOnInit() {
    this.cargarDetalles();
  }

  cargarDetalles() {
    this.cargandoDetalles = true;
    this.vs.obtenerDetallesVisita(this.visita.id_visita).subscribe({
      next: (detalles: any[]) => {
        this.equipos = (detalles || []).map(d => ({
          ...d,
          estatus_retorno: this.opcionesEstatusRetorno[0]
        }));
        this.cargandoDetalles = false;
      },
      error: (err) => {
        console.error('Error al cargar equipos de la visita:', err);
        toast.error('No se pudieron cargar los equipos asociados a esta visita');
        this.cargandoDetalles = false;
      }
    });
  }

  formularioValido(): boolean {
    return this.resumenActividades.trim().length > 0;
  }

async guardar() {
    if (!this.formularioValido()) {
      toast.error('El resumen de actividades es obligatorio');
      return;
    }

    const confirmado = await confirmarCompletarVisita(this.visita.empresa_destino);
    if (!confirmado) return;

    this.guardando = true;

    const retornos = this.equipos.map(e => ({
      id_detalle: e.id || e.id_detalle, 
      estatus_retorno: e.estatus_retorno,
      cantidad: e.cantidad || e.piezas 
    }));

    this.vs.completarVisita(this.visita.id_visita, this.resumenActividades.trim(), retornos).subscribe({
      next: () => {
        toast.success('Visita completada correctamente');
        this.guardando = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al completar visita:', err);
        toast.error('No se pudo completar la visita');
        this.guardando = false;
      }
    });
  }

  cerrarModal() {
    this.dialogRef.close(false);
  }
}