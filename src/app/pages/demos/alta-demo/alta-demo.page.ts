import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from "@ionic/angular";
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { toast, NgxSonnerToaster } from 'ngx-sonner';

import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { StepItemComponent } from "../../../shared/components/UI/modal/step-item/step-item.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";

// Importa el servicio de Demos (Ajusta la ruta según tu proyecto)
import { DemoService } from '../../../core/services/Demos.service';

@Component({
  selector: 'app-alta-demo',
  templateUrl: './alta-demo.page.html',
  styleUrls: ['./alta-demo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatOptionModule,
    HeaderModalComponent,
    FooterModalComponent,
    StepItemComponent,
    ButtonActionComponent,
    NgxSonnerToaster
  ]
})
export class AltaDemoPage implements OnInit {
  demoEncontrado: any = null;
  paso: number = 1;
  cantidad: number = 0;
  guardando: boolean = false;
  
  demoControl = new FormControl<any>('');
  demosFiltrados: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<AltaDemoPage>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private demoService: DemoService
  ) {}

  ngOnInit() {
    this.demoControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(termino => {
        if (!termino || typeof termino !== 'string' || termino.trim().length < 2) {
          this.demosFiltrados = [];
          return of(null);
        }
        return this.demoService.buscarDemosParaVisita(termino.trim());
      })
    ).subscribe({
      next: (res: any) => {
        if (res) {
          this.demosFiltrados = res || [];
        }
      },
      error: (err) => {
        console.error('Error al buscar equipos demo:', err);
        this.demosFiltrados = [];
      }
    });
  }

  seleccionarDemo(demo: any) {
    this.demoEncontrado = demo;
    this.demoControl.setValue('', { emitEvent: false });
    this.demosFiltrados = [];
  }

  onEnterDemo(event: any) {
    const termino = event.target.value?.trim();
    if (!termino) return;

    if (this.demosFiltrados.length === 1) {
      this.seleccionarDemo(this.demosFiltrados[0]);
    } else if (this.demosFiltrados.length > 1) {
      toast.info('Selecciona un equipo demo de la lista desplegada.');
    }
  }

  get nuevoStock() {
    return (this.demoEncontrado?.stock || 0) + this.cantidad;
  }

  avanzarPaso() {
    this.paso = 2;
  }

  retrocederPaso() {
    this.paso = 1;
    this.cantidad = 1;
  }

  cerrar() {
    this.dialogRef.close();
  }

  confirmarMovimiento() {
    const cantidadNumerica = Number(this.cantidad);

    if (isNaN(cantidadNumerica) || !Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
      toast.error('La cantidad debe ser un número entero mayor a 0.');
      return;
    }

    this.cantidad = cantidadNumerica;

    const codigo = this.demoEncontrado.numero_serie || this.demoEncontrado.nombre_modelo;

    let idAsesor = null;
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        idAsesor = payload.id;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }

    if (!idAsesor) {
      toast.error('Error de sesión: Es obligatorio registrar un responsable.');
      return;
    }

    this.guardando = true;

    this.demoService.registrarEntradaDemo(codigo, this.cantidad, idAsesor).subscribe({
      next: () => {
        this.paso = 3;
        toast.success('¡Entrada de Demo registrada correctamente!');
        this.guardando = false;
      },
      error: (err) => { 
        console.error(err); 
        toast.error(err.error?.error || 'Error al registrar la entrada del equipo demo');
        this.guardando = false;
      }
    });
  }

  finalizar() {
    this.dialogRef.close(true);
  }
}