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
  searchText = '';
  modalAbierto = false;
  usuarios: any[] = [];
  usuarioEditando: any = null;
  puedeModificar = false;

  // Opciones para p-select (Estado y Rol)
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
    this.http.get<any[]>('http://localhost:3000/api/usuarios').subscribe({
      next: (data) => {
        this.usuarios = data.map((u) => {
          const estadoFormateado = (u.estado === 1 || u.estado === '1' || u.estado === 'Activo') 
            ? 'Activo' 
            : 'Inactivo';

          return {
            ...u,
            nombreCompleto: `${u.nombres} ${u.apellidos}`,
            estado: estadoFormateado,
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
    if (!confirm(`¿Eliminar a ${usuario.nombreCompleto}?`)) return;

    this.http.delete(`http://localhost:3000/api/usuarios/${usuario.id_usuario}`).subscribe({
      next: () => this.cargarUsuarios(),
      error: (err) => {
        const msg = err.error?.message || 'Error al eliminar usuario';
        alert(msg);
      }
    });
  }

  guardarUsuario() {
    if (!this.puedeModificar) return;
    if (!this.nuevoUsuario.nombres || !this.nuevoUsuario.correo) {
      alert('Completa los campos obligatorios');
      return;
    }

    const payload = {
      nombres: this.nuevoUsuario.nombres,
      apellidos: this.nuevoUsuario.apellidos,
      correo: this.nuevoUsuario.correo,
      contrasena: this.nuevoUsuario.contrasena,
      estado: this.nuevoUsuario.estado,
      id_rol: Number(this.nuevoUsuario.id_rol)
    };

    if (!this.usuarioEditando) {
      if (this.nuevoUsuario.contrasena !== this.nuevoUsuario.confirmar) {
        alert('Las contraseñas no coinciden');
        return;
      }

      this.http.post('http://localhost:3000/api/usuarios', payload).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => alert(err.error?.message || 'Fallo inesperado al crear usuario.')
      });
    } else {
      if (this.nuevoUsuario.contrasena.trim() !== '' && this.nuevoUsuario.contrasena !== this.nuevoUsuario.confirmar) {
        alert('Las contraseñas no coinciden');
        return;
      }

      this.http.put(`http://localhost:3000/api/usuarios/${this.usuarioEditando.id_usuario}`, payload).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => alert(err.error?.message || 'Fallo inesperado al actualizar usuario.')
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