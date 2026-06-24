import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubirReciboPage } from './subir-recibo.page';

describe('SubirReciboPage', () => {
  let component: SubirReciboPage;
  let fixture: ComponentFixture<SubirReciboPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubirReciboPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
