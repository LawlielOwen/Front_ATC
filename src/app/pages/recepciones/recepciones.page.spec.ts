import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecepcionesPage } from './recepciones.page';

describe('RecepcionesPage', () => {
  let component: RecepcionesPage;
  let fixture: ComponentFixture<RecepcionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
