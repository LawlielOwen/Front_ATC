import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialESPage } from './historial-es.page';

describe('HistorialESPage', () => {
  let component: HistorialESPage;
  let fixture: ComponentFixture<HistorialESPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialESPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
