import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'regimenFiscal',
  standalone: true
})
export class RegimenFiscalPipe implements PipeTransform {
private catRegimenes: Record<string, string> = {
    '601': 'General de Ley Personas Morales',
    '603': 'Personas Morales con Fines no Lucrativos',
    '605': 'Sueldos y Salarios e Ingresos Asimilados a Salarios',
    '606': 'Arrendamiento',
    '612': 'Personas Físicas con Actividades Empresariales y Profesionales',
    '621': 'Incorporación Fiscal',
    '626': 'Régimen Simplificado de Confianza (RESICO)'
  };

  transform(value: string | undefined | null): string {
    if (!value) return 'No especificado';
    return this.catRegimenes[value] ? `${value} - ${this.catRegimenes[value]}` : value;
  }
}
