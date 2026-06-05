import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-container-table',
  templateUrl: './container-table.component.html',
  styleUrls: ['./container-table.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ContainerTableComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
