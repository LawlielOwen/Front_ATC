import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SelectComponent {
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() value: string | number | null | undefined = '';

  @Output() valueChange = new EventEmitter<string | number | null | undefined>();

  actualizarValor(valor: string | number | null | undefined) {
    this.valueChange.emit(valor);
  }
}