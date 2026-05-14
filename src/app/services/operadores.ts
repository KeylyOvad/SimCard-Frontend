import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Operador {
  id_operador: number;
  descripcion: string;
}

@Injectable({
   providedIn: 'root'
})

export class OperadorService {
  private apiUrl = 'http://localhost:3000/api/operadores';
  constructor(private http: HttpClient) {}

getOperadores(): Observable<Operador[]> {
   return this.http.get<Operador[]>(this.apiUrl);
  }

createOperador(operador: Partial<Operador>): Observable<any> {
    return this.http.post(this.apiUrl, operador);
 }

updateOperador(id: number, operador: Partial<Operador>): Observable<any> {
   return this.http.put(`${this.apiUrl}/${id}`, operador);
}
    deleteOperador(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
 }
}