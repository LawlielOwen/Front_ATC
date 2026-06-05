import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesValePage } from './detalles-vale.page';

describe('DetallesValePage', () => {
  let component: DetallesValePage;
  let fixture: ComponentFixture<DetallesValePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesValePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
