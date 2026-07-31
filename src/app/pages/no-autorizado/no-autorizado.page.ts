import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-autorizado',
  templateUrl: './no-autorizado.page.html',
  styleUrls: ['./no-autorizado.page.scss'],
  standalone: true,
})
export class NoAutorizadoPage implements OnInit {

  constructor(private router: Router) {}

  volverAlLogin(): void {
    localStorage.removeItem('token'); 
    
    this.router.navigate(['/login']);
  }

  ngOnInit() {
  }
}