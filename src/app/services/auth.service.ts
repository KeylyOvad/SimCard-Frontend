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

  setRol(id_rol: number) {
    localStorage.setItem('id_rol', id_rol.toString());
  }

  getRol(): number {
    const rol = localStorage.getItem('id_rol');
    return rol ? parseInt(rol, 10) : 2; 
  }

 
  setNombre(nombre: string) {
    localStorage.setItem('user_name', nombre);
  }

  getNombre(): string {
    return localStorage.getItem('user_name') || 'Usuario';
  }
 

  esAdmin(): boolean {
    return this.getRol() === 1;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('id_rol');
    localStorage.removeItem('user_name'); 
  }

  getUser() {
    return this.http.get('http://localhost:3000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }
}