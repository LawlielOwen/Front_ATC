import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {Asesor} from "../../shared/model/asesor.model"; 
@Injectable({
  providedIn: 'root',
})
export class Login {
  private apiUrl = environment.apiurl;
  private user:Asesor[] = [];
  constructor(private http: HttpClient) {}
  loginUser(username: string, password: string) {
   const body = {
      usuario: username,    
      contra: password  
    };

   
    return this.http.post(`${this.apiUrl}/login`, body);
  }
}
