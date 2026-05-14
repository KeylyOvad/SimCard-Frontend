import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../shared/header/header';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  searchText = '';
  modalAbierto = false;
  usuarios: any[] = [];
  usuarioEditando: any = null;
   nuevoUsuario = {
     nombres: '',
     apellidos: '',
     correo: '',
     contrasena: '',
     confirmar: '',
     estado: 'Activo'
 };
 constructor(
    private router: Router,
    private http: HttpClient,
    private cd: ChangeDetectorRef
 ) {}

   ngOnInit() {
     this.cargarUsuarios();
 }

cargarUsuarios() {
    this.http.get<any[]>('http://localhost:3000/api/usuarios')
       .subscribe({
       next: (data) => {
          this.usuarios = data.map(u => ({
              ...u,
              nombre: u.nombres + ' ' + u.apellidos,
              estado: Number(u.estado) === 1 ? 'Activo' : 'Inactivo'
         }));
            this.cd.detectChanges();
       },
          error: (err) => {
         console.error(err);
        }
     });
}
  abrirModal() {
     this.modalAbierto = true;
 }
   cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }
   editarUsuario(usuario: any) {
   this.usuarioEditando = usuario;
    this.nuevoUsuario = {
       nombres: usuario.nombres,
       apellidos: usuario.apellidos,
       correo: usuario.correo,
       contrasena: '',
       confirmar: '',
       estado: usuario.estado
    };
   this.modalAbierto = true;
 }
   eliminarUsuario(usuario: any) {
   const confirmar = confirm(`¿Eliminar a ${usuario.nombre}?`);
   if (!confirmar) return;
   this.http.delete(`http://localhost:3000/api/usuarios/${usuario.id_usuario}`)
      .subscribe({
       next: () => {
       this.cargarUsuarios();
      },
         error: (err) => {
         console.error(err);
           alert('Error al eliminar usuario');
      }
   });
}

 guardarUsuario() {
      if (!this.nuevoUsuario.nombres || !this.nuevoUsuario.correo) {
      alert('Completa los campos obligatorios');
      return;
    }
     if (!this.usuarioEditando) {
     if (this.nuevoUsuario.contrasena !== this.nuevoUsuario.confirmar) {
     alert('Las contraseñas no coinciden');
        return;
      }
         this.http.post('http://localhost:3000/api/usuarios', this.nuevoUsuario)
        .subscribe({
        next: () => {
            this.cargarUsuarios();
           this.cerrarModal();
            },
        error: () => {
           alert('Error al crear usuario');
          }
        });
    } else {
         this.http.put(
        `http://localhost:3000/api/usuarios/${this.usuarioEditando.id_usuario}`,
         this.nuevoUsuario
      ).subscribe({
          next: () => {
         this.cargarUsuarios();
         this.cerrarModal();
      },
         error: () => {
         alert('Error al actualizar usuario');
       }
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
      estado: 'Activo'
    };
    this.usuarioEditando = null;
  }
}