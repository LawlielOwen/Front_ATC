import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class SelectComponent  {
@Input() label: string = '';
  @Input() disabled: boolean = false;
  

  @Input() value: string | number | undefined = undefined; 
  
  @Output() valueChange = new EventEmitter<string | number | undefined>();

  actualizarValor(event: any) {
    const nuevoValor = event.target?.value;
    this.valueChange.emit(nuevoValor);
  }
}
