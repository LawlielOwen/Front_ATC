import { Component, OnInit, Inject, Optional } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { UploadModalComponent } from "../../../shared/components/UI/modal/upload-modal/upload-modal.component";
import { InputComponent } from "../../../shared/components/UI/form/input/input.component";
import { SelectComponent } from "../../../shared/components/UI/form/select/select.component";
import { CardFormComponent } from "../../../shared/components/UI/form/card-form/card-form.component";
import { AsesoresService } from "../../../core/services/Asesores.service";
import { Asesor } from "../../../shared/model/asesor.model"
import { ClientesService } from "../../../core/services/clientes.service"
import { Cliente } from '../../../shared/model/clientes.model';
import { NgxSonnerToaster } from 'ngx-sonner';

@Component({
  selector: 'app-modal-cliente',
  templateUrl: './modal-cliente.page.html',
  styleUrls: ['./modal-cliente.page.scss'],
  standalone: true,
  imports: [IonicModule,
    CommonModule, FooterModalComponent, HeaderModalComponent, ButtonActionComponent,
    UploadModalComponent, InputComponent, SelectComponent, CardFormComponent,
    NgxSonnerToaster],
})
export class ModalClientePage implements OnInit {
  asesores: Asesor[] = [];
  archivoActual: File | undefined = undefined;
  uploadMode: boolean = true;
  archivoGuardado: File | null = null;
  isEditMode: boolean = false;
  constructor(private service: AsesoresService, private clienteService: ClientesService,
    private dialogRef: MatDialogRef<ModalClientePage>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  clienteNuevo = {
    id: 0,
    Nombre: '',
    RFC: '',
    Razon_social: '',
    Regimen_fiscal: '',
    Direccion: '',
    contacto_principal: '',
    correo_contacto: '',
    CP: '',
    id_asesor: '',
    asesor_tipo: ''
  };

  ngOnInit() {
    if (this.data && this.data.id) {
      this.isEditMode = true;
      this.uploadMode = false;

      this.clienteNuevo = { ...this.data };
      this.clienteNuevo.id_asesor = '';
    }
    this.cargarAsesores();
  }


  cerrar() {
    this.dialogRef.close();
  }
  recibirArchivo(archivo: File | undefined) {
    this.archivoActual = archivo;
  }
  cargarAsesores() {
    this.service.getAsesores().subscribe({
      next: (response: any) => {

        this.asesores = response.filter((asesor: Asesor) => asesor.Rol === 'Asesor');
        if (this.isEditMode && this.data.id_asesor) {
          setTimeout(() => {
            this.clienteNuevo.id_asesor = this.data.id_asesor.toString();
          }, 50);
        }
      },
      error: (err) => console.error('Error al cargar asesores', err)
    });
  }
  agregarCliente() {
    const formData = new FormData();

    formData.append('Nombre', this.clienteNuevo.Nombre);
    formData.append('RFC', this.clienteNuevo.RFC);
    formData.append('Razon_social', this.clienteNuevo.Razon_social);
    formData.append('Regimen_fiscal', this.clienteNuevo.Regimen_fiscal);
    formData.append('Direccion', this.clienteNuevo.Direccion);
    formData.append('contacto_principal', this.clienteNuevo.contacto_principal); // NUEVO
    formData.append('correo_contacto', this.clienteNuevo.correo_contacto);       // NUEVO
    formData.append('CP', this.clienteNuevo.CP);
    formData.append('id_asesor', this.clienteNuevo.id_asesor);
    formData.append('asesor_tipo', this.clienteNuevo.asesor_tipo);

    if (this.archivoActual) {
      formData.append('archivo', this.archivoActual);
    }

    this.clienteService.addCliente(formData).subscribe({
      next: (response) => {
        toast.success('Cliente agregado correctamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        toast.error('Error al guardar el cliente');
      }
    });
  }
  procesarPDF() {
    if (this.uploadMode) {
      if (!this.archivoActual) {
        toast.error('Primero selecciona un archivo');
        return;
      }
      this.clienteService.procesarCSF(this.archivoActual).subscribe({
        next: (response: any) => {
          toast.success('Constancia procesada con éxito');
          if (response.RFC) this.clienteNuevo.RFC = response.RFC;
          if (response.CP) this.clienteNuevo.CP = response.CP;
          if (response.nombre) this.clienteNuevo.Nombre = response.nombre;
          if (response.razon_social) this.clienteNuevo.Razon_social = response.razon_social;
          if (response.regimen_fiscal) this.clienteNuevo.Regimen_fiscal = response.regimen_fiscal;
          if (response.direccion) this.clienteNuevo.Direccion = response.direccion;
          this.uploadMode = false;
        },
        error: () => {
          toast.error('El documento parece ser un escaneo. Por favor, sube el PDF original o utiliza el Registro Manual.');
        }
      });
    } else {
      this.agregarCliente();
    }
  }
 procesarAccion() {
    if (this.uploadMode) {
      this.procesarPDF();
    } else {
      
      if (!this.validarCamposObligatorios()) {
        return; 
      }

      if (!this.validarYSanitizarOpcionales()) {
        return; 
      }

      if (this.isEditMode) {
        this.actualizarClienteExistente();
      } else {
        this.agregarCliente(); 
      }
    }
  }
  actualizarClienteExistente() {
    const idCliente = this.clienteNuevo.id;


    this.clienteService.updateCliente(idCliente, this.clienteNuevo as any).subscribe({
      next: (response) => {
        toast.success('Cliente actualizado correctamente');
        this.dialogRef.close(true); // Cerrar y recargar
      },
      error: (err) => {
        console.error(err);
        toast.error('Error al actualizar el cliente');
      }
    });
  }
  validarYSanitizarOpcionales(): boolean {
    if (this.clienteNuevo.contacto_principal && this.clienteNuevo.contacto_principal.trim() !== '') {
      let telLimpio = this.clienteNuevo.contacto_principal.replace(/[\s\-\(\)\+]/g, '');


      const regexTelefono = /^\d{10,15}$/;
      if (!regexTelefono.test(telLimpio)) {
        toast.error('El contacto principal debe ser un número telefónico válido.');
        return false;
      }


      this.clienteNuevo.contacto_principal = telLimpio;
    } else {
      this.clienteNuevo.contacto_principal = '';
    }

    if (this.clienteNuevo.correo_contacto && this.clienteNuevo.correo_contacto.trim() !== '') {
      this.clienteNuevo.correo_contacto = this.clienteNuevo.correo_contacto.trim();


      const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regexEmail.test(this.clienteNuevo.correo_contacto)) {
        toast.error('El formato del correo electrónico de contacto es incorrecto.');
        return false;
      }
    } else {
      this.clienteNuevo.correo_contacto = '';
    }

    return true;
  }
  validarCamposObligatorios(): boolean {

    this.clienteNuevo.Nombre = (this.clienteNuevo.Nombre || '').trim();
    this.clienteNuevo.RFC = (this.clienteNuevo.RFC || '').trim().toUpperCase(); // RFC siempre en mayúsculas
    this.clienteNuevo.Razon_social = (this.clienteNuevo.Razon_social || '').trim();
    this.clienteNuevo.Regimen_fiscal = (this.clienteNuevo.Regimen_fiscal || '').trim();
    this.clienteNuevo.Direccion = (this.clienteNuevo.Direccion || '').trim();
    this.clienteNuevo.CP = (this.clienteNuevo.CP || '').trim();

    if (!this.clienteNuevo.Nombre || !this.clienteNuevo.RFC ||
      !this.clienteNuevo.Razon_social || !this.clienteNuevo.Regimen_fiscal ||
      !this.clienteNuevo.Direccion || !this.clienteNuevo.CP ||
      !this.clienteNuevo.id_asesor || !this.clienteNuevo.asesor_tipo) {

      toast.error('Por favor, completa todos los campos obligatorios.');
      return false;
    }

    const regexCP = /^\d{5}$/;
    if (!regexCP.test(this.clienteNuevo.CP)) {
      toast.error('El Código Postal debe contener exactamente 5 números.');
      return false;
    }

    this.clienteNuevo.RFC = this.clienteNuevo.RFC.replace(/[\s\-]/g, '');
    if (this.clienteNuevo.RFC.length < 12 || this.clienteNuevo.RFC.length > 13) {
      toast.error('El RFC debe tener entre 12 y 13 caracteres válidos.');
      return false;
    }

    return true; // Todos los campos obligatorios están listos
  }
}
