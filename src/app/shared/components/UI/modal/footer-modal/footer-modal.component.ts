import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import {IonicModule} from '@ionic/angular';
@Component({
  selector: 'app-footer-modal',
  templateUrl: './footer-modal.component.html',
  styleUrls: ['./footer-modal.component.scss'],
  imports: [CommonModule, IonicModule]
})
export class FooterModalComponent  implements OnInit {
@Input() paddingClass: string = 'py-3.5 px-5';
  constructor() { }

  ngOnInit() {}

}
