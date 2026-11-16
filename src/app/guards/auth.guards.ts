import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../services/app-state.service';
import { AuthService } from '../services/auth.service';
import { Perfil } from '../models/auth.models';

// RF-043: AuthGuard + RoleGuard. Agora conferem o JWT real e o perfil, e levam o usuario de volta
// para a pagina que ele queria (returnUrl) depois do login.
function exigirPerfil(loginUrl: string, ...perfis: Perfil[]): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.hasRole(...perfis)) return true;
    return router.createUrlTree([loginUrl], { queryParams: { returnUrl: state.url } });
  };
}

export const clientGuard = exigirPerfil('/entrar', 'CLIENTE');
export const kitchenGuard = exigirPerfil('/entrar', 'COZINHEIRO', 'GERENTE', 'ADMIN');
export const adminGuard = exigirPerfil('/entrar', 'ADMIN', 'GERENTE');

// O SRS nao tem o perfil entregador: essa area continua com dados de demonstracao.
export const delivererGuard = () => {
  const s = inject(AppStateService), r = inject(Router);
  return s.currentDeliverer() ? true : r.createUrlTree(['/entregador/login']);
};
