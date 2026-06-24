import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalAsesorPage } from './modal-asesor.page';

describe('ModalAsesorPage', () => {
  let component: ModalAsesorPage;
  let fixture: ComponentFixture<ModalAsesorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAsesorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
