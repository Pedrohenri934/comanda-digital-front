import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

// RF-042: coloca "Authorization: Bearer <token>" em toda request para o nosso back
// e, em caso de 401, limpa a sessão e manda para o login.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const paraNossaApi = req.url.startsWith(environment.apiUrl);
  const token = auth.token();
  const authReq = paraNossaApi && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // 401 no próprio /auth/login é "senha errada", não sessão expirada: não redireciona.
      const ehAuth = req.url.includes('/api/auth/');
      if (err.status === 401 && paraNossaApi && !ehAuth) {
        const destino = router.url.startsWith('/admin') ? '/admin/login' : '/cliente/login';
        auth.logout(destino);
      }
      return throwError(() => err);
    })
  );
};
