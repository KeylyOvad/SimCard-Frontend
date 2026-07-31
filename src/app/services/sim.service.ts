import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sim } from '../interceptors/models/sim.model';

@Injectable({
  providedIn: 'root'
})
export class SimService {

  // Rutas base para las peticiones API
  private apiUrl = 'http://localhost:3000/api/sims';
  private baseUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  //  Operaciones CRUD para SIM

  // Obtener todas las SIMs
  getSims(): Observable<Sim[]> {
    return this.http.get<Sim[]>(this.apiUrl);
  }

  // Obtener una SIM por su ID
  getSimById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Registrar una nueva SIM
  createSim(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Actualizar datos de una SIM
  updateSim(id: any, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Eliminar una SIM
  deleteSim(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Obtener el historial de cambios de una SIM
  getHistorial(id: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/historial`);
  }

  // --- Listas auxiliares para desplegables ---

  // Obtener lista de operadores
  getOperadores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/operadores`);
  }

  // Obtener lista de planes
  getPlanes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/planes`);
  }

  // Obtener lista de capacidades
  getCapacidades(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/capacidad`);
  }

  // Obtener lista de estados
  getEstados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/estados`);
  }

  // Obtener tipos de SIM
  getTiposSim(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tiposim`);
  }

  // Obtener lista de responsables
  getResponsables(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/responsables`);
  }

  // Obtener lista de ubicaciones
  getUbicaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ubicaciones`);
  }

  // Obtener lista de destinos
  getDestinos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/destinos`);
  }

  // Carga masiva y reportes 

  // Importar registros masivos desde un archivo Excel
  importarExcel(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/importar`, formData, { headers });
  }

  // Descargar el reporte general en archivo Excel
  descargarReporteExcel(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reportes/excel-general`, {
      responseType: 'blob' 
    });
  }
}