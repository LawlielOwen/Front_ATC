import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterModalComponent } from '../footer-modal/footer-modal.component';
import { ButtonActionComponent } from '../../buttons/button-action/button-action.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmDialogData {
  titulo: string;
  mensaje: string;
  textoAceptar?: string;
  textoCancelar?: string;
}

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FooterModalComponent,
    ButtonActionComponent
  ]
})
export class DeleteComponent implements OnInit {
  
  constructor(
    public dialogRef: MatDialogRef<DeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData 
  ) { }

  ngOnInit() { }

  cerrarDetalle() {
    this.dialogRef.close(false);
  }

  procesarFuncion() {
    this.dialogRef.close(true);
  }
}