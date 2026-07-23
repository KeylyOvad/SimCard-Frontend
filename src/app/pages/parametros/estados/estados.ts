import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { AuthService } from '../../../services/auth.service';

// Módulos UI de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

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
  modalAbierto = false;
  estados: any[] = [];
  estadoEditando: any = null;
  puedeModificar: boolean = false;

  nuevoEstado = { descripcion: '' };

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    console.log('¿Este usuario tiene permisos en la sección de estados?:', this.puedeModificar);
    this.cargarEstados();
  }

  cargarEstados() {
    this.http.get<any[]>('http://localhost:3000/api/estados')
      .subscribe({
        next: (data) => {
          this.estados = data;
          this.cd.detectChanges();
        },
        error: (err) => console.error('Error al cargar estados:', err)
      });
  }

  abrirModal() {
    if (!this.puedeModificar) return; 
    this.modalAbierto = true;
    this.nuevoEstado = { descripcion: '' };
    this.estadoEditando = null;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  editarEstado(est: any) {
    if (!this.puedeModificar) return; 
    this.estadoEditando = est;
    this.nuevoEstado = { descripcion: est.descripcion };
    this.modalAbierto = true;
  }

  eliminarEstado(est: any) {
    if (!this.puedeModificar) return; 
    if (!confirm(`¿Eliminar el estado: ${est.descripcion}?`)) return;

    this.http.delete(`http://localhost:3000/api/estados/${est.id_estado}`)
      .subscribe({
        next: () => this.cargarEstados(),
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al eliminar estado';
          alert(msg);
        }
      });
  }

  guardarEstado() {
    if (!this.puedeModificar) return; 
    if (!this.nuevoEstado.descripcion.trim()) {
      alert('Completa la descripción');
      return;
    }

    if (!this.estadoEditando) {
      this.http.post('http://localhost:3000/api/estados', this.nuevoEstado)
        .subscribe({
          next: () => { 
            this.cargarEstados(); 
            this.cerrarModal(); 
          },
          error: (err) => {
            console.error(err);
            const msg = err.error && err.error.message ? err.error.message : 'Error al crear estado';
            alert(msg);
          }
        });
    } else {
      this.http.put(
        `http://localhost:3000/api/estados/${this.estadoEditando.id_estado}`,
        this.nuevoEstado
      ).subscribe({
        next: () => { 
          this.cargarEstados(); 
          this.cerrarModal(); 
        },
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al actualizar estado';
          alert(msg);
        }
      });
    }
  }

  resetForm() {
    this.nuevoEstado = { descripcion: '' };
    this.estadoEditando = null;
  }
}