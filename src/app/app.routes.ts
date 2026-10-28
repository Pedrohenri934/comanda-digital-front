import { Routes } from '@angular/router';
import { clientGuard, kitchenGuard, delivererGuard, adminGuard } from './guards/auth.guards';
export const routes: Routes = [
  { path:'', loadComponent:()=>import('./pages/landing/landing.component').then(m=>m.LandingComponent) },
  { path:'cliente/login', loadComponent:()=>import('./pages/client/client-login.component').then(m=>m.ClientLoginComponent) },
  { path:'cliente/cadastro', loadComponent:()=>import('./pages/client/client-register.component').then(m=>m.ClientRegisterComponent) },
  { path:'cliente/cardapio', loadComponent:()=>import('./pages/client/client-menu.component').then(m=>m.ClientMenuComponent), canActivate:[clientGuard] },
  { path:'cliente/pedidos', loadComponent:()=>import('./pages/client/client-orders.component').then(m=>m.ClientOrdersComponent), canActivate:[clientGuard] },
  { path:'cliente/pedido/:id', loadComponent:()=>import('./pages/client/client-tracking.component').then(m=>m.ClientTrackingComponent), canActivate:[clientGuard] },
  { path:'cozinha/login', loadComponent:()=>import('./pages/kitchen/kitchen-login.component').then(m=>m.KitchenLoginComponent) },
  { path:'cozinha/painel', loadComponent:()=>import('./pages/kitchen/kitchen-dashboard.component').then(m=>m.KitchenDashboardComponent), canActivate:[kitchenGuard] },
  { path:'entregador/login', loadComponent:()=>import('./pages/delivery/delivery-login.component').then(m=>m.DeliveryLoginComponent) },
  { path:'entregador/cadastro', loadComponent:()=>import('./pages/delivery/delivery-register.component').then(m=>m.DeliveryRegisterComponent) },
  { path:'entregador/painel', loadComponent:()=>import('./pages/delivery/delivery-panel.component').then(m=>m.DeliveryPanelComponent), canActivate:[delivererGuard] },
  { path:'admin/login', loadComponent:()=>import('./pages/admin/admin-login.component').then(m=>m.AdminLoginComponent) },
  { path:'admin', loadComponent:()=>import('./pages/admin/admin-layout.component').then(m=>m.AdminLayoutComponent), canActivate:[adminGuard], children:[
    { path:'', redirectTo:'dashboard', pathMatch:'full' },
    { path:'dashboard', loadComponent:()=>import('./pages/admin/admin-dashboard.component').then(m=>m.AdminDashboardComponent) },
    { path:'pratos', loadComponent:()=>import('./pages/admin/admin-dishes.component').then(m=>m.AdminDishesComponent) },
    { path:'cardapio-semana', loadComponent:()=>import('./pages/admin/admin-weekly-menu.component').then(m=>m.AdminWeeklyMenuComponent) },
    { path:'pedidos', loadComponent:()=>import('./pages/admin/admin-orders.component').then(m=>m.AdminOrdersComponent) },
    { path:'entregadores', loadComponent:()=>import('./pages/admin/admin-deliverers.component').then(m=>m.AdminDeliverersComponent) },
    { path:'cozinha', loadComponent:()=>import('./pages/admin/admin-kitchen.component').then(m=>m.AdminKitchenComponent) },
    { path:'relatorios', loadComponent:()=>import('./pages/admin/admin-reports.component').then(m=>m.AdminReportsComponent) },
    { path:'matriz-bcg', loadComponent:()=>import('./pages/admin/admin-bcg.component').then(m=>m.AdminBcgComponent) },
    { path:'estoque', loadComponent:()=>import('./pages/admin/admin-inventory.component').then(m=>m.AdminInventoryComponent) },
  ]},
  { path:'**', redirectTo:'' }
];
