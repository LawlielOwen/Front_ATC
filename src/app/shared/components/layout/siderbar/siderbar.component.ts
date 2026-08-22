import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-siderbar',
  templateUrl: './siderbar.component.html',
  styleUrls: ['./siderbar.component.scss'],
  standalone: true,
  imports: [ IonicModule, RouterModule, CommonModule ]
})
export class SiderbarComponent implements OnInit {
  public isMobileMenuOpen: boolean = false;
  user: any;
  menuProductosAbierto = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleMenuProductos(event: Event): void {
    event.stopPropagation();
    this.menuProductosAbierto = !this.menuProductosAbierto;
  }

  get productosGrupoActivo(): boolean {
    return this.router.url.includes('/productos')
      || this.router.url.includes('/demos')
      || this.router.url.includes('/visitas');
  }
}