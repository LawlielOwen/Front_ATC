import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {Router} from '@angular/router';
import { Login } from '../../core/services/login.service';
import { toast, NgxSonnerToaster } from 'ngx-sonner';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
  
export class LoginPage implements OnInit {
username: string = '';
password: string = '';
  constructor(private router: Router, private loginService: Login) { }

  ngOnInit() {
  }
login() {
  this.username = this.sanitizarUsername(this.username);
  if(this.camposVacios(this.username, this.password)){
    return;
  }
    this.loginService.loginUser(this.username, this.password).subscribe(
      (response: any) => {
        const asesorData = response.asesor;
        localStorage.setItem('token', response.token); 
        localStorage.setItem('user', JSON.stringify({
          id: asesorData.id,
          Nombre: asesorData.nombre || asesorData.Nombre, 
          app: asesorData.app,
          apm: asesorData.apm,
          Rol: asesorData.rol || asesorData.Rol,
          Correo: asesorData.correo || asesorData.Correo 
        }));
        const rolUsuario = asesorData.rol || asesorData.Rol;
        switch (rolUsuario) {
      case 'Administrador':
        this.router.navigate(['/dashboard']);
        break;
        
      case 'Cotizador':   
        this.router.navigate(['/cotizaciones']);
        break;
        
      case 'Almacen':
        this.router.navigate(['/productos']);
        break;
       case 'Asesor':
        this.router.navigate(['/productos']);
        break; 
      default:
        this.router.navigate(['/login']); 
        break;
    }
      },
      (error) => {
        toast.error('Credenciales incorrectas', error);
      }
    );
  }
ionViewWillEnter() {
    this.username = "";
    this.password = "";
  }

camposVacios(username: string, password: string): boolean {
  if(username === "" || password === ""){
    toast.error('Por favor, completa todos los campos');
    return true;
  }
  
  return false; 
}
sanitizarUsername(input: string): string {
  if (!input) return '';
  let limpio = input.trim();
  limpio = limpio.replace(/<[^>]*>?/gm, '');
  limpio = limpio.replace(/['";\\]/g, '');

  return limpio;
}
}
