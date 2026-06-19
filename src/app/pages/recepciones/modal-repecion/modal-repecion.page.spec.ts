import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalRepecionPage } from './modal-repecion.page';

describe('ModalRepecionPage', () => {
  let component: ModalRepecionPage;
  let fixture: ComponentFixture<ModalRepecionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRepecionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
