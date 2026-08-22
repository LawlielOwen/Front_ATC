import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DemosPage } from './demos.page';

describe('DemosPage', () => {
  let component: DemosPage;
  let fixture: ComponentFixture<DemosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DemosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
