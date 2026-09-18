import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef } from '@angular/material/dialog';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { Subject, of } from 'rxjs';
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';

import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { CardFormComponent } from "../../../shared/components/UI/form/card-form/card-form.component";
// Ajusta esta ruta al path real de tu componente app-select
import { SelectComponent } from "../../../shared/components/UI/form/select/select.component";

import { AsesoresService } from "../../../core/services/Asesores.service";
import { ValeService } from "../../../core/services/Vales.service";

interface Asesor {
  id: number;
  Nombre_completo: string;
  Rol: string;
  Estatus: number;
}

@Component({
  selector: 'app-folio-vale',
  templateUrl: './folio-vale.page.html',
  styleUrls: ['./folio-vale.page.scss'],
  standalone: true,
  imports: [
    IonicModule, CommonModule, FormsModule, NgxSonnerToaster,
    FooterModalComponent, HeaderModalComponent, ButtonActionComponent,
    CardFormComponent, SelectComponent
  ]
})
export class FolioValePage implements OnInit {
  // ----- Selección de asesor -----
  asesores: Asesor[] = [];
  cargandoAsesores: boolean = true;
  idAsesorSeleccionado: number | '' = '';

  // ----- Folio del asesor seleccionado -----
  cargandoFolioAsesor: boolean = false;
  iniciales: string = '';
  consecutivo: number | null = null;
  folioActualPreview: string = ''; // lo que el asesor ya tiene guardado hoy

  folioPreview: string = 'Selecciona un asesor';
  folioDuplicado: boolean = false;
  verificandoFolio: boolean = false;

  guardando: boolean = false;

  private cambioFolio$ = new Subject<{ iniciales: string; consecutivo: number | null }>();

  constructor(
    private dialogRef: MatDialogRef<FolioValePage>,
    private asesoresService: AsesoresService,
    private valeService: ValeService
  ) {}

  ngOnInit() {
    this.cargarAsesores();

    this.cambioFolio$.pipe(
      debounceTime(400),
      distinctUntilChanged((a, b) => a.iniciales === b.iniciales && a.consecutivo === b.consecutivo),
      switchMap(({ iniciales, consecutivo }) => {
        if (!iniciales?.trim() || !consecutivo || consecutivo < 1) {
          this.verificandoFolio = false;
          return of(null);
        }
        this.verificandoFolio = true;
        const folioCandidato = `${iniciales.trim().toUpperCase()}-${consecutivo}`;
        return this.valeService.verificarFolioValeExistente(folioCandidato);
      })
    ).subscribe({
      next: (res: any) => {
        this.verificandoFolio = false;
        this.folioDuplicado = res ? res.existe : false;
      },
      error: () => { this.verificandoFolio = false; this.folioDuplicado = false; }
    });
  }

  cargarAsesores(callback?: () => void) {
    this.cargandoAsesores = true;
    this.asesoresService.getAsesores().subscribe({
      next: (response: any) => {
        this.asesores = response.filter((asesor: Asesor) =>
          ['Asesor', 'Administrador', 'Soporte Tecnico'].includes(asesor.Rol) && asesor.Estatus === 1
        );
        this.cargandoAsesores = false;
        if (callback) callback();
      },
      error: (err) => {
        console.error('Error al cargar asesores', err);
        this.cargandoAsesores = false;
        if (callback) callback();
      }
    });
  }

  // Se llama desde el (valueChange) del app-select
  onAsesorChange(idSeleccionado: any) {
    this.idAsesorSeleccionado = idSeleccionado;
    this.iniciales = '';
    this.consecutivo = null;
    this.folioActualPreview = '';
    this.folioDuplicado = false;
    this.generarPreview();

    if (!this.idAsesorSeleccionado) return;

    this.cargandoFolioAsesor = true;
    this.valeService.obtenerFolioAsesor(Number(this.idAsesorSeleccionado)).subscribe({
      next: (res: any) => {
        this.iniciales = res.iniciales || '';
        this.consecutivo = res.consecutivo || 1;
        this.folioActualPreview = res.folioPreview || 'Sin asignar';
        this.generarPreview();
        this.cargandoFolioAsesor = false;
      },
      error: () => {
        toast.error('Error al cargar el folio actual del asesor.');
        this.cargandoFolioAsesor = false;
      }
    });
  }

  onCampoChange() {
    if (this.iniciales) {
      this.iniciales = this.iniciales.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
    }
    this.generarPreview();
    this.cambioFolio$.next({ iniciales: this.iniciales, consecutivo: this.consecutivo });
  }

  private generarPreview() {
    if (!this.idAsesorSeleccionado) {
      this.folioPreview = 'Selecciona un asesor';
      return;
    }
    const ini = this.iniciales?.trim() || '—';
    const num = this.consecutivo && this.consecutivo >= 1 ? this.consecutivo : '—';
    this.folioPreview = `${ini}-${num}`;
  }

  puedeGuardar(): boolean {
    return !!this.idAsesorSeleccionado &&
      !!this.iniciales?.trim() &&
      !!this.consecutivo && this.consecutivo >= 1 &&
      !this.guardando;
  }

  cerrar() {
    this.dialogRef.close(false);
  }

  guardarFolio() {
    if (!this.puedeGuardar()) {
      toast.error('Selecciona un asesor y captura iniciales y consecutivo válidos.');
      return;
    }
    this.guardando = true;

    this.valeService.actualizarFolioAsesor(
      Number(this.idAsesorSeleccionado),
      this.iniciales.trim(),
      this.consecutivo as number
    ).subscribe({
      next: () => {
        toast.success('Folio del asesor actualizado correctamente.');
        setTimeout(() => this.dialogRef.close(true), 1000);
      },
      error: (err) => {
        toast.error(err.error?.error || 'Error al actualizar el folio.');
        this.guardando = false;
      }
    });
  }
}