import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import {HeaderComponent} from '../../shared/components/layout/header/header.component';
import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { DashboardPage } from './dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    SiderbarComponent,
    HeaderComponent,
  ],

})
export class DashboardPageModule {}
