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
  modalAbierto = false;
  destinos: any[] = [];
  destinoEditando: any = null;
  puedeModificar: boolean = false;

  nuevoDestino = { descripcion: '' };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    this.cargarDestinos();
  }

  cargarDestinos() {
    this.http.get<any[]>('http://localhost:3000/api/destinos')
      .subscribe({
        next: (data) => {
          this.destinos = data;
          this.cd.detectChanges();
        },
        error: (err) => console.error('Error al cargar destinos:', err)
      });
  }

  abrirModal() {
    if (!this.puedeModificar) return;
    this.modalAbierto = true;
    this.nuevoDestino = { descripcion: '' };
    this.destinoEditando = null;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  editarDestino(dest: any) {
    if (!this.puedeModificar) return;
    this.destinoEditando = dest;
    this.nuevoDestino = { descripcion: dest.descripcion };
    this.modalAbierto = true;
  }

  eliminarDestino(dest: any) {
    if (!this.puedeModificar) return;
    if (!confirm(`¿Eliminar el destino: ${dest.descripcion}?`)) return;

    this.http.delete(`http://localhost:3000/api/destinos/${dest.id_destino}`)
      .subscribe({
        next: () => this.cargarDestinos(),
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al eliminar destino';
          alert(msg);
        }
      });
  }

  guardarDestino() {
    if (!this.puedeModificar) return;
    if (!this.nuevoDestino.descripcion.trim()) {
      alert('Completa la descripción');
      return;
    }

    if (!this.destinoEditando) {
      this.http.post('http://localhost:3000/api/destinos', this.nuevoDestino)
        .subscribe({
          next: () => { this.cargarDestinos(); this.cerrarModal(); },
          error: (err) => {
            console.error(err);
            const msg = err.error && err.error.message ? err.error.message : 'Error al crear destino';
            alert(msg);
          }
        });
    } else {
      this.http.put(
        `http://localhost:3000/api/destinos/${this.destinoEditando.id_destino}`,
        this.nuevoDestino
      ).subscribe({
        next: () => { this.cargarDestinos(); this.cerrarModal(); },
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al actualizar destino';
          alert(msg);
        }
      });
    }
  }

  resetForm() {
    this.nuevoDestino = { descripcion: '' };
    this.destinoEditando = null;
  }
}