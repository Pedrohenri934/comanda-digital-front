import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Perfil } from '../models/auth.models';

// RF-043: AuthGuard = está logado?
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/cliente/login'], { queryParams: { returnUrl: state.url } });
};

// RF-043: RoleGuard = tem permissão? Uso: canActivate: [roleGuard('ADMIN', 'GERENTE')]
export const roleGuard = (...roles: Perfil[]): CanActivateFn => (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/cliente/login'], { queryParams: { returnUrl: state.url } });
  }
  return auth.hasRole(...roles) ? true : router.createUrlTree(['/']);
};
