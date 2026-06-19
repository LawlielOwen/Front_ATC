import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesRecepcionPage } from './detalles-recepcion.page';

describe('DetallesRecepcionPage', () => {
  let component: DetallesRecepcionPage;
  let fixture: ComponentFixture<DetallesRecepcionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesRecepcionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
