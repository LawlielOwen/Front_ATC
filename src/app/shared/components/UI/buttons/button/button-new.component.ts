import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-button-new',
  templateUrl: './button-new.component.html',
  styleUrls: ['./button-new.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ButtonNewComponent  implements OnInit {
@Input() label: string = 'Aceptar'; // Texto por defecto
  @Input() color: string = 'primary';
  @Input() variante: string = '';

  constructor() { }

  ngOnInit() {}

}
