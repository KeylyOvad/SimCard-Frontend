import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  constructor(private http: HttpClient) {}

login(email: string, password: string) {
   return this.http.post(`${this.apiUrl}/login`, {
   correo: email,
   password: password
 });
}
setToken(token: string) {
   localStorage.setItem('token', token);
}
getToken() {
   return localStorage.getItem('token');
  }
logout() {
  localStorage.removeItem('token');
}

getUser() {
   return this.http.get('http://localhost:3000/api/auth/me', {
   headers: {
      Authorization: `Bearer ${this.getToken()}`
      }
  });
}
}
