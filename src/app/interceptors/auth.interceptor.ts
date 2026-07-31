import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getToken();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {

      //  Solo redirige si es 401 Y NO es la petición de inicio de sesión
      if (error.status === 401 && !req.url.includes('/login')) {
        console.warn('Sesión expirada o no autorizada');

        authService.logout();

        router.navigate(['/login']);
      }

      // Deja pasar el error para que el LoginComponent lo capture en su .subscribe
      return throwError(() => error);
    })
  );
};