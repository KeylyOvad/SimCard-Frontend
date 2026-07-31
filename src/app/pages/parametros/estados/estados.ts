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

// Estructura de datos para estado
export interface EstadoItem {
  id_estado?: number;
  descripcion: string;
}

@Component({
  selector: 'app-estado',
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
  templateUrl: './estados.html',
  styleUrls: ['./estados.css']
})
export class Estado implements OnInit {
  // Ruta base del servidor
  private readonly apiUrl = 'http://localhost:3000/api/estados';

  // Variables de control y datos
  modalAbierto = false;
  estados: EstadoItem[] = [];
  estadoEditando: EstadoItem | null = null;
  puedeModificar = false;

  // Objeto para el formulario
  nuevoEstado: EstadoItem = { descripcion: '' };

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Revisa si es admin y carga la lista
    this.puedeModificar = this.authService.esAdmin();
    this.cargarEstados();
  }

  // Trae los estados desde la API
  cargarEstados() {
    this.http.get<EstadoItem[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.estados = data;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al cargar estados:', err)
    });
  }

  // Abre el modal para crear
  abrirModal() {
    if (!this.puedeModificar) return; 
    this.resetForm();
    this.modalAbierto = true;
  }

  // Cierra el modal y limpia el formulario
  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  // Carga los datos en el modal para editar
  editarEstado(est: EstadoItem) {
    if (!this.puedeModificar) return; 
    this.estadoEditando = est;
    this.nuevoEstado = { descripcion: est.descripcion };
    this.modalAbierto = true;
  }

  // Elimina un estado
  eliminarEstado(est: EstadoItem) {
    if (!this.puedeModificar || !est.id_estado) return; 
    if (!confirm(`¿Eliminar el estado: ${est.descripcion}?`)) return;

    this.http.delete(`${this.apiUrl}/${est.id_estado}`).subscribe({
      next: () => this.cargarEstados(),
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'Error al eliminar estado';
        alert(msg);
      }
    });
  }

  // Guarda o actualiza un estado
  guardarEstado() {
    if (!this.puedeModificar) return; 

    const descLimpia = this.nuevoEstado.descripcion.trim();
    if (!descLimpia) {
      alert('Completa la descripción');
      return;
    }

    const payload = { descripcion: descLimpia };

    // Si es un estado nuevo
    if (!this.estadoEditando) {
      this.http.post(this.apiUrl, payload).subscribe({
        next: () => { 
          this.cargarEstados(); 
          this.cerrarModal(); 
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al crear estado';
          alert(msg);
        }
      });
    } else {
      // Si se esta editando uno existente
      const id = this.estadoEditando.id_estado;
      this.http.put(`${this.apiUrl}/${id}`, payload).subscribe({
        next: () => { 
          this.cargarEstados(); 
          this.cerrarModal(); 
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al actualizar estado';
          alert(msg);
        }
      });
    }
  }

  // Limpia los datos del formulario
  resetForm() {
    this.nuevoEstado = { descripcion: '' };
    this.estadoEditando = null;
  }
}