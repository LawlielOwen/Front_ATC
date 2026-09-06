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
  asesores: any[] = [];
  idAsesorSeleccionado: number | null = null;
  asesorSeleccionado: any = null;

  nuevoConsecutivo: number = 1;
  previewFolio: string = '';

  // Referencia fija del folio con el que el asesor llegó al abrir el modal
  folioActualPreview: string = '';
  consecutivoActualOriginal: number = 1;

  // Verificación de folio duplicado
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
    this.cargarListaAsesores();

    this.consecutivoChange$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((numero) => {
        if (!this.asesorSeleccionado || !numero || numero < 1) {
          this.verificandoFolio = false;
          return of(null);
        }
        this.verificandoFolio = true;
        return this.asesoresService.verificarFolioExistente(this.asesorSeleccionado.id, numero);
      })
    ).subscribe({
      next: (res: any) => {
        this.verificandoFolio = false;
        this.folioDuplicado = res ? res.existe : false;
      },
      error: () => {
        this.verificandoFolio = false;
        this.folioDuplicado = false;
      }
    });
  }

  cargarListaAsesores() {
    this.cargando = true;
    this.asesoresService.getAsesores().subscribe({
      next: (res: any) => {
        // Filtramos para que solo aparezcan los que pueden cotizar
        this.asesores = res.filter((a: any) =>
          ['Asesor', 'Administrador', 'Cotizador'].includes(a.Rol) && a.Estatus === 1
        );

        if (this.asesores.length > 0) {
          this.idAsesorSeleccionado = this.asesores[0].id;
          this.alCambiarAsesor();
        }
        this.cargando = false;
      },
      error: (err) => {
        toast.error('Error al cargar la lista de asesores');
        this.cargando = false;
      }
    });
  }

  alCambiarAsesor() {
    this.asesorSeleccionado = this.asesores.find(a => a.id == this.idAsesorSeleccionado);

    if (this.asesorSeleccionado) {
      const consecutivoActual = this.asesorSeleccionado.consecutivo_cotizacion
        ? Number(this.asesorSeleccionado.consecutivo_cotizacion)
        : 1;

      this.consecutivoActualOriginal = consecutivoActual;
      this.folioActualPreview = this.formatearFolio(consecutivoActual);

      this.nuevoConsecutivo = consecutivoActual;
      this.folioDuplicado = false;

      this.generarPreview();
    } else {
      this.folioActualPreview = '';
      this.consecutivoActualOriginal = 1;
      this.folioDuplicado = false;
    }
  }

  private formatearFolio(numero: number): string {
    if (!this.asesorSeleccionado) return '---';

    const nombre = this.asesorSeleccionado.Nombre
      ? this.asesorSeleccionado.Nombre.trim().charAt(0).toUpperCase()
      : 'X';
    const apellido = this.asesorSeleccionado.app
      ? this.asesorSeleccionado.app.trim().charAt(0).toUpperCase()
      : 'X';
    const iniciales = `${nombre}${apellido}`;

    const numeroFormateado = numero.toString().padStart(3, '0');
    return `${iniciales}-${numeroFormateado}`;
  }

  generarPreview() {
    if (!this.asesorSeleccionado || !this.nuevoConsecutivo || this.nuevoConsecutivo < 1) {
      this.previewFolio = 'Formato no válido';
      this.folioDuplicado = false;
      return;
    }

    this.previewFolio = this.formatearFolio(this.nuevoConsecutivo);
    this.consecutivoChange$.next(this.nuevoConsecutivo);
  }

  cerrar() {
    this.dialogRef.close(false);
  }

  guardarConsecutivo() {
    if (!this.asesorSeleccionado) return;
    if (!this.nuevoConsecutivo || this.nuevoConsecutivo < 1) {
      toast.error('Ingresa un número consecutivo válido mayor a 0.');
      return;
    }

    this.guardando = true;
    this.asesoresService.actualizarConsecutivo(this.asesorSeleccionado.id, this.nuevoConsecutivo).subscribe({
      next: (res: any) => {
        toast.success(res.mensaje || 'Folio actualizado correctamente.');
        setTimeout(() => this.dialogRef.close(true), 1000);
      },
      error: (err) => {
        toast.error('Error al actualizar el folio.');
        this.guardando = false;
      }
    });
  }
}