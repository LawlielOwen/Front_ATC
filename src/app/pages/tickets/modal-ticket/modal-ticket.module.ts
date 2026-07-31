import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalTicketPageRoutingModule } from './modal-ticket-routing.module';

import { ModalTicketPage } from './modal-ticket.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalTicketPageRoutingModule
  ]
})
export class ModalTicketPageModule {}
