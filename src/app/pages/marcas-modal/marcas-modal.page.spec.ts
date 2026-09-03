import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarcasModalPage } from './marcas-modal.page';

describe('MarcasModalPage', () => {
  let component: MarcasModalPage;
  let fixture: ComponentFixture<MarcasModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MarcasModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
