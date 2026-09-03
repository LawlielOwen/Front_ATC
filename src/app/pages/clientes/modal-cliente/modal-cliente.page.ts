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
import { FormsModule } from '@angular/forms';
import { MarcaService } from '../../../core/services/Marcas.service';
import { Marcas } from '../../../shared/model/marcas.model';
@Component({
  selector: 'app-modal-cliente',
  templateUrl: './modal-cliente.page.html',
  styleUrls: ['./modal-cliente.page.scss'],
  standalone: true,
  imports: [IonicModule,
    CommonModule, FooterModalComponent, HeaderModalComponent, ButtonActionComponent,
    UploadModalComponent, InputComponent, SelectComponent, CardFormComponent,
    NgxSonnerToaster, FormsModule],
})
export class ModalClientePage implements OnInit {
  asesores: Asesor[] = [];
  archivoActual: File | undefined = undefined;
  uploadMode: boolean = true;
  archivoGuardado: File | null = null;
  isEditMode: boolean = false;
  isUpdateCsfMode: boolean = false;
  constructor(private service: AsesoresService, private clienteService: ClientesService,
    private dialogRef: MatDialogRef<ModalClientePage>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any, private marcaService: MarcaService) { }
  clienteNuevo: any = {
    id: 0,
    Nombre: '',
    RFC: '',
    Razon_social: '',
    Regimen_fiscal: '',
    Direccion: '',
    contacto_principal: '',
    correo_contacto: '',
    CP: '',
    tiene_credito: false,
    limite_credito: null,
    asesoresAsignados: [
      { id_asesor: '', asesor_tipo: '', marcasArray: [], marcas_asignadas: '' }
    ]
  };
  opcionesMarcas: { label: string, value: number }[] = [];

  agregarAsesor() {
    this.clienteNuevo.asesoresAsignados.push({
      id_asesor: '', asesor_tipo: '', marcasArray: [], marcas_asignadas: ''
    });
  }

  removerAsesor(index: number) {
    if (this.clienteNuevo.asesoresAsignados.length > 1) {
      this.clienteNuevo.asesoresAsignados.splice(index, 1);
    }
  }

  toggleMarca(event: any, marcaLabel: string, indexAsesor: number) {
    const asesor = this.clienteNuevo.asesoresAsignados[indexAsesor];
    const yaEsta = asesor.marcasArray.includes(marcaLabel);

    asesor.marcasArray = event.target.checked
      ? [...asesor.marcasArray, marcaLabel]
      : asesor.marcasArray.filter((m: string) => m !== marcaLabel);

    asesor.marcas_asignadas = asesor.marcasArray.join(', ');
  }
  ngOnInit() {
    this.cargarMarcas();
    this.cargarAsesores(() => {

      if (this.data && this.data.id) {
        this.isEditMode = true;
        this.uploadMode = false;
        this.clienteNuevo = { ...this.data };

        if (!Array.isArray(this.clienteNuevo.asesoresAsignados) || this.clienteNuevo.asesoresAsignados.length === 0) {
          this.clienteNuevo.asesoresAsignados = [
            { id_asesor: '', asesor_tipo: '', marcasArray: [], marcas_asignadas: '' }
          ];
        }
      }

      if (this.data && this.data.modo === 'updateCsf') {
        this.isUpdateCsfMode = true;
        this.uploadMode = true;
        this.clienteNuevo.id = this.data.cliente.id;
      }

      if (this.data && this.data.nombrePrellenado) {
        this.uploadMode = false;
        this.clienteNuevo.Nombre = this.data.nombrePrellenado;
      }

      if (!this.isEditMode && this.data?.idAsesorPrellenado) {
        this.clienteNuevo.asesoresAsignados[0].id_asesor = this.data.idAsesorPrellenado.toString();
      }
    });
  }

  cargarAsesores(callback?: () => void) {
    this.service.getAsesores().subscribe({
      next: (response: any) => {
        this.asesores = response.filter((asesor: Asesor) =>
          ['Asesor', 'Administrador'].includes(asesor.Rol) && asesor.Estatus === 1
        );
        if (callback) callback();
      },
      error: (err) => {
        console.error('Error al cargar asesores', err);
        if (callback) callback();
      }
    });
  }

  cerrar() {
    this.dialogRef.close();
  }
  recibirArchivo(archivo: File | undefined) {
    this.archivoActual = archivo;
  }

  agregarCliente() {
    const formData = new FormData();

    formData.append('Nombre', this.clienteNuevo.Nombre);
    formData.append('RFC', this.clienteNuevo.RFC);
    formData.append('Razon_social', this.clienteNuevo.Razon_social);
    formData.append('Regimen_fiscal', this.clienteNuevo.Regimen_fiscal);
    formData.append('Direccion', this.clienteNuevo.Direccion);
    formData.append('contacto_principal', this.clienteNuevo.contacto_principal);
    formData.append('correo_contacto', this.clienteNuevo.correo_contacto);
    formData.append('CP', this.clienteNuevo.CP);

    formData.append('asesores_json', JSON.stringify(this.clienteNuevo.asesoresAsignados));
    formData.append('marcas_asignadas', this.clienteNuevo.marcas_asignadas || '');

    formData.append('tiene_credito', this.clienteNuevo.tiene_credito ? '1' : '0');

    const limiteGuardar = this.clienteNuevo.tiene_credito ? this.clienteNuevo.limite_credito : 0;
    formData.append('limite_credito', limiteGuardar.toString());

    if (this.archivoActual) {
      formData.append('archivo', this.archivoActual);
    }

    this.clienteService.addCliente(formData).subscribe({
      next: (response: any) => {
        toast.success('Cliente agregado correctamente');
        this.dialogRef.close(response.id);
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
    // Si estamos en el modo especial de actualizar CSF
    if (this.isUpdateCsfMode) {
      this.actualizarSoloCsf();
      return;
    }

    // Tu lógica original se queda intacta
    if (this.uploadMode) {
      this.procesarPDF();
    } else {
      if (!this.validarCamposObligatorios()) return;
      if (!this.validarYSanitizarOpcionales()) return;

      if (this.isEditMode) {
        this.actualizarClienteExistente();
      } else {
        this.agregarCliente();
      }
    }
  }
  actualizarClienteExistente() {
    const idCliente = this.clienteNuevo.id;
    const formData = new FormData();

    formData.append('Nombre', this.clienteNuevo.Nombre);
    formData.append('RFC', this.clienteNuevo.RFC);
    formData.append('Razon_social', this.clienteNuevo.Razon_social);
    formData.append('Regimen_fiscal', this.clienteNuevo.Regimen_fiscal);
    formData.append('Direccion', this.clienteNuevo.Direccion);
    formData.append('contacto_principal', this.clienteNuevo.contacto_principal);
    formData.append('correo_contacto', this.clienteNuevo.correo_contacto);
    formData.append('CP', this.clienteNuevo.CP);

    formData.append('asesores_json', JSON.stringify(this.clienteNuevo.asesoresAsignados));

    formData.append('tiene_credito', this.clienteNuevo.tiene_credito ? '1' : '0');
    const limiteGuardar = this.clienteNuevo.tiene_credito ? this.clienteNuevo.limite_credito : 0;
    formData.append('limite_credito', limiteGuardar.toString());

    formData.append('nombre_constancia', this.clienteNuevo.nombre_constancia || '');
    formData.append('ruta_constancia', this.clienteNuevo.ruta_constancia || '');

    if (this.archivoActual) {
      formData.append('archivo', this.archivoActual);
    }

    this.clienteService.updateCliente(idCliente, formData).subscribe({
      next: (response) => {
        toast.success('Cliente actualizado correctamente');
        this.dialogRef.close(true);
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
    this.clienteNuevo.RFC = (this.clienteNuevo.RFC || '').trim().toUpperCase();
    this.clienteNuevo.Razon_social = (this.clienteNuevo.Razon_social || '').trim();
    this.clienteNuevo.Regimen_fiscal = (this.clienteNuevo.Regimen_fiscal || '').trim();
    this.clienteNuevo.Direccion = (this.clienteNuevo.Direccion || '').trim();
    this.clienteNuevo.CP = (this.clienteNuevo.CP || '').trim();
    this.clienteNuevo.contacto_principal = (this.clienteNuevo.contacto_principal || '').trim();
    this.clienteNuevo.correo_contacto = (this.clienteNuevo.correo_contacto || '').trim();

    if (!this.clienteNuevo.Nombre || !this.clienteNuevo.RFC ||
      !this.clienteNuevo.Razon_social || !this.clienteNuevo.Regimen_fiscal ||
      !this.clienteNuevo.Direccion || !this.clienteNuevo.CP) {
      toast.error('Por favor, completa todos los campos obligatorios.');
      return false;
    }

    const hayAsesorIncompleto = this.clienteNuevo.asesoresAsignados.some((rel: any) =>
      !rel.id_asesor || !rel.asesor_tipo || !rel.marcasArray || rel.marcasArray.length === 0
    );
    if (hayAsesorIncompleto) {
      toast.error('Completa el asesor, el origen y al menos una marca para cada asesor agregado.');
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

    if (this.clienteNuevo.tiene_credito) {
      const limite = Number(this.clienteNuevo.limite_credito);
      if (isNaN(limite) || limite <= 0) {
        toast.error('Si el cliente tiene crédito, debes asignar un límite mayor a $0.00.');
        return false;
      }
    }

    return true;
  }
  actualizarSoloCsf() {
    if (!this.archivoActual) {
      toast.error('Por favor, selecciona un archivo PDF primero.');
      return;
    }

    this.clienteService.subirCSF(this.clienteNuevo.id, this.archivoActual).subscribe({
      next: (res) => {
        toast.success(res.mensaje || 'Constancia subida correctamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        toast.error(err.error?.error || 'Error al actualizar la constancia');
      }
    });
  }
    cargarMarcas() {
    this.marcaService.getMarcasActivas().subscribe({
      next: (marcas: Marcas[]) => {
        this.opcionesMarcas = marcas.map(m => ({ label: m.Nombre, value: m.id }));
      },
      error: (err) => console.error('Error al cargar marcas', err)
    });
  }
}
