import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalTicketPage } from './modal-ticket.page';

describe('ModalTicketPage', () => {
  let component: ModalTicketPage;
  let fixture: ComponentFixture<ModalTicketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTicketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
