import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth.service';

// Componentes visuales
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    InputTextModule, 
    ButtonModule, 
    CardModule,
    IconFieldModule,
    InputIconModule
  ], 
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  
  // Variables del formulario
  email = '';
  password = '';
  loading = false;
  errorMessage = signal<string>('');

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Inicia la sesion del usuario
  onLogin() {
    this.errorMessage.set('');

    // Limpia espacios en blanco
    const cleanedEmail = this.email.trim().toLowerCase();
    const cleanedPassword = this.password;

    // Valida campos vacios
    if (!cleanedEmail || !cleanedPassword) {
      this.errorMessage.set('Ingresa tu correo y contraseña.');
      return;
    }

    this.loading = true;

    // Envia los datos al backend
    this.authService.login(cleanedEmail, cleanedPassword).subscribe({
      next: (res: any) => {
        this.loading = false;
        
        // Guarda el token en el navegador
        this.authService.setToken(res.token);

        // Guarda el rol si existe
        if (res.id_rol) {
          this.authService.setRol(res.id_rol); 
        }

        // Guarda el nombre del usuario
        if (res.nombre || res.user_name) {
          this.authService.setNombre(res.nombre || res.user_name);
        }

        // Redirige al inicio
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.password = ''; 
        
        // Mensajes de error segun la respuesta
        if (err.status === 401 || err.status === 400) {
          this.errorMessage.set('Correo o contraseña incorrectos.');
        } else {
          this.errorMessage.set('Error de conexión con el servidor.');
        }
      }
    });
  }
}