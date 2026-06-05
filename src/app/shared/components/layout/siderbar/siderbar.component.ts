import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-siderbar',
  templateUrl: './siderbar.component.html',
  styleUrls: ['./siderbar.component.scss'],
  standalone: true,
  imports: [ IonicModule, RouterModule, CommonModule ]
})
export class SiderbarComponent  implements OnInit {
public isMobileMenuOpen: boolean = false;
user: any;
  constructor() { }

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }
toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  tieneAcceso(rolesPermitidos: string[]): boolean {
    if (!this.user || !this.user.Rol) {
      return false;
    }
    return rolesPermitidos.includes(this.user.Rol);
  }
}
