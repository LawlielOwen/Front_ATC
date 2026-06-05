import { Component, OnInit, ViewChild } from '@angular/core';
import {SiderbarComponent} from '../../shared/components/layout/siderbar/siderbar.component';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { NgxSonnerToaster } from 'ngx-sonner';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, SiderbarComponent, HeaderComponent, NgxSonnerToaster]
})
export class DashboardPage implements OnInit {
@ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;
  constructor() { }

  ngOnInit() {
  }
mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }
}
