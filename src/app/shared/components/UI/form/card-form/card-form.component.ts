import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-card-form',
  templateUrl: './card-form.component.html',
  styleUrls: ['./card-form.component.scss'],
})
export class CardFormComponent  implements OnInit {
@Input() title: string = '';
  constructor() { }

  ngOnInit() {}

}
