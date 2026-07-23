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
  selector: 'app-operadores',
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
  templateUrl: './operadores.html',
  styleUrls: ['./operadores.css']
})
export class Operadores implements OnInit {
  modalAbierto = false;
  operadores: any[] = [];
  operadorEditando: any = null;
  puedeModificar: boolean = false;

  nuevoOperador = {
    descripcion: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService, 
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    console.log('¿Este usuario tiene permisos en la sección de operadores?:', this.puedeModificar);
    this.cargarOperadores();
  }

  cargarOperadores() {
    this.http.get<any[]>('http://localhost:3000/api/operadores')
      .subscribe({
        next: (data) => {
          this.operadores = data;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar operadores:', err);
        }
      });
  }

  abrirModal() {
    if (!this.puedeModificar) return; 
    this.modalAbierto = true;
    this.nuevoOperador = { descripcion: '' };
    this.operadorEditando = null;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  editarOperador(operador: any) {
    if (!this.puedeModificar) return; 
    this.operadorEditando = operador;
    this.nuevoOperador = { descripcion: operador.descripcion };
    this.modalAbierto = true;
  }

  eliminarOperador(operador: any) {
    if (!this.puedeModificar) return; 
    const confirmar = confirm(`¿Eliminar operador: ${operador.descripcion}?`);
    if (!confirmar) return;

    this.http.delete(`http://localhost:3000/api/operadores/${operador.id_operador}`)
      .subscribe({
        next: () => {
          this.cargarOperadores();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al eliminar operador';
          alert(msg);
        }
      });
  }

  guardarOperador() {
    if (!this.puedeModificar) return; 
    if (!this.nuevoOperador.descripcion.trim()) {
      alert('Completa la descripción');
      return;
    }

    if (!this.operadorEditando) {
      this.http.post('http://localhost:3000/api/operadores', this.nuevoOperador)
        .subscribe({
          next: () => {
            this.cargarOperadores();
            this.cerrarModal();
          },
          error: (err) => {
            console.error(err);
            const msg = err.error && err.error.message ? err.error.message : 'Error al crear operador';
            alert(msg);
          }
        });
    } else {
      this.http.put(
        `http://localhost:3000/api/operadores/${this.operadorEditando.id_operador}`,
        this.nuevoOperador
      ).subscribe({
        next: () => {
          this.cargarOperadores();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al actualizar operador';
          alert(msg);
        }
      });
    }
  }

  resetForm() {
    this.nuevoOperador = { descripcion: '' };
    this.operadorEditando = null;
  }
}