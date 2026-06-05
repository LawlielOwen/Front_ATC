import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class InputComponent  {
@Input() label: string = '';
  @Input() tipo: string = 'text';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  constructor() { }

@Input() value: string | number | undefined = undefined; 
  
@Output() valueChange = new EventEmitter<any>();

  actualizarValor(event: any) {
    const nuevoValor = event.target?.value;
    this.valueChange.emit(nuevoValor);
  }
}
