import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../services/app-state.service';
export const clientGuard = () => { const s=inject(AppStateService),r=inject(Router); return s.currentClient() ? true : r.createUrlTree(['/cliente/login']); };
export const kitchenGuard = () => { const s=inject(AppStateService),r=inject(Router); return s.isKitchenLoggedIn() ? true : r.createUrlTree(['/cozinha/login']); };
export const delivererGuard = () => { const s=inject(AppStateService),r=inject(Router); return s.currentDeliverer() ? true : r.createUrlTree(['/entregador/login']); };
export const adminGuard = () => { const s=inject(AppStateService),r=inject(Router); return s.isAdminLoggedIn() ? true : r.createUrlTree(['/admin/login']); };
