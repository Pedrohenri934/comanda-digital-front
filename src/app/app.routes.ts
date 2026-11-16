import { Routes } from '@angular/router';
import { clientGuard, kitchenGuard, delivererGuard, adminGuard } from './guards/auth.guards';
export const routes: Routes = [
  { path:'', loadComponent:()=>import('./pages/client/client-menu.component').then(m=>m.ClientMenuComponent) },
  { path:'entrar', loadComponent:()=>import('./pages/client/entrar.component').then(m=>m.EntrarComponent) },
  { path:'cliente/login', redirectTo:'entrar' },
  { path:'cliente/cadastro', loadComponent:()=>import('./pages/client/client-register.component').then(m=>m.ClientRegisterComponent) },
  { path:'cliente/cardapio', loadComponent:()=>import('./pages/client/client-menu.component').then(m=>m.ClientMenuComponent) },
  { path:'cardapio', redirectTo:'', pathMatch:'full' },
  { path:'cliente/pedidos', loadComponent:()=>import('./pages/client/client-orders.component').then(m=>m.ClientOrdersComponent), canActivate:[clientGuard] },
  { path:'cliente/pedido/:id', loadComponent:()=>import('./pages/client/client-tracking.component').then(m=>m.ClientTrackingComponent), canActivate:[clientGuard] },
  { path:'cozinha/login', redirectTo:'entrar' },
  { path:'cozinha/painel', loadComponent:()=>import('./pages/kitchen/kitchen-dashboard.component').then(m=>m.KitchenDashboardComponent), canActivate:[kitchenGuard] },
  { path:'entregador/login', redirectTo:'entrar' },
  { path:'entregador/cadastro', redirectTo:'cliente/cadastro' },
  { path:'entregador/painel', loadComponent:()=>import('./pages/delivery/delivery-panel.component').then(m=>m.DeliveryPanelComponent), canActivate:[delivererGuard] },
  { path:'admin/login', redirectTo:'entrar' },
  { path:'admin', loadComponent:()=>import('./pages/admin/admin-layout.component').then(m=>m.AdminLayoutComponent), canActivate:[adminGuard], children:[
    { path:'', redirectTo:'dashboard', pathMatch:'full' },
    { path:'dashboard', loadComponent:()=>import('./pages/admin/admin-dashboard.component').then(m=>m.AdminDashboardComponent) },
    { path:'fornecedores', loadComponent:()=>import('./pages/admin/admin-suppliers.component').then(m=>m.AdminSuppliersComponent) },
    { path:'compras', loadComponent:()=>import('./pages/admin/admin-purchases.component').then(m=>m.AdminPurchasesComponent) },
    { path:'categorias', loadComponent:()=>import('./pages/admin/admin-categories.component').then(m=>m.AdminCategoriesComponent) },
    { path:'pratos', loadComponent:()=>import('./pages/admin/admin-dishes.component').then(m=>m.AdminDishesComponent) },
    { path:'cardapio-semana', loadComponent:()=>import('./pages/admin/admin-weekly-menu.component').then(m=>m.AdminWeeklyMenuComponent) },
    { path:'pedidos', loadComponent:()=>import('./pages/admin/admin-orders.component').then(m=>m.AdminOrdersComponent) },
    { path:'entregadores', loadComponent:()=>import('./pages/admin/admin-deliverers.component').then(m=>m.AdminDeliverersComponent) },
    { path:'cozinha', loadComponent:()=>import('./pages/admin/admin-kitchen.component').then(m=>m.AdminKitchenComponent) },
    { path:'relatorios', redirectTo:'matriz-bcg' },
    { path:'matriz-bcg', loadComponent:()=>import('./pages/admin/admin-bcg.component').then(m=>m.AdminBcgComponent) },
    { path:'estoque', loadComponent:()=>import('./pages/admin/admin-inventory.component').then(m=>m.AdminInventoryComponent) },
  ]},
  { path:'**', redirectTo:'' }
];
