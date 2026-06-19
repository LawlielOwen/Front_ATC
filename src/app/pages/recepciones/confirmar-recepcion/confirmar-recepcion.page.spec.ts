import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmarRecepcionPage } from './confirmar-recepcion.page';

describe('ConfirmarRecepcionPage', () => {
  let component: ConfirmarRecepcionPage;
  let fixture: ComponentFixture<ConfirmarRecepcionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmarRecepcionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
