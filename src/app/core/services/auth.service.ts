import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Esto lo hace disponible en toda la aplicación
})
export class AuthService {

  constructor() { }

  // 1. Obtenemos el usuario directamente cuando se necesite
  obtenerUsuarioActual() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  // 2. Tu función exacta, pero ahora vive aquí
  tieneAcceso(rolesPermitidos: string[]): boolean {
    const user = this.obtenerUsuarioActual();
    
    if (!user || !user.Rol) {
      return false;
    }
    
    return rolesPermitidos.includes(user.Rol);
  }
  
}