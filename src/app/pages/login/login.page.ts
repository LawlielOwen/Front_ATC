import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {Router} from '@angular/router';
import { Login } from '../../core/services/login.service';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule,RouterModule],
})
  
export class LoginPage implements OnInit {
username: string = '';
password: string = '';
mostrarContra: boolean = false;
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
        const rolUsuario = asesorData.rol || asesorData.Rol;

        if (!rolUsuario) {
          toast.warning('Tu cuenta está en revisión. Un administrador debe activarla y asignarte un rol para poder ingresar.');
          return; 
        }

        localStorage.setItem('token', response.token); 
        localStorage.setItem('user', JSON.stringify({
          id: asesorData.id,
          Nombre: asesorData.nombre || asesorData.Nombre, 
          app: asesorData.app,
          apm: asesorData.apm,
          Rol: rolUsuario,
          Correo: asesorData.correo || asesorData.Correo 
        }));
        
        switch (rolUsuario) {
          case 'Administrador':
            this.router.navigate(['/dashboard']);
            break;
            
          case 'Cotizador':   
            this.router.navigate(['/cotizaciones']);
            break;
            
          case 'Almacen':
          case 'Asesor':
            this.router.navigate(['/productos']);
            break; 
            
          default:
            toast.error('Tu rol no tiene una pantalla asignada. Contacta a soporte.'); 
            break;
        }
      },
      (error) => {
        console.error('Error de login:', error);
        const mensajeError = error.error?.error || 'Usuario o contraseña incorrectos';
        toast.error(mensajeError);
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
