import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  email = '';
  password = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin() {
  console.log('BOTÓN ENTRAR FUNCIONA');

  this.authService.login(this.email, this.password).subscribe({
   next: (res: any) => {
      console.log('RESPUESTA BACKEND:', res);
      this.authService.setToken(res.token);
     if (res.user) {
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  this.router.navigate(['/home']);
},
    error: (err) => {
      console.error('ERROR LOGIN:', err);
    }
  });
}

}