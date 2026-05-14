import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { FilterPipe } from '../../../shared/pipes/fiter.pipe';

@Component({
  selector: 'app-operadores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, FilterPipe],
  templateUrl: './operadores.html',
  styleUrls: ['./operadores.css']
})
export class Operadores implements OnInit {
  searchText = '';
  modalAbierto = false;
  operadores: any[] = [];
  operadorEditando: any = null;
  nuevoOperador = {
    descripcion: ''
  };
  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {}
  ngOnInit() {
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
    this.modalAbierto = true;
    this.nuevoOperador = { descripcion: '' };
    this.operadorEditando = null;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }
  editarOperador(operador: any) {
    this.operadorEditando = operador;
    this.nuevoOperador = { descripcion: operador.descripcion };
    this.modalAbierto = true;
  }
  eliminarOperador(id: number) {
  const confirmar = confirm(`¿Eliminar operador con ID ${id}?`);
  if (!confirmar) return;
  this.http.delete(`http://localhost:3000/api/operadores/${id}`)
    .subscribe({
      next: () => this.cargarOperadores(),
      error: (err) => {
          console.error(err);
          alert('Error al eliminar operador');
    }
  });
}
  guardarOperador() {
    if (!this.nuevoOperador.descripcion) {
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
        error: () => alert('Error al crear operador')
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
        error: () => alert('Error al actualizar operador')
      });
    }
  }
  resetForm() {
    this.nuevoOperador = { descripcion: '' };
    this.operadorEditando = null;
  }
}