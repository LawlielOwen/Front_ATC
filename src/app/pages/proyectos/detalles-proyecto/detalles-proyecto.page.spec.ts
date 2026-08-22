import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesProyectoPage } from './detalles-proyecto.page';

describe('DetallesProyectoPage', () => {
  let component: DetallesProyectoPage;
  let fixture: ComponentFixture<DetallesProyectoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesProyectoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
