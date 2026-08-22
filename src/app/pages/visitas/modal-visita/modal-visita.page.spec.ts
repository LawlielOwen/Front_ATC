import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalVisitaPage } from './modal-visita.page';

describe('ModalVisitaPage', () => {
  let component: ModalVisitaPage;
  let fixture: ComponentFixture<ModalVisitaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalVisitaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
