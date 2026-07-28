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

      if (error.status === 401) {
        console.warn('Sesión expirada o no autorizada');

        authService.logout();

        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};