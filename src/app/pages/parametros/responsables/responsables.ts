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
  private readonly apiUrl = 'http://localhost:3000/api/responsables';

  modalAbierto = false;
  responsables: ResponsableItem[] = [];
  responsableEditando: ResponsableItem | null = null;
  puedeModificar = false;

  nuevoResponsable: ResponsableItem = { descripcion: '' };

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    this.cargarResponsables();
  }

  cargarResponsables() {
    this.http.get<ResponsableItem[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.responsables = data;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al cargar responsables:', err)
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

  editarResponsable(resp: ResponsableItem) {
    if (!this.puedeModificar) return; 
    this.responsableEditando = resp;
    this.nuevoResponsable = { descripcion: resp.descripcion };
    this.modalAbierto = true;
  }

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

  guardarResponsable() {
    if (!this.puedeModificar) return; 

    const descLimpia = this.nuevoResponsable.descripcion.trim();
    if (!descLimpia) {
      alert('Completa la descripción');
      return;
    }

    const payload = { descripcion: descLimpia };

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

  resetForm() {
    this.nuevoResponsable = { descripcion: '' };
    this.responsableEditando = null;
  }
}