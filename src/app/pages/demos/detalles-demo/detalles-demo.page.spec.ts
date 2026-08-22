import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesDemoPage } from './detalles-demo.page';

describe('DetallesDemoPage', () => {
  let component: DetallesDemoPage;
  let fixture: ComponentFixture<DetallesDemoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesDemoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
