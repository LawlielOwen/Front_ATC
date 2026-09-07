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
import { AsesoresService } from "../../../core/services/Asesores.service";

@Component({
  selector: 'app-num-cot',
  templateUrl: './num-cot.page.html',
  styleUrls: ['./num-cot.page.scss'],
  standalone: true,
  imports: [
    IonicModule, CommonModule, FormsModule, NgxSonnerToaster,
    FooterModalComponent, HeaderModalComponent, ButtonActionComponent, CardFormComponent
  ]
})
export class NumCotPage implements OnInit {
  consecutivoActualOriginal: number = 1;
  folioActualPreview: string = '';
  nuevoConsecutivo: number = 1;
  previewFolio: string = '';
  folioDuplicado: boolean = false;
  verificandoFolio: boolean = false;
  private consecutivoChange$ = new Subject<number>();
  guardando: boolean = false;
  cargando: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<NumCotPage>,
    private asesoresService: AsesoresService
  ) {}

  ngOnInit() {
    this.cargando = true;
    this.asesoresService.obtenerConsecutivoGlobal().subscribe({
      next: (res) => {
        const consecutivo = res.consecutivo;
        this.consecutivoActualOriginal = consecutivo;
        this.folioActualPreview = this.formatearFolio(consecutivo);
        this.nuevoConsecutivo = consecutivo;
        this.generarPreview();
        this.cargando = false;
      },
      error: () => {
        toast.error('Error al cargar el consecutivo actual');
        this.cargando = false;
      }
    });

    this.consecutivoChange$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((numero) => {
        if (!numero || numero < 1) { this.verificandoFolio = false; return of(null); }
        this.verificandoFolio = true;
        return this.asesoresService.verificarFolioGlobalExistente(numero);
      })
    ).subscribe({
      next: (res: any) => { this.verificandoFolio = false; this.folioDuplicado = res ? res.existe : false; },
      error: () => { this.verificandoFolio = false; this.folioDuplicado = false; }
    });
  }

  private formatearFolio(numero: number): string {
    const numeroFormateado = numero.toString().padStart(3, '0');
    return `C-${numeroFormateado}`;
  }

  generarPreview() {
    if (!this.nuevoConsecutivo || this.nuevoConsecutivo < 1) {
      this.previewFolio = 'Formato no válido';
      this.folioDuplicado = false;
      return;
    }
    this.previewFolio = this.formatearFolio(this.nuevoConsecutivo);
    this.consecutivoChange$.next(this.nuevoConsecutivo);
  }

  cerrar() { this.dialogRef.close(false); }

  guardarConsecutivo() {
    if (!this.nuevoConsecutivo || this.nuevoConsecutivo < 1) {
      toast.error('Ingresa un número consecutivo válido mayor a 0.');
      return;
    }
    this.guardando = true;
    this.asesoresService.actualizarConsecutivoGlobal(this.nuevoConsecutivo).subscribe({
      next: () => {
        toast.success('Folio global actualizado correctamente.');
        setTimeout(() => this.dialogRef.close(true), 1000);
      },
      error: () => { toast.error('Error al actualizar el folio.'); this.guardando = false; }
    });
  }
}