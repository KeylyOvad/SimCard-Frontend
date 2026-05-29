import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Sim } from '../interceptors/models/sim.model';

@Injectable({
  providedIn: 'root'
})
export class SimService {
  private apiUrl = 'http://localhost:3000/api/sims';
  constructor(private http: HttpClient) {}
  getSims() {
  return this.http.get<any[]>(this.apiUrl);
}

deleteSim(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getSimById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}