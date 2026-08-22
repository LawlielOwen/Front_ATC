import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleVisitaPage } from './detalle-visita.page';

describe('DetalleVisitaPage', () => {
  let component: DetalleVisitaPage;
  let fixture: ComponentFixture<DetalleVisitaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleVisitaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
