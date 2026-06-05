import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-estatus',
  templateUrl: './estatus.component.html',
  styleUrls: ['./estatus.component.scss'],
})
export class EstatusComponent  implements OnInit {
  @Input() estatus: number = 1;

  constructor() { }

  ngOnInit() {}

  textos: Record<number, string> = {
    1: 'Activo',
    0: 'Inactivo'
  };

  clasesContenedor: Record<number, string> = {
    1: 'estatus-pill',
    0: 'estatus-pill-inactivo'
  };

  clasesBolita: Record<number, string> = {
    1: 'bolita bolita-activa',
    0: 'bolita bolita-inactiva'
  };
}