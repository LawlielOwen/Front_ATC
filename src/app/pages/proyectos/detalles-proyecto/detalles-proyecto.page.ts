import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { toast } from 'ngx-sonner';

import { AuthService } from '../../../core/services/auth.service';
import { ProyectosService } from '../../../core/services/Proyectos.service';
import { solicitarAvanceProyecto, mostrarExitoProyecto, mostrarErrorProyecto } from '../../../shared/utils/proyecto-alerts.util';
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { CardDetailsComponent } from "../../../shared/components/UI/modal/card-details/card-details.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";

import { DeleteComponent } from '../../../shared/components/UI/modal/delete/delete.component';
import { AltaProyectoPage } from '../alta-proyecto/alta-proyecto.page'; 

@Component({
  selector: 'app-detalles-proyecto',
  templateUrl: './detalles-proyecto.page.html',
  styleUrls: ['./detalles-proyecto.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    HeaderModalComponent,
    FooterModalComponent,
    CardDetailsComponent,
    ButtonActionComponent
  ]
})
export class DetallesProyectoPage implements OnInit {
  
bitacora: any[] = [];
  cargandoBitacora: boolean = true;
  proyecto: any;
  materiales: any[] = [];
  cargandoMateriales: boolean = true;
  huboCambios: boolean = false;
  tabActual: 'detalles' | 'bitacora' = 'detalles'; 

  constructor(
    private proyectosService: ProyectosService,
    public authService: AuthService,
    public dialogRef: MatDialogRef<DetallesProyectoPage>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    public dialog: MatDialog
  ) {
    this.proyecto = data.proyecto;
  }

  ngOnInit() {
    this.cargarMateriales();
    this.cargarBitacora();
  }

  cargarMateriales() {
    this.cargandoMateriales = true;
    const id = this.proyecto.id_proyecto || this.proyecto.id;

    this.proyectosService.obtenerMateriales(id).subscribe({
      next: (res: any[]) => {
        this.materiales = res || [];
        this.cargandoMateriales = false;
      },
      error: (err) => {
        console.error('Error al cargar materiales:', err);
        toast.error('No se pudieron cargar los materiales');
        this.cargandoMateriales = false;
      }
    });
  }
cargarBitacora() {
    this.cargandoBitacora = true;
    const id = this.proyecto.id_proyecto || this.proyecto.id;

    this.proyectosService.obtenerBitacora(id).subscribe({
      next: (res: any[]) => {
        this.bitacora = res || [];
        this.cargandoBitacora = false;
      },
      error: (err) => {
        console.error('Error al cargar la bitácora:', err);
        this.cargandoBitacora = false;
      }
    });
  }
  cerrarModal() {
    this.dialogRef.close(this.huboCambios);
  }

  modificarProyecto() {
    const dialogRef = this.dialog.open(AltaProyectoPage, {
      width: '830px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
      data: { proyecto: this.proyecto } 
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.dialogRef.close(true); 
      }
    });
  }
obtenerTextoEstatus(estatus: number): string {
    const diccionario: any = { 0: 'Cancelado', 1: 'En Progreso', 2: 'Revisión Cliente', 3: 'Ejecución', 5: 'En Pausa', 6: 'Completado' };
    return diccionario[estatus] || 'Desconocido';
  }

obtenerClaseEstatus(estatus: number): string {
    if (estatus === 6) return 'text-[#1D9E75]'; 
    if (estatus === 5) return 'text-amber-600';
    if (estatus === 0) return 'text-rose-600';  
    return 'text-[#003B8A]';                    
  }
  finalizarProyecto() {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '400px',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: {
        titulo: 'Finalizar Proyecto',
        mensaje: `¿Estás seguro de que deseas dar por finalizado el proyecto "${this.proyecto.nombre_proyecto}"? Ya no admitirá nuevos avances.`,
        textoAceptar: 'Finalizar',
        textoCancelar: 'Regresar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
      
        const id = this.proyecto.id_proyecto || this.proyecto.id;
        this.proyectosService.finalizarProyecto(id).subscribe({
          next: () => {
            toast.success('Proyecto finalizado exitosamente');
            this.dialogRef.close(true);
          },
          error: () => toast.error('Error al finalizar el proyecto')
        });
     
      }
    });
  }
async registrarAvance() {
  const intentarRegistro = async (comentarioPrevio: string = '') => {
    
    const datosAvance = await solicitarAvanceProyecto(this.proyecto.estatus, this.proyecto.se_cotizo, comentarioPrevio);
    if (!datosAvance) return;

    const idProyecto = this.proyecto.id_proyecto || this.proyecto.id;

    this.proyectosService.registrarAvance(
      idProyecto,
      datosAvance.comentario,
      datosAvance.estatus,
      datosAvance.se_cotizo,
      'cambio_estatus'
    ).subscribe({
      next: (res: any) => {
        mostrarExitoProyecto(res.mensaje || 'Avance registrado en la bitácora.');
        this.huboCambios = true;

        if (datosAvance.estatus === 6) {
          this.dialogRef.close(true);
        } else {
          this.proyecto.estatus = datosAvance.estatus;
          this.proyecto.se_cotizo = datosAvance.se_cotizo;
          this.tabActual = 'bitacora';
          this.cargarBitacora();
        }
      },
      error: (err) => {
        mostrarErrorProyecto('No se pudo registrar el avance. Asegúrate de incluir un comentario.');
        intentarRegistro(datosAvance.comentario); 
      }
    });
  };

  intentarRegistro();
}
obtenerNombreEvento(entrada: any): string {
  return entrada.nombre_asesor || 'Sistema';
}

obtenerIconoEvento(tipoEvento: string): string {
  const iconos: any = {
    cambio_estatus: 'swap-horizontal-outline',
    modificacion_material: 'construct-outline',
    comentario: 'chatbubble-outline',
    sistema: 'settings-outline'
  };
  return iconos[tipoEvento] || 'time-outline';
}
obtenerColorMarcador(avance: any): string {
  if (avance.tipo_evento === 'cambio_estatus' && avance.estatus_nuevo !== null) {
    if (avance.estatus_nuevo === 6) return 'bg-[#1D9E75]';
    if (avance.estatus_nuevo === 5) return 'bg-amber-500';
    if (avance.estatus_nuevo === 0) return 'bg-rose-500';
    return 'bg-[#003B8A]';
  }
  if (avance.tipo_evento === 'sistema') return 'bg-slate-400';
  return 'bg-[#003B8A]';
}
}