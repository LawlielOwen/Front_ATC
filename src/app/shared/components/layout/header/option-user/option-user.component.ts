import { Component, OnInit, ViewChild} from '@angular/core';
import { IonPopover } from '@ionic/angular';
import { IonicModule} from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-option-user',
  templateUrl: './option-user.component.html',
  styleUrls: ['./option-user.component.scss'],
    standalone: true,
  imports: [IonicModule]
})
export class OptionUserComponent implements OnInit {
  usuario: any;
  iniciales: string = '';
    @ViewChild('popover') popover!: IonPopover;
public uniqueTriggerId = 'user-trigger-' + Math.random().toString(36).substring(2, 9);
  constructor(private router: Router) { }

ngOnInit() {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        this.usuario = JSON.parse(jsonPayload);
        
        const letraNombre = this.usuario?.Nombre?.charAt(0) || '';
        const letraApp = this.usuario?.app?.charAt(0) || '';
        this.iniciales = letraNombre + letraApp;
      } catch (error) {
        console.error('Error al decodificar el token', error);
      }
    }
}
   async logOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
      await this.popover.dismiss();
    this.router.navigate(['/login']);
  }
  
}
