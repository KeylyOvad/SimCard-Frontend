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

// Estructura de datos para un tipo de SIM
export interface TipoSimItem {
  id_tiposim?: number;
  descripcion: string;
}

@Component({
  selector: 'app-tiposim',
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
  templateUrl: './simcard.html',
  styleUrls: ['./simcard.css']
})
export class TipoSim implements OnInit {

  // Ruta base de la API
  private readonly apiUrl = `${enviroment.api}/tiposim`;

  // Variables de control y datos
  modalAbierto = false;
  tiposim: TipoSimItem[] = [];
  tipoEditando: TipoSimItem | null = null;
  puedeModificar = false;

  // Objeto para el formulario
  nuevoTipo: TipoSimItem = {
    descripcion: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    this.cargarTiposSim();
  }

  // Trae la lista de tipos de SIM desde la API
  cargarTiposSim() {
    this.http.get<TipoSimItem[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.tiposim = data;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar tipos de SIM:', err);
      }
    });
  }

  // Abre el modal para crear un nuevo tipo
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
  editarTipoSim(tipo: TipoSimItem) {
    if (!this.puedeModificar) return;

    this.tipoEditando = tipo;
    this.nuevoTipo = {
      descripcion: tipo.descripcion
    };

    this.modalAbierto = true;
  }

  // Elimina un tipo de SIM
  eliminarTipoSim(tipo: TipoSimItem) {
    if (!this.puedeModificar || !tipo.id_tiposim) return;

    if (!confirm(`¿Eliminar tipo de SIM: ${tipo.descripcion}?`)) return;

    this.http.delete(`${this.apiUrl}/${tipo.id_tiposim}`).subscribe({
      next: () => this.cargarTiposSim(),
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'Error al eliminar tipo SIM';
        alert(msg);
      }
    });
  }

  // Guarda o actualiza un tipo de SIM
  guardarTipoSim() {
    if (!this.puedeModificar) return;

    const descLimpia = this.nuevoTipo.descripcion.trim();

    if (!descLimpia) {
      alert('Completa la descripción');
      return;
    }

    const payload = {
      descripcion: descLimpia
    };

    // Crear nuevo tipo
    if (!this.tipoEditando) {

      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.cargarTiposSim();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al crear tipo SIM';
          alert(msg);
        }
      });

    } else {

      // Actualizar tipo existente
      const id = this.tipoEditando.id_tiposim;

      this.http.put(`${this.apiUrl}/${id}`, payload).subscribe({
        next: () => {
          this.cargarTiposSim();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al actualizar tipo SIM';
          alert(msg);
        }
      });

    }
  }

  // Limpia los datos del formulario
  resetForm() {
    this.nuevoTipo = {
      descripcion: ''
    };

    this.tipoEditando = null;
  }
}