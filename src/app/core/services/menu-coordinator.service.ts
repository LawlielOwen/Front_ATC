import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenuCoordinatorService {
  private aperturaMenu$ = new Subject<string>();
  cambios$ = this.aperturaMenu$.asObservable();

  abrir(idMenu: string) {
    this.aperturaMenu$.next(idMenu);
  }
}