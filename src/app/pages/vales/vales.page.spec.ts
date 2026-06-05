import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValesPage } from './vales.page';

describe('ValesPage', () => {
  let component: ValesPage;
  let fixture: ComponentFixture<ValesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ValesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
