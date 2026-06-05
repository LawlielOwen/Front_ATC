import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CardDetailsComponent  implements OnInit {
@Input() titulo: string = '';
  constructor() { }

  ngOnInit() {}

}
