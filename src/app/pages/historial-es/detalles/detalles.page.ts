import { Component, OnInit, Inject, Optional } from '@angular/core';
import { Movimientos } from '../../../shared/model/movimientos.model';
import { MovimientoService } from '../../../core/services/Movimientos.service'
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { HeaderModalComponent } from '../../../shared/components/UI/modal/header-modal/header-modal.component'; import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { CardDetailsComponent } from "../../../shared/components/UI/modal/card-details/card-details.component";
import { CommonModule } from '@angular/common';
import { IonicModule } from "@ionic/angular";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";

@Component({
  selector: 'app-detalles',
  templateUrl: './detalles.page.html',
  styleUrls: ['./detalles.page.scss'],
  standalone: true,
  imports: [HeaderModalComponent, FooterModalComponent, CardDetailsComponent, CommonModule, ButtonActionComponent,
    IonicModule,]
})
export class DetallesPage implements OnInit {
  m!: any;
  constructor(private ms: MovimientoService, private dialogRef: MatDialogRef<DetallesPage>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    if (this.data && this.data.m) {
      this.m = this.data.m;
    }
  }

  ngOnInit() {
  }

  cerrarDetalle() {
    this.dialogRef.close();
  }
}
