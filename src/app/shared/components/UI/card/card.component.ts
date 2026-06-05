import { Component, OnInit, Input } from '@angular/core';
import {EstatusComponent} from '../estatus/estatus.component';
import { Cliente } from '../../../model/clientes.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [EstatusComponent, IonicModule, CommonModule]
})
export class CardComponent  implements OnInit {

@Input() cliente!: Cliente;
  constructor() { }

  ngOnInit() {}

}
