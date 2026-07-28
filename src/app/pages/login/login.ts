import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth.service';

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
  
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Ingresa tu correo y contraseña.';
      return;
    }

    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        this.loading = false;
        
        this.authService.setToken(res.token);

        if (res.id_rol) {
          this.authService.setRol(res.id_rol); 
        }

        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.password = ''; // Limpia la contraseña al fallar

        if (err.status === 401 || err.status === 400) {
          this.errorMessage = 'Correo o contraseña incorrectos.';
        } else {
          this.errorMessage = 'Error de conexión con el servidor.';
        }
      }
    });
  }
}