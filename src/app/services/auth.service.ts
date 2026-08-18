import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { enviroment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ruta base de la API para autenticacion
  private apiUrl = `${enviroment.api}/auth`;
  
  constructor(private http: HttpClient) {}

  // Envia credenciales para iniciar sesion
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      correo: email,
      password: password
    });
  }

  // Guardar token en el navegador
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Obtener token guardado
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Verificar si hay una sesion activa
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Guardar ID del rol
  setRol(id_rol: number): void {
    localStorage.setItem('id_rol', id_rol.toString());
  }

  // Leer el rol descodificando el token o del almacenamiento
  getRol(): number {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id_rol ?? payload.rol ?? parseInt(localStorage.getItem('id_rol') || '2', 10);
      } catch (e) {
        return parseInt(localStorage.getItem('id_rol') || '2', 10);
      }
    }
    return 2; 
  }

  // Validar si el usuario es administrador
  esAdmin(): boolean {
    return this.getRol() === 1;
  }

  // Guardar nombre del usuario
  setNombre(nombre: string): void {
    localStorage.setItem('user_name', nombre);
  }

  // Obtener nombre del usuario
  getNombre(): string {
    return localStorage.getItem('user_name') || 'Usuario';
  }

  // Cerrar sesion y borrar datos guardados
  logout(): void {
    localStorage.clear();
  }

  // Obtener datos del perfil actual
  getUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }
}