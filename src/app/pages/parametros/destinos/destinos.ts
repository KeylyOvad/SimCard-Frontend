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

// Estructura de datos para destino
export interface DestinoItem {
  id_destino?: number;
  descripcion: string;
}

@Component({
  selector: 'app-destino',
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
  templateUrl: './destinos.html',
  styleUrls: ['./destinos.css']
})
export class Destino implements OnInit {

  // Ruta base de la API
  private readonly apiUrl = `${enviroment.api}/destinos`;

  // Variables de control y datos
  modalAbierto = false;
  destinos: DestinoItem[] = [];
  destinoEditando: DestinoItem | null = null;
  puedeModificar = false;

  // Objeto para el formulario
  nuevoDestino: DestinoItem = { descripcion: '' };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    this.cargarDestinos();
  }

  // Trae los destinos desde la API
  cargarDestinos() {
    this.http.get<DestinoItem[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.destinos = data;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al cargar destinos:', err)
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
  editarDestino(dest: DestinoItem) {
    if (!this.puedeModificar) return;

    this.destinoEditando = dest;
    this.nuevoDestino = {
      descripcion: dest.descripcion
    };

    this.modalAbierto = true;
  }

  // Elimina un destino
  eliminarDestino(dest: DestinoItem) {
    if (!this.puedeModificar || !dest.id_destino) return;

    if (!confirm(`¿Eliminar el destino: ${dest.descripcion}?`)) return;

    this.http.delete(`${this.apiUrl}/${dest.id_destino}`).subscribe({
      next: () => this.cargarDestinos(),
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'Error al eliminar destino';
        alert(msg);
      }
    });
  }

  // Guarda o actualiza un destino
  guardarDestino() {
    if (!this.puedeModificar) return;

    const descLimpia = this.nuevoDestino.descripcion.trim();

    if (!descLimpia) {
      alert('Completa la descripción');
      return;
    }

    const payload = {
      descripcion: descLimpia
    };

    // Crear nuevo destino
    if (!this.destinoEditando) {

      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.cargarDestinos();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al crear destino';
          alert(msg);
        }
      });

    } else {

      const id = this.destinoEditando.id_destino;

      this.http.put(`${this.apiUrl}/${id}`, payload).subscribe({
        next: () => {
          this.cargarDestinos();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al actualizar destino';
          alert(msg);
        }
      });

    }
  }

  // Limpia los datos del formulario
  resetForm() {
    this.nuevoDestino = {
      descripcion: ''
    };

    this.destinoEditando = null;
  }
}