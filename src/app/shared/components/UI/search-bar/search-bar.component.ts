import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SearchBarComponent implements OnInit {
  @Input() placeholder: string = 'Buscar...';
  
  @Output() onSearch = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {}

  emitirBusqueda(event: any) {
    const texto = event.target.value;
    this.onSearch.emit(texto); 
  }
}