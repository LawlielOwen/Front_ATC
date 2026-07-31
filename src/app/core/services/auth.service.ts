import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  obtenerUsuarioActual() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
  }

  tieneAcceso(rolesPermitidos: string[]): boolean {
    const usuario = this.obtenerUsuarioActual();
    
    if (!usuario || !usuario.Rol) return false;

    return rolesPermitidos.includes(usuario.Rol);
  }
}