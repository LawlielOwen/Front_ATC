import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toast, NgxSonnerToaster } from 'ngx-sonner';

import { FooterModalComponent } from '../../../shared/components/UI/modal/footer-modal/footer-modal.component';
import { HeaderModalComponent } from '../../../shared/components/UI/modal/header-modal/header-modal.component';
import { ButtonActionComponent } from '../../../shared/components/UI/buttons/button-action/button-action.component';
import { CardDetailsComponent } from '../../../shared/components/UI/modal/card-details/card-details.component';

import { VisitaService } from '../../../core/services/Visitas.service';
import { confirmarCompletarVisita } from '../../../shared/utils/visita-alerts.util';

interface DivisionRetorno {
  cantidad: number | null;
  estatus_retorno: string;
}

interface EquipoRetorno {
  id: number;
  nombre_modelo: string;
  numero_serie?: string;

  id_detalle?: number;
  piezas: number;                 
  divisiones: DivisionRetorno[];  
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
    NgxSonnerToaster,
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
      this.equipos = (detalles || []).map(d => {
        const totalPiezas = d.cantidad || d.piezas || 1;
        return {
          ...d,
          piezas: totalPiezas,
          divisiones: [{ cantidad: totalPiezas, estatus_retorno: this.opcionesEstatusRetorno[0] }]
        };
      });
      this.cargandoDetalles = false;
    },
    error: (err) => {
      console.error('Error al cargar equipos de la visita:', err);
      toast.error('No se pudieron cargar los equipos asociados a esta visita');
      this.cargandoDetalles = false;
    }
  });
}

totalAsignado(equipo: EquipoRetorno): number {
  return equipo.divisiones.reduce((sum, d) => sum + (Number(d.cantidad) || 0), 0);
}

faltantePorAsignar(equipo: EquipoRetorno): number {
  return equipo.piezas - this.totalAsignado(equipo);
}

agregarDivision(equipo: EquipoRetorno) {
  const faltante = this.faltantePorAsignar(equipo);
  if (faltante <= 0) {
    toast.warning('Ya asignaste todas las piezas de este equipo');
    return;
  }
  equipo.divisiones.push({ cantidad: faltante, estatus_retorno: this.opcionesEstatusRetorno[0] });
}

eliminarDivision(equipo: EquipoRetorno, index: number) {
  if (equipo.divisiones.length === 1) return; 
  equipo.divisiones.splice(index, 1);
}

formularioValido(): boolean {
  if (this.resumenActividades.trim().length === 0) return false;
  return this.equipos.every(e => this.totalAsignado(e) === e.piezas);
}
async guardar() {
  if (this.resumenActividades.trim().length === 0) {
    toast.error('El resumen de actividades es obligatorio');
    return;
  }
  const equipoIncompleto = this.equipos.find(e => this.totalAsignado(e) !== e.piezas);
  if (equipoIncompleto) {
    toast.error(`Faltan piezas por asignar en "${equipoIncompleto.nombre_modelo}" (${this.faltantePorAsignar(equipoIncompleto)} de ${equipoIncompleto.piezas})`);
    return;
  }

  const confirmado = await confirmarCompletarVisita(this.visita.empresa_destino);
  if (!confirmado) return;

  this.guardando = true;

  const retornos = this.equipos.flatMap(e =>
    e.divisiones.map(div => ({
      id_detalle: e.id || e.id_detalle,
      estatus_retorno: div.estatus_retorno,
      cantidad: div.cantidad
    }))
  );

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
onCantidadChange(equipo: EquipoRetorno, div: DivisionRetorno, valor: any) {
  let limpio = String(valor).replace(/[^0-9]/g, '');

  if (limpio === '') {
    div.cantidad = null; 
    return;
  }

  let num = Number(limpio);

  const otras = equipo.divisiones
    .filter(d => d !== div)
    .reduce((sum, d) => sum + (Number(d.cantidad) || 0), 0);

  const maxPermitido = equipo.piezas - otras;

  if (num > maxPermitido) {
    num = maxPermitido;
    toast.warning(`No puedes asignar más de ${equipo.piezas} pieza(s) para "${equipo.nombre_modelo}"`);
  }

  div.cantidad = num;
}
}