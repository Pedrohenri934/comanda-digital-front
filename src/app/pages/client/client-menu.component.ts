import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { DishCategory, CartItem } from '../../models/models';

const DAYS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const DAY_NOW = DAYS[new Date().getDay()];

@Component({
  selector: 'app-client-menu',
  standalone: true,
  imports: [FormsModule],
  template: `
<div class="min-h-screen bg-[#0a0a0a]">
  <header class="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur border-b border-neutral-800/50 px-4 py-3">
    <div class="max-w-5xl mx-auto flex items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
        <span class="text-white font-semibold hidden sm:block">Boi Na Brasa</span>
      </div>
      <div class="flex-1 max-w-sm relative">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input [(ngModel)]="search" (ngModelChange)="onSearchChange($event)" placeholder="Buscar prato..."
          class="w-full bg-[#1a1a1a] border border-neutral-800 text-white rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-neutral-400 text-sm hidden sm:block">{{s.currentClient()?.name}}</span>
        <button (click)="r.navigateByUrl('/cliente/pedidos')" class="p-2 text-neutral-400 hover:text-red-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1"/></svg>
        </button>
        <button (click)="cartOpen=true" class="relative p-2 bg-red-900/40 hover:bg-red-900/60 border border-red-800/50 rounded-xl transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          @if(s.cartCount()>0){<span class="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">{{s.cartCount()}}</span>}
        </button>
        <button (click)="logout()" class="p-2 text-neutral-500 hover:text-red-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        </button>
      </div>
    </div>
  </header>

  <div class="max-w-5xl mx-auto px-4 py-6">
    @if(specialDish()){
      <div class="mb-8 relative overflow-hidden rounded-2xl">
        <img [src]="specialDish()!.image" [alt]="specialDish()!.name" class="w-full h-48 object-cover"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span class="text-yellow-400 text-sm font-medium">Especial do dia — {{dayNow}}</span>
            </div>
            <h2 class="text-white text-2xl mb-1">{{specialDish()!.name}}</h2>
            <p class="text-neutral-300 text-sm">{{specialDish()!.description}}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-red-400 text-2xl font-bold">R$ {{specialDish()!.price.toFixed(2)}}</p>
            <button (click)="s.addToCart(specialDish()!)" class="mt-2 bg-red-700 hover:bg-red-600 text-white rounded-xl px-4 py-2 text-sm transition-colors">Adicionar</button>
          </div>
        </div>
      </div>
    }

    <!-- Category tabs — setCategory() evita atribuição direta no template -->
    <div class="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
      @for(c of categories; track c.key){
        <button (click)="setCategory(c.key)" class="flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-colors"
          [class]="category()===c.key ? 'bg-red-800 text-white' : 'bg-[#1a1a1a] text-neutral-400 hover:text-white border border-neutral-800'">
          {{c.label}}
        </button>
      }
    </div>

    @if(filteredDishes().length===0){
      <div class="text-center py-16 text-neutral-500">Nenhum prato encontrado</div>
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for(dish of filteredDishes(); track dish.id){
          <div class="bg-[#141414] border rounded-2xl overflow-hidden group"
            [class]="isDishSpecial(dish.id) ? 'border-yellow-700/50' : 'border-neutral-800'">
            <div class="relative h-44">
              <img [src]="dish.image" [alt]="dish.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              @if(getPromo(dish.id)){
                <div class="absolute top-2 left-2 bg-green-700 text-white text-xs px-2 py-1 rounded-lg">-{{getPromo(dish.id)!.discount}}%</div>
              }
              @if(isDishSpecial(dish.id) && !getPromo(dish.id)){
                <div class="absolute top-2 left-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded-lg">⭐ Especial</div>
              }
              <button (click)="s.toggleFavorite(dish.id)" class="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  [class]="isFav(dish.id) ? 'text-red-500 fill-red-500' : 'text-white'">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </button>
            </div>
            <div class="p-4">
              <h3 class="text-white text-sm mb-1">{{dish.name}}</h3>
              <p class="text-neutral-500 text-xs mb-3 line-clamp-2">{{dish.description}}</p>
              <div class="flex items-center justify-between">
                <div>
                  @if(getPromo(dish.id)){
                    <p class="text-neutral-600 text-xs line-through">R$ {{dish.price.toFixed(2)}}</p>
                  }
                  <p class="text-red-400 font-bold">R$ {{getFinalPrice(dish.id).toFixed(2)}}</p>
                </div>
                @if(getCartItem(dish.id)){
                  <div class="flex items-center gap-2">
                    <button (click)="s.updateCartQty(dish.id, getCartItem(dish.id)!.qty - 1)"
                      class="w-7 h-7 bg-neutral-800 hover:bg-red-900 text-white rounded-lg flex items-center justify-center transition-colors text-sm">−</button>
                    <span class="text-white text-sm w-4 text-center">{{getCartItem(dish.id)!.qty}}</span>
                    <button (click)="s.addToCart(dish)"
                      class="w-7 h-7 bg-red-800 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors text-sm">+</button>
                  </div>
                } @else {
                  <button (click)="s.addToCart(dish)" class="flex items-center gap-1 bg-red-800 hover:bg-red-700 text-white rounded-xl px-3 py-1.5 text-sm transition-colors">+ Adicionar</button>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }
  </div>

  @if(cartOpen){
    <div class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-black/70" (click)="cartOpen=false"></div>
      <div class="relative w-full max-w-sm bg-[#111111] border-l border-neutral-800 h-full flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 class="text-white font-semibold">Meu Pedido</h2>
          <button (click)="cartOpen=false" class="text-neutral-400 hover:text-white">✕</button>
        </div>
        @if(s.cart().length===0){
          <div class="flex-1 flex items-center justify-center text-neutral-500">Carrinho vazio</div>
        } @else {
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            @for(item of s.cart(); track item.dish.id){
              <div class="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3">
                <img [src]="item.dish.image" [alt]="item.dish.name" class="w-14 h-14 rounded-lg object-cover"/>
                <div class="flex-1 min-w-0">
                  <p class="text-white text-sm truncate">{{item.dish.name}}</p>
                  <p class="text-red-400 text-sm">R$ {{(item.dish.price * item.qty).toFixed(2)}}</p>
                </div>
                <div class="flex items-center gap-1">
                  <button (click)="s.updateCartQty(item.dish.id, item.qty-1)" class="w-6 h-6 bg-neutral-700 text-white rounded flex items-center justify-center text-sm">−</button>
                  <span class="text-white text-sm w-5 text-center">{{item.qty}}</span>
                  <button (click)="s.addToCart(item.dish)" class="w-6 h-6 bg-red-800 text-white rounded flex items-center justify-center text-sm">+</button>
                </div>
              </div>
            }
          </div>
          <div class="p-4 border-t border-neutral-800">
            <div class="flex justify-between text-white mb-4">
              <span>Total</span><span class="text-red-400 font-bold">R$ {{s.cartTotal().toFixed(2)}}</span>
            </div>
            <button (click)="openCheckout()" class="w-full bg-red-800 hover:bg-red-700 text-white rounded-xl py-3 transition-colors">Finalizar Pedido</button>
          </div>
        }
      </div>
    </div>
  }

  @if(checkoutOpen){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="checkoutOpen=false"></div>
      <div class="relative w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 class="text-white font-semibold">Finalizar Pedido</h2>
          <button (click)="checkoutOpen=false" class="text-neutral-400 hover:text-white">✕</button>
        </div>
        <div class="p-6 space-y-4">
          @if(formError){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm">{{formError}}</div>}
          <h3 class="text-neutral-300 text-sm">📍 Endereço de entrega</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2"><input [(ngModel)]="addr.street" placeholder="Rua / Avenida *" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/></div>
            <input [(ngModel)]="addr.number" placeholder="Número *" class="bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/>
            <input [(ngModel)]="addr.cep" placeholder="CEP *" class="bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/>
            <div class="col-span-2"><input [(ngModel)]="addr.complement" placeholder="Complemento (opcional)" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/></div>
            <div class="col-span-2"><input [(ngModel)]="addr.reference" placeholder="Ponto de referência (opcional)" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/></div>
          </div>
          <h3 class="text-neutral-300 text-sm mt-2">💳 Forma de pagamento</h3>
          <div class="grid grid-cols-1 gap-2">
            @for(opt of payOpts; track opt){
              <label [class]="payment===opt ? 'border-red-700 bg-red-900/20' : 'border-neutral-700 bg-[#1e1e1e]'"
                class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors">
                <input type="radio" [value]="opt" [(ngModel)]="payment" class="hidden"/>
                <span class="text-white text-sm">{{opt}}</span>
              </label>
            }
          </div>
          <div class="border-t border-neutral-800 pt-4 flex items-center justify-between">
            <div>
              <p class="text-neutral-400 text-sm">Total do pedido</p>
              <p class="text-red-400 font-bold text-xl">R$ {{s.cartTotal().toFixed(2)}}</p>
            </div>
            <button (click)="checkout()" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-6 py-3 transition-colors">Confirmar Pedido</button>
          </div>
        </div>
      </div>
    </div>
  }
</div>`
})
export class ClientMenuComponent {
  dayNow = DAY_NOW;
  // category como Signal para que computed() reaja às mudanças
  category = signal<DishCategory | 'todos'>('todos');
  searchSignal = signal('');
  search = '';
  cartOpen = false; checkoutOpen = false; formError = '';
  addr = { street: '', number: '', cep: '', complement: '', reference: '' };
  payment = 'Cartão de Crédito';
  payOpts = ['Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Dinheiro'];
  categories = [
    { key: 'todos' as const, label: 'Todos' },
    { key: 'carnes' as DishCategory, label: '🥩 Carnes' },
    { key: 'acompanhamentos' as DishCategory, label: '🍟 Acompanhamentos' },
    { key: 'bebidas' as DishCategory, label: '🍺 Bebidas' },
    { key: 'sobremesas' as DishCategory, label: '🍮 Sobremesas' },
    { key: 'combos' as DishCategory, label: '🎁 Combos' },
  ];

  todayMenu = computed(() => this.s.weeklyMenu()[DAY_NOW]);

  specialDish = computed(() => {
    const m = this.todayMenu();
    return m?.specialDishId ? (this.s.dishes().find(d => d.id === m.specialDishId) ?? null) : null;
  });

  filteredDishes = computed(() => {
    const m = this.todayMenu();
    const ids = m?.dishes || [];
    const cat = this.category();
    const search = this.searchSignal().toLowerCase();
    return this.s.dishes().filter(d => {
      if (!d.active) return false;
      if (ids.length && !ids.includes(d.id)) return false;
      if (cat !== 'todos' && d.category !== cat) return false;
      if (search && !d.name.toLowerCase().includes(search)) return false;
      return true;
    });
  });

  constructor(public s: AppStateService, public r: Router) {}

  // Métodos necessários para evitar atribuições e arrow functions no template
  setCategory(key: DishCategory | 'todos') { this.category.set(key); }
  onSearchChange(val: string) { this.searchSignal.set(val); }

  getPromo(dishId: string) {
    return this.todayMenu()?.promotions?.find(p => p.dishId === dishId) ?? null;
  }
  isDishSpecial(dishId: string) { return dishId === this.todayMenu()?.specialDishId; }
  isFav(dishId: string) { return this.s.currentClient()?.favorites?.includes(dishId) ?? false; }
  getCartItem(dishId: string): CartItem | undefined {
    return this.s.cart().find(i => i.dish.id === dishId);
  }
  getFinalPrice(dishId: string): number {
    const dish = this.s.dishes().find(d => d.id === dishId);
    if (!dish) return 0;
    const promo = this.getPromo(dishId);
    return promo ? dish.price * (1 - promo.discount / 100) : dish.price;
  }
  logout() { this.s.logoutClient(); this.r.navigateByUrl('/cliente/login'); }
  openCheckout() { this.cartOpen = false; this.checkoutOpen = true; }
  checkout() {
    this.formError = '';
    if (!this.addr.street || !this.addr.number || !this.addr.cep) {
      this.formError = 'Preencha todos os campos obrigatórios.'; return;
    }
    const o = this.s.placeOrder(this.addr, this.payment);
    if (o) { this.checkoutOpen = false; this.r.navigateByUrl('/cliente/pedido/' + o.id); }
  }
}
