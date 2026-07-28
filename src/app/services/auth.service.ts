import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      correo: email,
      password: password
    });
  }

  // --- Manejo del Token ---
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Verificar si existe una sesión activa
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // --- Manejo de Rol ---
  setRol(id_rol: number): void {
    localStorage.setItem('id_rol', id_rol.toString());
  }

  getRol(): number {
    const rol = localStorage.getItem('id_rol');
    return rol ? parseInt(rol, 10) : 2; 
  }

  esAdmin(): boolean {
    return this.getRol() === 1;
  }

  // --- Manejo de Nombre de Usuario ---
  setNombre(nombre: string): void {
    localStorage.setItem('user_name', nombre);
  }

  getNombre(): string {
    return localStorage.getItem('user_name') || 'Usuario';
  }

  // --- Cierre de Sesión ---
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('id_rol');
    localStorage.removeItem('user_name');
  }

  // --- Perfil del Usuario Autenticado ---
  getUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }
}