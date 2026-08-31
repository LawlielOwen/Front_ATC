import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { ValeService } from "../../../core/services/Vales.service";
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
@Component({
  selector: 'app-detalles-vale',
  templateUrl: './detalles-vale.page.html',
  styleUrls: ['./detalles-vale.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FooterModalComponent,
    HeaderModalComponent,
    ButtonActionComponent,
    FormsModule,
  ]
})
export class DetallesValePage implements OnInit {
  vale: any = null;
  cargandoProductos: boolean = true;
  comentarioResolucion: string = '';
    rolUsuario: string = '';

  constructor(private dialogRef: MatDialogRef<DetallesValePage>, @Inject(MAT_DIALOG_DATA) public data: any,
    private valeService: ValeService) { }
ngOnInit() {
    if (this.data && this.data.vale) {
      this.vale = { ...this.data.vale };
      this.cargarProductos(this.vale.id_vale);
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.rolUsuario = payload.Rol || '';
      } catch (error) {
        console.error('Error al decodificar el token en DetallesValePage:', error);
      }
    }
  }
  getColorEstatus(estatus: number): string {
    switch (estatus) {
      case 0: return 'bg-orange-100 text-orange-700 border-orange-200';
      case 1: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 2: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-200 text-slate-700 border-slate-200';
    }
  }
  cerrar() {
    this.dialogRef.close();
  }
  getTextoEstatus(estatus: number): string {
    switch (estatus) {
      case 0: return 'Pendiente';
      case 1: return 'Aceptado';
      case 2: return 'Rechazado';
      default: return 'Desconocido';
    }
  }
  cargarProductos(id: number) {
    this.cargandoProductos = true;
    this.valeService.getValId(id).subscribe({
      next: (response: any) => {
        this.vale.productos = response.productos || [];
        this.cargandoProductos = false;
      },
      error: (err) => {
        console.error('Error al cargar los productos del vale', err);
        this.vale.productos = [];
        this.cargandoProductos = false;
      }
    });
  }
  getTotalPiezas(): number {
    if (!this.vale || !this.vale.productos) return 0;
    return this.vale.productos.reduce((total: number, prod: any) => total + (prod.piezas || 0), 0);
  }
aceptarVale() {
    const comentarios = this.comentarioResolucion.trim() || 'Sin comentarios u observaciones';
    
    const tipo = this.vale.tipo_vale ? this.vale.tipo_vale.toString().toLowerCase() : 'indefinido';
    
    if (tipo === 'demostracion' || tipo === 'demo') {
      
      this.valeService.aceptarValeDemo(this.vale.id_vale, comentarios, this.vale.id_asesor).subscribe({
        next: () => {
          toast.success('Vale de demostración aceptado y equipos descontados.');
          this.dialogRef.close(true);
        },
        error: (err) => { 
          toast.error(err.error?.error || 'Error al aceptar el vale de demostración.'); 
        }
      });
      
    } else {
      
      this.valeService.aceptarVal(this.vale.id_vale, comentarios, this.vale.id_asesor).subscribe({
        next: () => {
          toast.success('Vale de salida aceptado exitosamente.');
          this.dialogRef.close(true);
        },
        error: (err) => { 
          toast.error(err.error?.error || 'Error al aceptar el vale.'); 
        }
      });
      
    }
  }

  rechazarVale() {
    const comentarios = this.comentarioResolucion.trim() || 'Sin comentarios u observaciones';

    this.valeService.rechazarVal(this.vale.id_vale, comentarios, this.vale.id_asesor).subscribe({
      next: () => {
        toast.success('Vale rechazado exitosamente');
        this.dialogRef.close(true);
      },
      error: (err) => { toast.error('Error al rechazar el vale.'); }
    });
  }
}
