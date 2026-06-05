import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
constructor(private router: Router) {}

    canActivate(): boolean {
        const userData = localStorage.getItem('user');
        if (userData) {
      const user = JSON.parse(userData);
      
      if (user.Rol === 'Administrador') {
        return true;
      }
      
    }
        this.router.navigate(['/login']);
        return false;
    }
}