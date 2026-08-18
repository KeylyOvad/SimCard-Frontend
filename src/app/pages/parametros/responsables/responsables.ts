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

// Estructura de datos para un responsable
export interface ResponsableItem {
  id_responsable?: number;
  descripcion: string;
}

@Component({
  selector: 'app-responsable',
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
  templateUrl: './responsables.html',
  styleUrls: ['./responsables.css']
})
export class Responsables implements OnInit {

  // Ruta base de la API
  private readonly apiUrl = `${enviroment.api}/responsables`;

  // Variables de control y datos
  modalAbierto = false;
  responsables: ResponsableItem[] = [];
  responsableEditando: ResponsableItem | null = null;
  puedeModificar = false;

  // Objeto para el formulario
  nuevoResponsable: ResponsableItem = {
    descripcion: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    this.cargarResponsables();
  }

  // Trae la lista de responsables desde la API
  cargarResponsables() {
    this.http.get<ResponsableItem[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.responsables = data;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al cargar responsables:', err)
    });
  }

  // Abre el modal para crear un nuevo responsable
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
  editarResponsable(resp: ResponsableItem) {
    if (!this.puedeModificar) return;

    this.responsableEditando = resp;
    this.nuevoResponsable = {
      descripcion: resp.descripcion
    };

    this.modalAbierto = true;
  }

  // Elimina un responsable
  eliminarResponsable(resp: ResponsableItem) {
    if (!this.puedeModificar || !resp.id_responsable) return;

    if (!confirm(`¿Eliminar al responsable: ${resp.descripcion}?`)) return;

    this.http.delete(`${this.apiUrl}/${resp.id_responsable}`).subscribe({
      next: () => this.cargarResponsables(),
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'Error al eliminar responsable';
        alert(msg);
      }
    });
  }

  // Guarda o actualiza un responsable
  guardarResponsable() {
    if (!this.puedeModificar) return;

    const descLimpia = this.nuevoResponsable.descripcion.trim();

    if (!descLimpia) {
      alert('Completa la descripción');
      return;
    }

    const payload = {
      descripcion: descLimpia
    };

    // Crear responsable
    if (!this.responsableEditando) {

      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.cargarResponsables();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al crear responsable';
          alert(msg);
        }
      });

    } else {

      // Actualizar responsable existente
      const id = this.responsableEditando.id_responsable;

      this.http.put(`${this.apiUrl}/${id}`, payload).subscribe({
        next: () => {
          this.cargarResponsables();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al actualizar responsable';
          alert(msg);
        }
      });

    }
  }

  // Limpia los datos del formulario
  resetForm() {
    this.nuevoResponsable = {
      descripcion: ''
    };

    this.responsableEditando = null;
  }
}
