import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExistenciasPage } from './existencias.page';

describe('ExistenciasPage', () => {
  let component: ExistenciasPage;
  let fixture: ComponentFixture<ExistenciasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistenciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
