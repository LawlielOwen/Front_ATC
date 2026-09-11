import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalVincularClientePageRoutingModule } from './modal-vincular-cliente-routing.module';

import { ModalVincularClientePage } from './modal-vincular-cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalVincularClientePageRoutingModule
  ],
})
export class ModalVincularClientePageModule {}
