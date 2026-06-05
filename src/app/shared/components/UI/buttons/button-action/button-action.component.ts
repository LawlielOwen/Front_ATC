import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-button-action',
  templateUrl: './button-action.component.html',
  styleUrls: ['./button-action.component.scss'],
    imports: [CommonModule, IonicModule],
})
export class ButtonActionComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}
@Input() label: string = '';
  @Input() claseCss: string = 'btn-cerrar';
  @Input() expandir: string | undefined = undefined; 
  @Input() esEliminar: boolean = false; 
  @Input() estatus: number | undefined = undefined;
  @Input() disabled: boolean = false;
}
