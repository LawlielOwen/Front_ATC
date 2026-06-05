import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() count: string | number = 0;
  @Input() subtext: string = '';
  
  @Input() accentColor: string = '#1D9E75'; 
  

  @Input() subtextClass: string = 'text-slate-500'; 
}