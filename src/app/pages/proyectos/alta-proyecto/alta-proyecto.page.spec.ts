import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AltaProyectoPage } from './alta-proyecto.page';

describe('AltaProyectoPage', () => {
  let component: AltaProyectoPage;
  let fixture: ComponentFixture<AltaProyectoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AltaProyectoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
