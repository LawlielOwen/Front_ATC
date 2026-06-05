import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PaginationComponent {
  
  @Input() paginaActual: number = 1;
  @Input() totalPaginas: number = 1;

  @Output() onPageChange = new EventEmitter<number>();

  constructor() { }

  get paginas(): number[] {
    const pages = [];
    const maxPagesToShow = 3; 
  
    let startPage = Math.max(1, this.paginaActual - 2);
    let endPage = Math.min(this.totalPaginas, startPage + maxPagesToShow - 1);
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Llenamos el arreglo con los números calculados
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaActual) {
      this.onPageChange.emit(pagina);
    }
  }
}