import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NumCotPage } from './num-cot.page';

describe('NumCotPage', () => {
  let component: NumCotPage;
  let fixture: ComponentFixture<NumCotPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NumCotPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
