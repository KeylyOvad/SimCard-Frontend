import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { FilterPipe } from '../../../shared/pipes/fiter.pipe'; 

@Component({
  selector: 'app-tiposim',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, FilterPipe],
  templateUrl: './simcard.html',
  styleUrls: ['./simcard.css']
})
export class TipoSim implements OnInit {
  searchText = '';
  modalAbierto = false;
  tiposim: any[] = [];
  tipoEditando: any = null;
  nuevoTipo = { descripcion: '' };

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
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
    this.modalAbierto = true;
    this.nuevoTipo = { descripcion: '' };
    this.tipoEditando = null;
  }
  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }
  editarTipoSim(tipo: any) {
    this.tipoEditando = tipo;
    this.nuevoTipo = { descripcion: tipo.descripcion };
    this.modalAbierto = true;
  }
  eliminarTipoSim(id: number) {
    const confirmar = confirm(`¿Eliminar tipo SIM con ID ${id}?`);
    if (!confirmar) return;
    this.http.delete(`http://localhost:3000/api/tiposim/${id}`)
      .subscribe({
        next: () => this.cargarTiposSim(),
        error: (err) => {
          console.error(err);
          alert('Error al eliminar tipo SIM');
        }
      });
  }
  guardarTipoSim() {
    if (!this.nuevoTipo.descripcion) {
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
          error: () => alert('Error al crear tipo SIM')
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
        error: () => alert('Error al actualizar tipo SIM')
      });
    }
  }
  resetForm() {
    this.nuevoTipo = { descripcion: '' };
    this.tipoEditando = null;
  }
}
