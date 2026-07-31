import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../shared/header/header';
import { AuthService } from '../../services/auth.service';

// Modulos PrimeNG v21
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
  // Ruta de la API
  private apiUrl = 'http://localhost:3000/api/usuarios';

  // Variables de control y listas
  searchText = '';
  modalAbierto = false;
  usuarios: any[] = [];
  usuarioEditando: any = null;
  puedeModificar = false;

  // Opciones para selectores
  opcionesEstado = [
    { label: 'Activo', value: 'Activo' },
    { label: 'Inactivo', value: 'Inactivo' }
  ];

  opcionesRol = [
    { label: 'Administrador', value: 1 },
    { label: 'Usuario', value: 2 }
  ];

  // Objeto para el formulario
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
    // Verifica rol de administrador y carga lista
    this.puedeModificar = this.authService.esAdmin();
    this.cargarUsuarios();
  }

  // Trae los usuarios desde el servidor
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
        
        // Forma segura de notificar cambios
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  // Abre el modal para crear usuario
  abrirModal() {
    if (!this.puedeModificar) return;
    this.resetForm();
    
    // Programado en microtarea para diferir el cambio de estado de la UI
    Promise.resolve().then(() => {
      this.modalAbierto = true;
      this.cd.markForCheck();
    });
  }

  // Cierra el modal y limpia campos
  cerrarModal() {
    this.modalAbierto = false;

    // Resetea valores en la siguiente microtarea
    Promise.resolve().then(() => {
      this.resetForm();
      this.cd.markForCheck();
    });
  }

  // Carga datos de un usuario en el modal para editar
  editarUsuario(usuario: any) {
    if (!this.puedeModificar) return;
    this.usuarioEditando = usuario;

    // Normaliza el estado a string exacto
    const esActivo = usuario.estado === 1 || usuario.estado === '1' || usuario.estado === 'Activo';

    this.nuevoUsuario = {
      nombres: usuario.nombres || '',
      apellidos: usuario.apellidos || '',
      correo: usuario.correo || '',
      contrasena: '',
      confirmar: '',
      estado: esActivo ? 'Activo' : 'Inactivo',
      id_rol: Number(usuario.id_rol)
    };

    // Abre el modal de forma asíncrona segura
    Promise.resolve().then(() => {
      this.modalAbierto = true;
      this.cd.markForCheck();
    });
  }

  // Elimina o inactiva un usuario
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

  // Guarda o actualiza la informacion del usuario
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

    // Estado en formato numerico para BD (1 = Activo, 0 = Inactivo)
    const estadoValor = this.nuevoUsuario.estado === 'Activo' ? 1 : 0;

    const payload: any = {
      nombres: nombresLimpios,
      apellidos: this.nuevoUsuario.apellidos.trim(),
      correo: correoLimpio,
      estado: estadoValor,
      id_rol: Number(this.nuevoUsuario.id_rol)
    };

    if (!this.usuarioEditando) {
      // Registrar nuevo usuario
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
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => alert(err.error?.message || 'Error al crear el usuario.')
      });

    } else {
      // Actualizar usuario existente
      if (this.nuevoUsuario.contrasena && this.nuevoUsuario.contrasena.trim() !== '') {
        if (this.nuevoUsuario.contrasena !== this.nuevoUsuario.confirmar) {
          alert('Las contraseñas no coinciden.');
          return;
        }
        payload.contrasena = this.nuevoUsuario.contrasena;
      }

      this.http.put(`${this.apiUrl}/${this.usuarioEditando.id_usuario}`, payload).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => alert(err.error?.message || 'Error al actualizar el usuario.')
      });
    }
  }

  // Restablece el formulario a valores iniciales
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