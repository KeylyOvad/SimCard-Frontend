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
  modalAbierto = false;
  tiposim: any[] = [];
  tipoEditando: any = null;
  puedeModificar: boolean = false;

  nuevoTipo = { descripcion: '' };

  constructor(
    private http: HttpClient,
    private authService: AuthService, 
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    console.log('¿Este usuario tiene permisos en la sección de tipos de SIM?:', this.puedeModificar);
    this.cargarTiposSim();
  }

  cargarTiposSim() {
    this.http.get<any[]>('http://localhost:3000/api/tiposim')
      .subscribe({
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
    this.modalAbierto = true;
    this.nuevoTipo = { descripcion: '' };
    this.tipoEditando = null;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  editarTipoSim(tipo: any) {
    if (!this.puedeModificar) return; 
    this.tipoEditando = tipo;
    this.nuevoTipo = { descripcion: tipo.descripcion };
    this.modalAbierto = true;
  }

  eliminarTipoSim(tipo: any) {
    if (!this.puedeModificar) return; 
    const confirmar = confirm(`¿Eliminar tipo de SIM: ${tipo.descripcion}?`);
    if (!confirmar) return;

    this.http.delete(`http://localhost:3000/api/tiposim/${tipo.id_tiposim}`)
      .subscribe({
        next: () => {
          this.cargarTiposSim();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al eliminar tipo SIM';
          alert(msg);
        }
      });
  }

  guardarTipoSim() {
    if (!this.puedeModificar) return; 
    if (!this.nuevoTipo.descripcion.trim()) {
      alert('Completa la descripción');
      return;
    }

    if (!this.tipoEditando) {
      this.http.post('http://localhost:3000/api/tiposim', this.nuevoTipo)
        .subscribe({
          next: () => {
            this.cargarTiposSim();
            this.cerrarModal();
          },
          error: (err) => {
            console.error(err);
            const msg = err.error && err.error.message ? err.error.message : 'Error al crear tipo SIM';
            alert(msg);
          }
        });
    } else {
      this.http.put(
        `http://localhost:3000/api/tiposim/${this.tipoEditando.id_tiposim}`,
        this.nuevoTipo
      ).subscribe({
        next: () => {
          this.cargarTiposSim();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al actualizar tipo SIM';
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