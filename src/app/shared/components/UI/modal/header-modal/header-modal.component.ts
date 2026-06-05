import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IonicModule} from '@ionic/angular';
@Component({
  selector: 'app-header-modal',
  templateUrl: './header-modal.component.html',
  styleUrls: ['./header-modal.component.scss'],
  imports: [CommonModule, IonicModule]
})
export class HeaderModalComponent  implements OnInit {
@Input() label: string = '';
  constructor() { }

  ngOnInit() {}

}
