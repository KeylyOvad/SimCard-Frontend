import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth.service';

// Importaciones de PrimeNG
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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin() {
    if (!this.email || !this.password) {
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

        if (res.nombre) {
          this.authService.setNombre(res.nombre);
        } else if (res.usuario && res.usuario.nombre) {
          this.authService.setNombre(res.usuario.nombre);
        } else {
          this.authService.setNombre('Usuario'); 
        }

        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        console.error('ERROR AUTENTICACIÓN:', err);

        const mensaje = err.error?.message || 'Error de comunicación con el servidor.';
        alert(`⚠️ ${mensaje}`);
      }
    });
  }
}