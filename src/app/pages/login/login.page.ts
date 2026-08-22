import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Login } from '../../core/services/login.service';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, RouterModule],
})
export class LoginPage implements OnInit {
  username: string = '';
  password: string = '';
  mostrarContra: boolean = false;

  constructor(private router: Router, private loginService: Login) { }

  ngOnInit() { }

 login() {
    this.username = this.sanitizarUsername(this.username);
    
    if (this.camposVacios(this.username, this.password)) {
      return;
    }

    this.loginService.loginUser(this.username, this.password).subscribe(
      (response: any) => {
        
        localStorage.setItem('token', response.token); 

        let payload;
        try {
          payload = JSON.parse(atob(response.token.split('.')[1]));
        } catch (error) {
          toast.error('Error al procesar la autenticación.');
          return;
        }

        const rolUsuario = payload.Rol;

        if (!rolUsuario) {
          localStorage.removeItem('token');
          toast.warning('Tu cuenta está en revisión. Un administrador debe activarla y asignarte un rol para poder ingresar.');
          return; 
        }
        
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
            
          case 'Soporte Tecnico': 
            this.router.navigate(['/clientes']);
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