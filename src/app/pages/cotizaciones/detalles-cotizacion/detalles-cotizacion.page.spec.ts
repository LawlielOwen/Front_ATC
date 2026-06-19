import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesCotizacionPage } from './detalles-cotizacion.page';

describe('DetallesCotizacionPage', () => {
  let component: DetallesCotizacionPage;
  let fixture: ComponentFixture<DetallesCotizacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesCotizacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
