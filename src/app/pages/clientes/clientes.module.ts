import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClientesPageRoutingModule } from './clientes-routing.module';
import { ClientesPage } from './clientes.page';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { ButtonNewComponent } from '../../shared/components/UI/buttons/button/button-new.component';
import { SearchBarComponent } from '../../shared/components/UI/search-bar/search-bar.component';
import { EstatusComponent } from '../../shared/components/UI/Filter/estatus/estatus.component';
import {ButtonLayoutComponent} from '../../shared/components/layout/button-layout/button-layout.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientesPageRoutingModule,
    SiderbarComponent,
    HeaderComponent,
    ButtonNewComponent,
    SearchBarComponent,
    EstatusComponent,
    ButtonLayoutComponent,
  ],
})
export class ClientesPageModule { }
