import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { AuthService } from '../../../services/auth.service';

// Modulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

// Estructura de datos para operador
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
  // Ruta de la API para operadores
  private readonly apiUrl = 'http://localhost:3000/api/operadores';

  // Variables de control y listas
  modalAbierto = false;
  operadores: OperadorItem[] = [];
  operadorEditando: OperadorItem | null = null;
  puedeModificar = false;

  // Objeto para el formulario
  nuevoOperador: OperadorItem = { descripcion: '' };

  constructor(
    private http: HttpClient,
    private authService: AuthService, 
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Revisa si es administrador y carga la lista
    this.puedeModificar = this.authService.esAdmin();
    this.cargarOperadores();
  }

  // Trae los operadores desde el servidor
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

  // Abre el modal para crear operador
  abrirModal() {
    if (!this.puedeModificar) return; 
    this.resetForm();
    this.modalAbierto = true;
  }

  // Cierra el modal y limpia campos
  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  // Carga datos de un operador en el modal para editar
  editarOperador(operador: OperadorItem) {
    if (!this.puedeModificar) return; 
    this.operadorEditando = operador;
    this.nuevoOperador = { descripcion: operador.descripcion };
    this.modalAbierto = true;
  }

  // Elimina un operador
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

  // Guarda o actualiza la informacion del operador
  guardarOperador() {
    if (!this.puedeModificar) return; 

    const descLimpia = this.nuevoOperador.descripcion.trim();
    if (!descLimpia) {
      alert('Completa la descripción');
      return;
    }

    const payload = { descripcion: descLimpia };

    if (!this.operadorEditando) {
      // Registrar nuevo operador
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
      // Actualizar operador existente
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

  // Restablece el formulario a valores iniciales
  resetForm() {
    this.nuevoOperador = { descripcion: '' };
    this.operadorEditando = null;
  }
}