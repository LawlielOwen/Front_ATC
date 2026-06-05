import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CountComponent  implements OnInit {
@Input() label: string = 'Total';
  @Input() count: number = 0;
  @Input() accentColor?: string;    
@Input() iconBg?: string; 
  constructor() { }

  ngOnInit() {}

}
