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
  modalAbierto = false;
  responsables: any[] = [];
  responsableEditando: any = null;
  puedeModificar: boolean = false;

  nuevoResponsable = { descripcion: '' };

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    console.log('¿Este usuario tiene permisos en la sección de responsables?:', this.puedeModificar);
    this.cargarResponsables();
  }

  cargarResponsables() {
    this.http.get<any[]>('http://localhost:3000/api/responsables')
      .subscribe({
        next: (data) => {
          this.responsables = data;
          this.cd.detectChanges();
        },
        error: (err) => console.error('Error al cargar responsables:', err)
      });
  }

  abrirModal() {
    if (!this.puedeModificar) return; 
    this.modalAbierto = true;
    this.nuevoResponsable = { descripcion: '' };
    this.responsableEditando = null;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  editarResponsable(resp: any) {
    if (!this.puedeModificar) return; 
    this.responsableEditando = resp;
    this.nuevoResponsable = { descripcion: resp.descripcion };
    this.modalAbierto = true;
  }

  eliminarResponsable(resp: any) {
    if (!this.puedeModificar) return; 
    if (!confirm(`¿Eliminar al responsable: ${resp.descripcion}?`)) return;

    this.http.delete(`http://localhost:3000/api/responsables/${resp.id_responsable}`)
      .subscribe({
        next: () => this.cargarResponsables(),
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al eliminar responsable';
          alert(msg);
        }
      });
  }

  guardarResponsable() {
    if (!this.puedeModificar) return; 
    if (!this.nuevoResponsable.descripcion.trim()) {
      alert('Completa la descripción');
      return;
    }

    if (!this.responsableEditando) {
      this.http.post('http://localhost:3000/api/responsables', this.nuevoResponsable)
        .subscribe({
          next: () => { this.cargarResponsables(); this.cerrarModal(); },
          error: (err) => {
            console.error(err);
            const msg = err.error && err.error.message ? err.error.message : 'Error al crear responsable';
            alert(msg);
          }
        });
    } else {
      this.http.put(
        `http://localhost:3000/api/responsables/${this.responsableEditando.id_responsable}`,
        this.nuevoResponsable
      ).subscribe({
        next: () => { this.cargarResponsables(); this.cerrarModal(); },
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al actualizar responsable';
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