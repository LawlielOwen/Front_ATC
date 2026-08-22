import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AltaDemoPage } from './alta-demo.page';

describe('AltaDemoPage', () => {
  let component: AltaDemoPage;
  let fixture: ComponentFixture<AltaDemoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AltaDemoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
