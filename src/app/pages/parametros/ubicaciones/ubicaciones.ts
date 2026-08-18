import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { AuthService } from '../../../services/auth.service';
import { enviroment } from '../../../../environments/environment';

// Modulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

// Estructura de datos para una ubicacion
export interface UbicacionItem {
  id_ubicacion?: number;
  descripcion: string;
}

@Component({
  selector: 'app-ubicacion',
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
  templateUrl: './ubicaciones.html',
  styleUrls: ['./ubicaciones.css']
})
export class Ubicaciones implements OnInit {

  // Ruta base de la API
  private readonly apiUrl = `${enviroment.api}/ubicaciones`;

  // Variables de control y datos
  modalAbierto = false;
  ubicaciones: UbicacionItem[] = [];
  ubicacionEditando: UbicacionItem | null = null;
  puedeModificar = false;

  // Objeto para el formulario
  nuevaUbicacion: UbicacionItem = {
    descripcion: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    this.cargarUbicaciones();
  }

  // Trae la lista de ubicaciones desde la API
  cargarUbicaciones() {
    this.http.get<UbicacionItem[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.ubicaciones = data;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al cargar ubicaciones:', err)
    });
  }

  // Abre el modal para crear una nueva ubicacion
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
  editarUbicacion(ubi: UbicacionItem) {
    if (!this.puedeModificar) return;

    this.ubicacionEditando = ubi;
    this.nuevaUbicacion = {
      descripcion: ubi.descripcion
    };

    this.modalAbierto = true;
  }

  // Elimina una ubicacion
  eliminarUbicacion(ubi: UbicacionItem) {
    if (!this.puedeModificar || !ubi.id_ubicacion) return;

    if (!confirm(`¿Eliminar la ubicación: ${ubi.descripcion}?`)) return;

    this.http.delete(`${this.apiUrl}/${ubi.id_ubicacion}`).subscribe({
      next: () => this.cargarUbicaciones(),
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'Error al eliminar ubicación';
        alert(msg);
      }
    });
  }

  // Guarda o actualiza una ubicacion
  guardarUbicacion() {
    if (!this.puedeModificar) return;

    const descLimpia = this.nuevaUbicacion.descripcion.trim();

    if (!descLimpia) {
      alert('Completa la descripción');
      return;
    }

    const payload = {
      descripcion: descLimpia
    };

    // Crear ubicación
    if (!this.ubicacionEditando) {

      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.cargarUbicaciones();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al crear ubicación';
          alert(msg);
        }
      });

    } else {

      // Actualizar ubicación existente
      const id = this.ubicacionEditando.id_ubicacion;

      this.http.put(`${this.apiUrl}/${id}`, payload).subscribe({
        next: () => {
          this.cargarUbicaciones();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al actualizar ubicación';
          alert(msg);
        }
      });

    }
  }

  // Limpia los datos del formulario
  resetForm() {
    this.nuevaUbicacion = {
      descripcion: ''
    };

    this.ubicacionEditando = null;
  }
}