import { Component, OnInit, Inject, Optional } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { InputComponent } from "../../../shared/components/UI/form/input/input.component";
import { SelectComponent } from "../../../shared/components/UI/form/select/select.component";
import { CardFormComponent } from "../../../shared/components/UI/form/card-form/card-form.component";
import { AsesoresService } from "../../../core/services/Asesores.service";
import { Asesor } from "../../../shared/model/asesor.model";
import { NgxSonnerToaster } from 'ngx-sonner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { DateComponent } from "../../../shared/components/UI/form/date/date.component";

@Component({
  selector: 'app-modal-asesor',
  templateUrl: './modal-asesor.page.html',
  styleUrls: ['./modal-asesor.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule, 
    FooterModalComponent, 
    HeaderModalComponent, 
    ButtonActionComponent,
    InputComponent, 
    SelectComponent, 
    CardFormComponent,
    NgxSonnerToaster,
     MatDatepickerModule,
    MatNativeDateModule,
    DateComponent
  ],
  providers: [
    provideNativeDateAdapter()
  ]
})
export class ModalAsesorPage implements OnInit {
  isEditMode: boolean = false;
  guardando: boolean = false; 

  asesorNuevo = {
    id: 0,
    Nombre: '',
    app: '',
    apm: '',
    telefono: '',
    usuario: '',
    contra: '',
    Rol: '',
    Fecha_nacimiento: '' as any,
    Fecha_contratacion: '' as any,
    Correo: ''
  };

  constructor(
    private aservice: AsesoresService,
    private dialogRef: MatDialogRef<ModalAsesorPage>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

 ngOnInit() {
    if (this.data && this.data.id) {
      this.isEditMode = true;
      this.asesorNuevo = { ...this.data };

      if (this.data.Fecha_nacimiento) {
        const f_nac = this.data.Fecha_nacimiento.substring(0, 10);
        this.asesorNuevo.Fecha_nacimiento = new Date(`${f_nac}T12:00:00`);
      }
      
      if (this.data.Fecha_contratacion) {
        const f_con = this.data.Fecha_contratacion.substring(0, 10);
        this.asesorNuevo.Fecha_contratacion = new Date(`${f_con}T12:00:00`);
      }

      this.asesorNuevo.contra = ''; 
    }
  }
private formatearParaBD(fecha: any): string {
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha.substring(0, 10);
    const d = new Date(fecha);
    const mes = '' + (d.getMonth() + 1);
    const dia = '' + d.getDate();
    const anio = d.getFullYear();

    return [anio, mes.padStart(2, '0'), dia.padStart(2, '0')].join('-');
  }
  cerrar() {
    this.dialogRef.close();
  }

procesarAccion() {
    if (!this.validarAsesor()) {
      return; 
    }

    this.guardando = true;

    const asesorParaGuardar = { ...this.asesorNuevo };
    
    asesorParaGuardar.Fecha_nacimiento = this.asesorNuevo.Fecha_nacimiento ? this.formatearParaBD(this.asesorNuevo.Fecha_nacimiento) : null;
    asesorParaGuardar.Fecha_contratacion = this.asesorNuevo.Fecha_contratacion ? this.formatearParaBD(this.asesorNuevo.Fecha_contratacion) : null;

    if (this.isEditMode) {
      this.actualizarAsesorExistente(asesorParaGuardar);
    } else {
      this.agregarAsesor(asesorParaGuardar);
    }
  }
 agregarAsesor(asesorListo: any) {
    this.aservice.addAsesor(asesorListo).subscribe({
      next: (response: any) => {
        toast.success(response.mensaje || 'Asesor agregado correctamente');
        this.guardando = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        toast.error(err.error?.error || 'Ocurrió un error al intentar registrar el asesor.');
        this.guardando = false;
      }
    });
  }

  actualizarAsesorExistente(asesorListo: any) {
    this.aservice.updateAsesor(asesorListo.id, asesorListo).subscribe({
      next: (response: any) => {
        toast.success(response.mensaje || 'Asesor actualizado correctamente');
        this.guardando = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        toast.error(err.error?.error || 'Error al intentar actualizar el asesor.');
        this.guardando = false;
      }
    });
  }
  validarAsesor(): boolean {
    this.asesorNuevo.Nombre = (this.asesorNuevo.Nombre || '').toString().trim();
    this.asesorNuevo.app = (this.asesorNuevo.app || '').toString().trim();
    this.asesorNuevo.apm = (this.asesorNuevo.apm || '').toString().trim();
    this.asesorNuevo.usuario = (this.asesorNuevo.usuario || '').toString().trim();
    this.asesorNuevo.Rol = (this.asesorNuevo.Rol || '').toString().trim();
    this.asesorNuevo.Correo = (this.asesorNuevo.Correo || '').toString().trim();

    if (!this.asesorNuevo.Nombre || !this.asesorNuevo.Correo || !this.asesorNuevo.Rol) {
      toast.error('Por favor, completa los campos requeridos (Nombre, Correo, Rol).');
      return false;
    }

    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexEmail.test(this.asesorNuevo.Correo)) {
      toast.error('El formato del correo electrónico es incorrecto.');
      return false;
    }

    if (this.asesorNuevo.telefono && this.asesorNuevo.telefono.trim() !== '') {
      let telLimpio = this.asesorNuevo.telefono.replace(/[\s\-\(\)\+]/g, '');
      
      const regexTelefono = /^\d{10,15}$/;
      if (!regexTelefono.test(telLimpio)) {
        toast.error('El teléfono debe ser un número válido de entre 10 y 15 dígitos.');
        return false;
      }
      this.asesorNuevo.telefono = telLimpio; 
    } else {
      this.asesorNuevo.telefono = '';
    }

    const passGuardar = (this.asesorNuevo.contra || '').toString().trim();
    const regexContra = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!this.isEditMode) {
      if (!passGuardar) {
        toast.error('La contraseña es obligatoria para registrar un nuevo asesor.');
        return false;
      }
      if (!regexContra.test(passGuardar)) {
        toast.error('La contraseña debe tener mínimo 6 caracteres, incluir una mayúscula y un número.');
        return false;
      }
    } else {
      if (passGuardar !== '' && !regexContra.test(passGuardar)) {
        toast.error('La nueva contraseña debe tener mínimo 6 caracteres, incluir una mayúscula y un número.');
        return false;
      }
    }
    
    this.asesorNuevo.contra = passGuardar;

    return true; 
  }
}