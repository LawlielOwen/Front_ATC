import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { InputComponent } from "../../../shared/components/UI/form/input/input.component";
import { SelectComponent } from "../../../shared/components/UI/form/select/select.component";
import { CardFormComponent } from "../../../shared/components/UI/form/card-form/card-form.component";

import { ProyectosService } from "../../../core/services/Proyectos.service";
import { ClientesService } from "../../../core/services/clientes.service";
import { AsesoresService } from "../../../core/services/Asesores.service";
import { ProductoService } from "../../../core/services/Productos.service"; 

@Component({
  selector: 'app-alta-proyecto',
  templateUrl: './alta-proyecto.page.html',
  styleUrls: ['./alta-proyecto.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonicModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatAutocompleteModule,
    NgxSonnerToaster, HeaderModalComponent, FooterModalComponent,
    ButtonActionComponent, InputComponent, SelectComponent, CardFormComponent
  ]
})
export class AltaProyectoPage implements OnInit {

  asesores: any[] = [];
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  productosFiltrados: any[] = [];

  clienteControl = new FormControl<any>('');
  productoControl = new FormControl<any>('');

  proyectoData: any = {
    nombre_proyecto: '',
    descripcion: '',
    id_tecnico: '',
    id_cliente: null,
    empresa_no_registrada: ''
  };

  materialesRequeridos: any[] = [];
  guardando: boolean = false;
  
  nombreTecnicoActivo: string = '';
  rolUsuarioActivo: string = '';
isEditMode: boolean = false;
  proyectoIdEdit: number | null = null;
  constructor(
    private proyectosService: ProyectosService,
    private clientesService: ClientesService,
    private asesoresService: AsesoresService,
    private productoService: ProductoService,
    @Optional() public dialogRef: MatDialogRef<AltaProyectoPage>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  if (this.data && this.data.proyecto) {
      this.precargarProyecto(this.data.proyecto);
    }

    this.cargarClientes();
    this.cargarAsesores(); 

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        this.nombreTecnicoActivo = payload.Nombre_completo || payload.Nombre || payload.nombre || 'Técnico';
        this.rolUsuarioActivo = payload.Rol || payload.rol || '';

        if (!this.isEditMode) {
          this.proyectoData.id_tecnico = payload.id + '';
        }
        
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }

    this.clienteControl.valueChanges.subscribe((valorBuscado: any) => {
      this.clientesFiltrados = this._filtrarClientes(valorBuscado);

      if (typeof valorBuscado === 'object' && valorBuscado !== null) {
        this.proyectoData.id_cliente = valorBuscado.id || valorBuscado.Id || valorBuscado.ID;
        this.proyectoData.empresa_no_registrada = ''; 
      } else if (typeof valorBuscado === 'string') {
        this.proyectoData.id_cliente = null;
        this.proyectoData.empresa_no_registrada = valorBuscado; 
      }
    });


    this.productoControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(termino => {
        if (!termino || typeof termino !== 'string' || termino.trim().length < 2) {
          this.productosFiltrados = [];
          return of(null);
        }
        return this.productoService.buscarProductoCodigo(termino.trim()); 
      })
    ).subscribe({
      next: (res: any) => {
        if (res && (res.data || res.productos || Array.isArray(res))) {
          this.productosFiltrados = res.data || res.productos || res;
        }
      }
    });
  }
private precargarProyecto(proyecto: any) {
    this.isEditMode = true;
this.proyectoIdEdit = proyecto.id_proyecto || proyecto.id;
    this.proyectoData = {
      nombre_proyecto: proyecto.nombre_proyecto,
      descripcion: proyecto.descripcion,
id_tecnico: proyecto.id_tecnico ? proyecto.id_tecnico.toString() : '',
      id_cliente: proyecto.id_cliente ? Number(proyecto.id_cliente) : null,
      empresa_no_registrada: proyecto.empresa_no_registrada
    };

    if (proyecto.id_cliente) {
      const clienteObjeto = {
        id: proyecto.id_cliente,
        nombre: proyecto.empresa_destino || proyecto.nombre_cliente
      };
      this.clienteControl.setValue(clienteObjeto, { emitEvent: false });
    } else if (proyecto.empresa_no_registrada) {
      this.clienteControl.setValue(proyecto.empresa_no_registrada, { emitEvent: false });
    }

    this.proyectosService.obtenerMateriales(this.proyectoIdEdit!).subscribe({
      next: (res: any[]) => {
        this.materialesRequeridos = res.map(m => ({
          id_producto: m.id_producto,
          codigo: m.Codigo_japon || m.Codigo_numeral || m.codigo_manual ||'', 
          nombre_producto: m.nombre_producto || '',
          marca: m.marca_producto || '--',
          cantidad: m.cantidad,
          
        }));
      },
      error: (err) => console.error('Error al cargar los materiales del proyecto', err)
    });
  }
cargarAsesores() {
    this.asesoresService.getAsesores().subscribe({
      next: (response: any) => {
        this.asesores = response.filter((asesor: any) => 
          ['Soporte Tecnico', 'Administrador'].includes(asesor.Rol) && asesor.Estatus === 1
        );


        if (this.isEditMode && this.proyectoData.id_tecnico) {
          const idGuardado = this.proyectoData.id_tecnico;
          
          this.proyectoData.id_tecnico = ''; 
          
          setTimeout(() => {
            this.proyectoData.id_tecnico = idGuardado; 
          }, 50);
        }
      },
      error: (err) => console.error('Error al cargar técnicos', err)
    });
  }

  cargarClientes() {
    this.clientesService.getClientes(1, 1000).subscribe({
      next: (response: any) => {
        const datosCrudos = response.clientes || response.data || response || [];
        if (Array.isArray(datosCrudos)) {
          this.clientes = datosCrudos.filter((c: any) => c.estatus === 1 || c.Estatus === 1);
          this.clientesFiltrados = this.clientes;
        }
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        toast.error('Error al cargar la lista de clientes');
      }
    });
  }

  private _filtrarClientes(valorBuscado: any): any[] {
    const filtro = (typeof valorBuscado === 'string' ? valorBuscado : '').toLowerCase();
    return this.clientes.filter(cliente => {
      const nombreCliente = cliente.nombre || cliente.Nombre || '';
      return nombreCliente.toLowerCase().includes(filtro);
    });
  }

  mostrarNombreCliente(cliente: any): string {
    if (!cliente) return '';
    if (typeof cliente === 'string') return cliente;
    return cliente.nombre || cliente.Nombre || '';
  }

  onEnterProducto(event: any) {
    const termino = event.target.value?.trim();
    if (!termino) return;

    if (this.productosFiltrados.length === 1) {
      this.seleccionarProducto(this.productosFiltrados[0]);
    } else if (this.productosFiltrados.length > 1) {
      toast.info('Por favor, selecciona un material de la lista desplegada.');
    }
  }

  seleccionarProducto(producto: any) {
    this.agregarItem(producto);
    this.productoControl.setValue('', { emitEvent: false });
    this.productosFiltrados = [];
  }

  agregarItem(productoDB: any) {
    this.materialesRequeridos.push({
      id_producto: productoDB.id || productoDB.Id,
      codigo: productoDB.Codigo_numeral || productoDB.Codigo_japon || '',
      nombre_producto: productoDB.Nombre || productoDB.nombre,
      marca: productoDB.Marca || productoDB.nombre_marca || '--',
      cantidad: 1
    });
  }

  agregarItemManual() {
    this.materialesRequeridos.push({
      id_producto: null,
      codigo: '',
      nombre_producto: '',
      marca: '',
      cantidad: 1
    });
  }

  eliminarMaterial(index: number) {
    this.materialesRequeridos.splice(index, 1);
  }

  procesarAccion() {
    if (!this.proyectoData.nombre_proyecto.trim()) {
      toast.error('El nombre del proyecto es obligatorio');
      return;
    }
    if (!this.proyectoData.id_tecnico) {
      toast.error('Debes asignar a un responsable técnico');
      return;
    }
    if (!this.proyectoData.descripcion.trim()) {
      toast.error('La descripción del proyecto es obligatoria');
      return;
    }
    if (!this.proyectoData.id_cliente && !this.proyectoData.empresa_no_registrada) {
      toast.error('Debes seleccionar un cliente o escribir la empresa destino');
      return;
    }
    
    const itemsManualesInvalidos = this.materialesRequeridos.some(m => m.id_producto === null && (!m.nombre_producto || m.nombre_producto.trim() === ''));
    if (itemsManualesInvalidos) {
      toast.error('Los materiales agregados manualmente deben tener al menos una descripción');
      return;
    }

    this.guardando = true;

    const payload = {
      nombre_proyecto: this.proyectoData.nombre_proyecto.trim(),
      descripcion: this.proyectoData.descripcion.trim(),
      id_tecnico: Number(this.proyectoData.id_tecnico),
      id_cliente: this.proyectoData.id_cliente || null,
      empresa_no_registrada: this.proyectoData.empresa_no_registrada || null,
      materiales: this.materialesRequeridos
    };

  if (this.isEditMode && this.proyectoIdEdit) {
      this.proyectosService.modificarProyecto(this.proyectoIdEdit, payload).subscribe({
        next: (res: any) => {
          toast.success(res?.mensaje || 'Proyecto actualizado exitosamente');
          this.guardando = false;
          this.dialogRef?.close(true);
        },
        error: (err) => {
          console.error('Error al actualizar proyecto', err);
          toast.error(err.error?.error || 'No se pudo actualizar el proyecto');
          this.guardando = false;
        }
      });
    } else {
      this.proyectosService.altaProyecto(payload).subscribe({
        next: (res: any) => {
          toast.success(res?.mensaje || 'Proyecto registrado exitosamente');
          this.guardando = false;
          this.dialogRef?.close(true);
        },
        error: (err) => {
          console.error('Error al registrar proyecto', err);
          toast.error(err.error?.error || 'No se pudo registrar el proyecto');
          this.guardando = false;
        }
      });
    }
  }

  cerrar() {
    this.dialogRef?.close(false);
  }
}