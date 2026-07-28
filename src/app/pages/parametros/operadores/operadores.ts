import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { AuthService } from '../../../services/auth.service';

// Importaciones de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

export interface OperadorItem {
  id_operador?: number;
  descripcion: string;
}

@Component({
  selector: 'app-operadores',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    Header,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './operadores.html',
  styleUrls: ['./operadores.css']
})
export class Operadores implements OnInit {
  private readonly apiUrl = 'http://localhost:3000/api/operadores';

  modalAbierto = false;
  operadores: OperadorItem[] = [];
  operadorEditando: OperadorItem | null = null;
  puedeModificar = false;

  nuevoOperador: OperadorItem = { descripcion: '' };

  constructor(
    private http: HttpClient,
    private authService: AuthService, 
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    this.cargarOperadores();
  }

  cargarOperadores() {
    this.http.get<OperadorItem[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.operadores = data;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar operadores:', err);
      }
    });
  }

  abrirModal() {
    if (!this.puedeModificar) return; 
    this.resetForm();
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  editarOperador(operador: OperadorItem) {
    if (!this.puedeModificar) return; 
    this.operadorEditando = operador;
    this.nuevoOperador = { descripcion: operador.descripcion };
    this.modalAbierto = true;
  }

  eliminarOperador(operador: OperadorItem) {
    if (!this.puedeModificar || !operador.id_operador) return; 
    if (!confirm(`¿Eliminar operador: ${operador.descripcion}?`)) return;

    this.http.delete(`${this.apiUrl}/${operador.id_operador}`).subscribe({
      next: () => this.cargarOperadores(),
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'Error al eliminar operador';
        alert(msg);
      }
    });
  }

  guardarOperador() {
    if (!this.puedeModificar) return; 

    const descLimpia = this.nuevoOperador.descripcion.trim();
    if (!descLimpia) {
      alert('Completa la descripción');
      return;
    }

    const payload = { descripcion: descLimpia };

    if (!this.operadorEditando) {
      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.cargarOperadores();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al crear operador';
          alert(msg);
        }
      });
    } else {
      const id = this.operadorEditando.id_operador;
      this.http.put(`${this.apiUrl}/${id}`, payload).subscribe({
        next: () => {
          this.cargarOperadores();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al actualizar operador';
          alert(msg);
        }
      });
    }
  }

  resetForm() {
    this.nuevoOperador = { descripcion: '' };
    this.operadorEditando = null;
  }
}