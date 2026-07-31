import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { AuthService } from '../../../services/auth.service';

// Modulos PrimeNG
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-capacidad',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Header,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './capacidad.html',
  styleUrls: ['./capacidad.css']
})
export class Capacidad implements OnInit {
  // Estado del modal y listados
  modalAbierto = false;
  capacidades: any[] = [];
  capacidadEditando: any = null;
  puedeModificar = false;

  // Modelo del formulario
  nuevaCapacidad = {
    descripcion: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Revisa si es administrador y carga la lista
    this.puedeModificar = this.authService.esAdmin();
    this.cargarCapacidades();
  }

  // Trae las capacidades del servidor
  cargarCapacidades() {
    this.http.get<any[]>('http://localhost:3000/api/capacidad').subscribe({
      next: (data) => {
        this.capacidades = data;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al cargar capacidades:', err)
    });
  }

  // Abre el modal para crear
  abrirModal() {
    if (!this.puedeModificar) return;
    this.resetForm();
    this.modalAbierto = true;
  }

  // Cierra el modal y limpia datos
  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  // Carga datos en el modal para editar
  editarCapacidad(capacidad: any) {
    if (!this.puedeModificar) return;
    this.capacidadEditando = capacidad;
    this.nuevaCapacidad = {
      descripcion: capacidad.descripcion
    };
    this.modalAbierto = true;
  }

  // Elimina un registro
  eliminarCapacidad(capacidad: any) {
    if (!this.puedeModificar) return;
    if (!confirm(`¿Eliminar la capacidad ${capacidad.descripcion}?`)) return;

    this.http.delete(`http://localhost:3000/api/capacidad/${capacidad.id_capacidad}`).subscribe({
      next: () => this.cargarCapacidades(),
      error: (err) => alert(err.error?.message || 'Error al eliminar capacidad')
    });
  }

  // Guarda o actualiza un registro
  guardarCapacidad() {
    if (!this.puedeModificar) return;
    if (!this.nuevaCapacidad.descripcion.trim()) {
      alert('Completa la descripción');
      return;
    }

    const payload = { descripcion: this.nuevaCapacidad.descripcion };

    // Crea un nuevo registro
    if (!this.capacidadEditando) {
      this.http.post('http://localhost:3000/api/capacidad', payload).subscribe({
        next: () => {
          this.cargarCapacidades();
          this.cerrarModal();
        },
        error: (err) => alert(err.error?.message || 'Fallo al crear capacidad.')
      });
    } else {
      // Actualiza un registro existente
      this.http.put(`http://localhost:3000/api/capacidad/${this.capacidadEditando.id_capacidad}`, payload).subscribe({
        next: () => {
          this.cargarCapacidades();
          this.cerrarModal();
        },
        error: (err) => alert(err.error?.message || 'Fallo al actualizar capacidad.')
      });
    }
  }

  // Limpia los campos del formulario
  resetForm() {
    this.nuevaCapacidad = { descripcion: '' };
    this.capacidadEditando = null;
  }
}