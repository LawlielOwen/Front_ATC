import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FolioValePage } from './folio-vale.page';

describe('FolioValePage', () => {
  let component: FolioValePage;
  let fixture: ComponentFixture<FolioValePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FolioValePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
