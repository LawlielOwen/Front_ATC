import { Component, OnInit } from '@angular/core';
import { SessionService } from './core/services/Session.Service'; 

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  constructor(private sessionService: SessionService) {}

  ngOnInit() {
  
    const token = localStorage.getItem('token');
    if (token) {
      this.sessionService.programarExpiracion(token);
    }
  }
}