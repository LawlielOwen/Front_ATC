import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalVincularClientePage } from './modal-vincular-cliente.page';

describe('ModalVincularClientePage', () => {
  let component: ModalVincularClientePage;
  let fixture: ComponentFixture<ModalVincularClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalVincularClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
