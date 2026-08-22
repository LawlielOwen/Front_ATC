import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompletarVisitaPage } from './completar-visita.page';

describe('CompletarVisitaPage', () => {
  let component: CompletarVisitaPage;
  let fixture: ComponentFixture<CompletarVisitaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletarVisitaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
