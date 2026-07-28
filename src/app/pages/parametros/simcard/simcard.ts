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
  private readonly apiUrl = 'http://localhost:3000/api/tiposim';

  modalAbierto = false;
  tiposim: TipoSimItem[] = [];
  tipoEditando: TipoSimItem | null = null;
  puedeModificar = false;

  nuevoTipo: TipoSimItem = { descripcion: '' };

  constructor(
    private http: HttpClient,
    private authService: AuthService, 
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    this.cargarTiposSim();
  }

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

  abrirModal() {
    if (!this.puedeModificar) return; 
    this.resetForm();
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  editarTipoSim(tipo: TipoSimItem) {
    if (!this.puedeModificar) return; 
    this.tipoEditando = tipo;
    this.nuevoTipo = { descripcion: tipo.descripcion };
    this.modalAbierto = true;
  }

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

  guardarTipoSim() {
    if (!this.puedeModificar) return; 

    const descLimpia = this.nuevoTipo.descripcion.trim();
    if (!descLimpia) {
      alert('Completa la descripción');
      return;
    }

    const payload = { descripcion: descLimpia };

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

  resetForm() {
    this.nuevoTipo = { descripcion: '' };
    this.tipoEditando = null;
  }
}