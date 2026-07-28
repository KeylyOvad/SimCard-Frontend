import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../shared/header/header';
import { AuthService } from '../../services/auth.service';

// Módulos PrimeNG v21
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Header,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    SelectModule
  ],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  private apiUrl = 'http://localhost:3000/api/usuarios';

  searchText = '';
  modalAbierto = false;
  usuarios: any[] = [];
  usuarioEditando: any = null;
  puedeModificar = false;

  opcionesEstado = [
    { label: 'Activo', value: 'Activo' },
    { label: 'Inactivo', value: 'Inactivo' }
  ];

  opcionesRol = [
    { label: 'Administrador', value: 1 },
    { label: 'Usuario', value: 2 }
  ];

  nuevoUsuario = {
    nombres: '',
    apellidos: '',
    correo: '',
    contrasena: '',
    confirmar: '',
    estado: 'Activo',
    id_rol: 1
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.usuarios = data.map((u) => {
          const esActivo = u.estado === 1 || u.estado === '1' || u.estado === 'Activo';

          return {
            ...u,
            nombreCompleto: `${u.nombres || ''} ${u.apellidos || ''}`.trim(),
            estado: esActivo ? 'Activo' : 'Inactivo',
            rolTexto: Number(u.id_rol) === 1 ? 'Administrador' : 'Usuario'
          };
        });
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
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

  editarUsuario(usuario: any) {
    if (!this.puedeModificar) return;
    this.usuarioEditando = usuario;
    this.nuevoUsuario = {
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      contrasena: '',
      confirmar: '',
      estado: usuario.estado,
      id_rol: Number(usuario.id_rol)
    };
    this.modalAbierto = true;
  }

  eliminarUsuario(usuario: any) {
    if (!this.puedeModificar) return;
    if (!confirm(`¿Está seguro de inactivar o eliminar a ${usuario.nombreCompleto}?`)) return;

    this.http.delete(`${this.apiUrl}/${usuario.id_usuario}`).subscribe({
      next: () => this.cargarUsuarios(),
      error: (err) => {
        const msg = err.error?.message || 'No tienes permisos para realizar esta acción.';
        alert(msg);
      }
    });
  }

  guardarUsuario() {
    if (!this.puedeModificar) {
      alert('Acción no permitida.');
      return;
    }

    const correoLimpio = this.nuevoUsuario.correo.trim().toLowerCase();
    const nombresLimpios = this.nuevoUsuario.nombres.trim();

    if (!nombresLimpios || !correoLimpio) {
      alert('Completa los campos obligatorios (*).');
      return;
    }

    // Convertimos el estado a valor numérico/booleano según requiera la base de datos
    const estadoValor = this.nuevoUsuario.estado === 'Activo' ? 1 : 0;

    const payload: any = {
      nombres: nombresLimpios,
      apellidos: this.nuevoUsuario.apellidos.trim(),
      correo: correoLimpio,
      estado: estadoValor,
      id_rol: Number(this.nuevoUsuario.id_rol)
    };

    if (!this.usuarioEditando) {
      // --- CREACIÓN ---
      if (!this.nuevoUsuario.contrasena) {
        alert('La contraseña es obligatoria para nuevos usuarios.');
        return;
      }

      if (this.nuevoUsuario.contrasena !== this.nuevoUsuario.confirmar) {
        alert('Las contraseñas no coinciden.');
        return;
      }

      payload.contrasena = this.nuevoUsuario.contrasena;

      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => alert(err.error?.message || 'Error al crear el usuario.')
      });

    } else {
      // --- EDICIÓN ---
      // Solo enviamos contraseña si el administrador decidió cambiarla
      if (this.nuevoUsuario.contrasena.trim() !== '') {
        if (this.nuevoUsuario.contrasena !== this.nuevoUsuario.confirmar) {
          alert('Las contraseñas no coinciden.');
          return;
        }
        payload.contrasena = this.nuevoUsuario.contrasena;
      }

      this.http.put(`${this.apiUrl}/${this.usuarioEditando.id_usuario}`, payload).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => alert(err.error?.message || 'Error al actualizar el usuario.')
      });
    }
  }

  resetForm() {
    this.nuevoUsuario = {
      nombres: '',
      apellidos: '',
      correo: '',
      contrasena: '',
      confirmar: '',
      estado: 'Activo',
      id_rol: 1
    };
    this.usuarioEditando = null;
  }
}