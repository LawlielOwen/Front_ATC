import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalValePage } from './modal-vale.page';

describe('ModalValePage', () => {
  let component: ModalValePage;
  let fixture: ComponentFixture<ModalValePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalValePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
