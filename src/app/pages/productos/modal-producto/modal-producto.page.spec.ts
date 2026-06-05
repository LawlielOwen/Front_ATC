import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalProductoPage } from './modal-producto.page';

describe('ModalProductoPage', () => {
  let component: ModalProductoPage;
  let fixture: ComponentFixture<ModalProductoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalProductoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
