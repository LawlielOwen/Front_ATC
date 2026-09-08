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
          console.log("🔍 1. Payload completo del token:", payload); // Veremos qué trae exactamente
        } catch (error) {
          console.error("❌ Error al procesar la autenticación.");
          return;
        }

        // ATRAE EL ROL SIN IMPORTAR SI VIENE EN MAYÚSCULA O MINÚSCULA
        const rolUsuario = payload.rol || payload.Rol || payload.ROL;
        console.log("🔍 2. Rol extraído para el switch:", rolUsuario);

        if (!rolUsuario) {
          console.error("❌ 3. EL ROL ESTÁ VACÍO. Borrando token y deteniendo redirección.");
          localStorage.removeItem('token');
          toast.warning('Tu cuenta está en revisión. Un administrador debe activarla.');
          return; 
        }
        
        console.log("✅ 4. Rol válido. Intentando redirigir al Router...");

        // Usamos .then() para ver si el Guard está bloqueando el paso
        switch (rolUsuario) {
          case 'Administrador':
            this.router.navigate(['/dashboard']).then(exito => {
              if(!exito) console.error("🛑 EL AUTHGUARD BLOQUEÓ LA ENTRADA AL DASHBOARD");
            });
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
            console.error("❌ 5. El rol no coincide con ninguno del Switch:", rolUsuario);
            toast.error('Tu rol no tiene una pantalla asignada.'); 
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