import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { InputComponent } from "../../../shared/components/UI/form/input/input.component";
import { SelectComponent } from "../../../shared/components/UI/form/select/select.component";
import { CardFormComponent } from "../../../shared/components/UI/form/card-form/card-form.component";
import { DemoService } from '../../../core/services/Demos.service';
import { StockDemo } from '../../../shared/model/demo.model';

@Component({
  selector: 'app-modal-demo',
  templateUrl: './modal-demo.page.html',
  styleUrls: ['./modal-demo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NgxSonnerToaster,
    FooterModalComponent,
    HeaderModalComponent,
    ButtonActionComponent,
    InputComponent,
    SelectComponent,
    CardFormComponent
  ]
})
export class ModalDemoPage implements OnInit {
  isEditMode: boolean = false;

  demoNuevo = {
    id_demo: 0,
    nombre_modelo: '',
    descripcion: '',
    numero_serie: '',
    id_marca: null as any,
    stock: null as any
  };

  opcionesMarcas = [
    { label: 'SMC', value: 1 },
    { label: 'OMRON', value: 2 },
    { label: 'PATLITE', value: 3 },
    { label: 'WAGO', value: 4 },
    { label: 'RWV', value: 5 },
    { label: 'KLINGSPOR', value: 6 },
    { label: 'KING TONY', value: 7 },
    { label: 'Mighty Seven (m7)', value: 8 },
    { label: 'Fuji Electric', value: 9 },
    { label: 'Sumitomo Drive Technologies', value: 10 },
    { label: 'Wenglor', value: 11 },
    { label: 'PHOENIX CONTACT', value: 12 },
    { label: 'PILZ', value: 13 },
    { label: 'EUCHNER', value: 14 },
    { label: 'CONTRINEX', value: 15 }
  ];

  constructor(
    private ds: DemoService,
    private dialogRef: MatDialogRef<ModalDemoPage>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.demo) {
      this.isEditMode = true;
      this.demoNuevo = { ...this.data.demo };
    }
  }

  ngOnInit() {}

  cerrar() {
    this.dialogRef.close(false);
  }

  procesarAccion() {
    if (!this.validarCampos()) {
      return;
    }

    if (this.isEditMode) {
      this.actualizarDemo();
    } else {
      this.guardarNuevoDemo();
    }
  }

  private guardarNuevoDemo() {
    this.ds.agregarDemo(this.demoNuevo as StockDemo).subscribe({
      next: (res) => {
        toast.success('Equipo Demo registrado correctamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al guardar el demo', err);
        toast.error('Ocurrió un error al intentar registrar el equipo demo.');
      }
    });
  }

  private actualizarDemo() {
    const idDemo = this.demoNuevo.id_demo;
    this.ds.modificarDemo(idDemo, this.demoNuevo as StockDemo).subscribe({
      next: (response) => {
        toast.success('Equipo Demo actualizado correctamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        toast.error('Error al actualizar el equipo demo');
      }
    });
  }

  validarCampos(): boolean {
    this.demoNuevo.nombre_modelo = (this.demoNuevo.nombre_modelo || '').toString().trim();
    this.demoNuevo.descripcion = (this.demoNuevo.descripcion || '').toString().trim();
    this.demoNuevo.numero_serie = (this.demoNuevo.numero_serie || '').toString().trim();

    if (!this.demoNuevo.nombre_modelo || !this.demoNuevo.id_marca) {
      toast.error('Por favor, completa el Nombre/Modelo y selecciona una Marca.');
      return false;
    }

    if (this.demoNuevo.stock === null || this.demoNuevo.stock === '' || this.demoNuevo.stock === undefined) {
      this.demoNuevo.stock = 0;
    } else {
      const stockNumerico = Number(this.demoNuevo.stock);
      if (isNaN(stockNumerico) || !Number.isInteger(stockNumerico) || stockNumerico < 0) {
        toast.error('El stock debe ser un número entero válido (0 o mayor).');
        return false;
      }
      this.demoNuevo.stock = stockNumerico; 
    }

    return true;
  }
}