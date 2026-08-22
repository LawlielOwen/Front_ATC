import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalDemoPage } from './modal-demo.page';

describe('ModalDemoPage', () => {
  let component: ModalDemoPage;
  let fixture: ComponentFixture<ModalDemoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDemoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
