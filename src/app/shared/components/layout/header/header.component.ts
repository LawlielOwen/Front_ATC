import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { IonPopover } from '@ionic/angular';
import { NotificationsComponent } from './notifications/notifications.component';
import { OptionUserComponent } from './option-user/option-user.component';
import { Output, EventEmitter } from '@angular/core';
export interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterModule, IonicModule, NotificationsComponent, OptionUserComponent]
})
export class HeaderComponent implements OnInit {
  @Output() toggleMenu = new EventEmitter<void>();
  public breadcrumbs: Breadcrumb[] = [];
  public rutaInicio: string = '/dashboard';
  constructor(private router: Router, private popoverCtrl: PopoverController) {
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.breadcrumbs = this.buildBreadcrumbs(event.urlAfterRedirects);
    });
  }

  ngOnInit() {
    this.definirRutaInicio();
    this.breadcrumbs = this.buildBreadcrumbs(this.router.url);
  }
 abrirMenu() {
    this.toggleMenu.emit();
  }
  private buildBreadcrumbs(url: string): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [];
    const urlWithoutParams = url.split('?')[0];
    const pathSegments = urlWithoutParams.split('/').filter(s => s !== '');
    let currentUrl = '';
    for (const segment of pathSegments) {
      currentUrl += `/${segment}`;
      breadcrumbs.push({ label: this.formatLabel(segment), url: currentUrl });
    }
    return breadcrumbs;
  }

  private formatLabel(segment: string): string {
    return segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
 definirRutaInicio() {
   const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      switch (user.Rol) {
        case 'Administrador':
          this.rutaInicio = '/dashboard';
          break;
        case 'Cotizador':
            this.rutaInicio = '/Cotizaciones';
          break;
        case 'Asesor':
          this.rutaInicio = '/Clientes';
          break;
        case 'Almacen':
          this.rutaInicio = '/productos';
          break;
        default:
          this.rutaInicio = '/dashboard'; 
          break;
      }
    }
}
}