import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ButtonLayoutComponent } from '../../shared/components/layout/button-layout/button-layout.component';
import { ButtonNewComponent } from '../../shared/components/UI/buttons/button/button-new.component';
import { SearchBarComponent } from '../../shared/components/UI/search-bar/search-bar.component';
import { SearchLayoutComponent } from '../../shared/components/layout/search-layout/search-layout.component';
import { EstatusComponent } from '../../shared/components/UI/Filter/estatus/estatus.component';
import { CountComponent } from '../../shared/components/UI/count/count.component'
import { ContainerTableComponent } from '../../shared/components/layout/container-table/container-table.component';
import { PaginationComponent } from '../../shared/components/UI/pagination/pagination.component';
import { FiltroDinamicoComponent } from '../../shared/components/UI/Filter/filtro-dinamico/filtro-dinamico.component';
import { TableComponent, TableColumn } from '../../shared/components/UI/table/table.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../shared/components/UI/modal/delete/delete.component';
import { toast } from 'ngx-sonner';
@Component({
  selector: 'app-cotizaciones',
  templateUrl: './cotizaciones.page.html',
  styleUrls: ['./cotizaciones.page.scss'],
  standalone: true,
  imports: [IonicModule, SiderbarComponent, HeaderComponent, NgxSonnerToaster, ButtonLayoutComponent,
    ButtonNewComponent, CountComponent, ContainerTableComponent,
  ]
})
export class CotizacionesPage implements OnInit {
    @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }
  constructor() { }

  ngOnInit() {
  }

}
