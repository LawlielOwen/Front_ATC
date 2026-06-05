import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesClientePage } from './detalles-cliente.page';

describe('DetallesClientePage', () => {
  let component: DetallesClientePage;
  let fixture: ComponentFixture<DetallesClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
