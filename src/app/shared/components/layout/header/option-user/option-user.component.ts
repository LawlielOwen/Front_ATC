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
    const userData = localStorage.getItem('user');
    if (userData) {
      this.usuario = JSON.parse(userData);
      this.iniciales = this.usuario.Nombre.charAt(0) + this.usuario.app.charAt(0);
    }
  } 
   async logOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
      await this.popover.dismiss();
    this.router.navigate(['/login']);
  }
  
}
