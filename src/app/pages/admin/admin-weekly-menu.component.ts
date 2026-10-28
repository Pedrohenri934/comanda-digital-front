import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { Dish, WeeklyMenuDay } from '../../models/models';

const DAYS = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];

@Component({
  selector: 'app-admin-weekly-menu',
  standalone: true,
  imports: [FormsModule],
  template: `
<div class="p-4 md:p-6 max-w-5xl mx-auto">
  <div class="mb-6">
    <h1 class="text-white text-2xl font-semibold">Cardápio da Semana</h1>
    <p class="text-neutral-400 text-sm mt-1">Personalize o cardápio para cada dia</p>
  </div>

  <div class="flex gap-2 overflow-x-auto pb-2 mb-6">
    @for(day of days; track day){
      <button (click)="selectDay(day)"
        class="flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-colors relative"
        [class]="selDay()===day ? 'bg-red-800 text-white' : 'bg-[#1a1a1a] text-neutral-400 border border-neutral-800 hover:text-white'">
        {{day}}
        @if(day===today){<span class="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>}
      </button>
    }
  </div>

  <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-white font-semibold">
          {{selDay()}}
          @if(selDay()===today){<span class="text-green-400 text-sm"> (Hoje)</span>}
        </h2>
        <p class="text-neutral-500 text-sm">{{dayMenu().dishes.length}} pratos disponíveis</p>
      </div>
      @if(!editMode()){
        <button (click)="startEdit()" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm transition-colors">Editar</button>
      } @else {
        <div class="flex gap-2">
          <button (click)="editMode.set(false)" class="bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl px-4 py-2 text-sm transition-colors">Cancelar</button>
          <button (click)="saveEdit()" class="bg-green-800 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-sm transition-colors">✓ Salvar</button>
        </div>
      }
    </div>

    @if(!editMode()){
      <!-- VIEW MODE -->
      <div class="space-y-3">
        @if(dayMenu().dishes.length===0){
          <p class="text-neutral-500 text-sm text-center py-8">Nenhum prato configurado para este dia</p>
        } @else {
          @for(id of dayMenu().dishes; track id){
            @let dish = getDish(id);
            @if(dish){
              <div class="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3">
                <img [src]="dish.image" [alt]="dish.name" class="w-12 h-12 rounded-lg object-cover"/>
                <div class="flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="text-white text-sm">{{dish.name}}</p>
                    @if(isSpecialInDay(id)){<span class="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full">⭐ Especial</span>}
                    @if(getPromoInDay(id)){<span class="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">🏷 -{{getPromoInDay(id)!.discount}}%</span>}
                  </div>
                  <p class="text-neutral-500 text-xs">R$ {{dish.price.toFixed(2)}}</p>
                </div>
              </div>
            }
          }
        }
      </div>
    } @else {
      <!-- EDIT MODE -->
      <div class="space-y-2">
        <p class="text-neutral-400 text-sm mb-3">Selecione os pratos, destaque o especial e configure promoções:</p>
        @for(dish of activeDishes(); track dish.id){
          <div class="rounded-xl border p-3 transition-colors"
            [class]="isDishSelected(dish.id) ? 'bg-[#1e1e1e] border-red-800/40' : 'bg-[#1a1a1a] border-neutral-800/50'">
            <div class="flex items-center gap-3">
              <button (click)="toggleDish(dish.id)"
                class="w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors text-xs"
                [class]="isDishSelected(dish.id) ? 'bg-red-800 border-red-700 text-white' : 'border-neutral-600'">
                {{isDishSelected(dish.id) ? '✓' : ''}}
              </button>
              <img [src]="dish.image" [alt]="dish.name" class="w-10 h-10 rounded-lg object-cover"/>
              <div class="flex-1 min-w-0">
                <p class="text-white text-sm truncate">{{dish.name}}</p>
                <p class="text-neutral-500 text-xs">R$ {{dish.price.toFixed(2)}}</p>
              </div>
              @if(isDishSelected(dish.id)){
                <div class="flex items-center gap-2">
                  <button (click)="setSpecial(dish.id)" title="Especial do dia"
                    class="p-1.5 rounded-lg transition-colors text-xs"
                    [class]="isDishSpecialInEdit(dish.id) ? 'bg-yellow-700 text-white' : 'bg-neutral-700 text-neutral-400 hover:text-yellow-400'">⭐</button>
                  <button (click)="togglePromo(dish.id)" title="Promoção"
                    class="p-1.5 rounded-lg transition-colors text-xs"
                    [class]="getPromoInEdit(dish.id) ? 'bg-green-700 text-white' : 'bg-neutral-700 text-neutral-400 hover:text-green-400'">🏷</button>
                </div>
              }
            </div>
            @if(getPromoInEdit(dish.id)){
              <div class="mt-2 ml-8 flex items-center gap-2">
                <label class="text-neutral-400 text-xs">Desconto:</label>
                <input type="number" min="1" max="90"
                  [value]="getPromoInEdit(dish.id)!.discount"
                  (change)="setPromoDiscount(dish.id, $any($event.target).valueAsNumber)"
                  class="w-16 bg-[#141414] border border-neutral-700 text-white rounded-lg px-2 py-1 text-xs outline-none"/>
                <span class="text-neutral-400 text-xs">%</span>
              </div>
            }
          </div>
        }
      </div>
    }
  </div>
</div>`
})
export class AdminWeeklyMenuComponent {
  days = DAYS;
  today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  selDay = signal(DAYS[0]);
  editMode = signal(false);
  tempMenu = signal<WeeklyMenuDay>({ dishes: [], promotions: [] });

  constructor(public s: AppStateService) {}

  dayMenu() { return this.s.weeklyMenu()[this.selDay()] || { dishes: [], promotions: [] }; }
  activeDishes(): Dish[] { return this.s.dishes().filter(d => d.active); }
  getDish(id: string) { return this.s.dishes().find(d => d.id === id) ?? null; }

  // View mode helpers
  isSpecialInDay(id: string) { return this.dayMenu().specialDishId === id; }
  getPromoInDay(id: string) { return this.dayMenu().promotions?.find(p => p.dishId === id) ?? null; }

  // Edit mode helpers
  isDishSelected(id: string) { return this.tempMenu().dishes.includes(id); }
  isDishSpecialInEdit(id: string) { return this.tempMenu().specialDishId === id; }
  getPromoInEdit(id: string) { return this.tempMenu().promotions.find(p => p.dishId === id) ?? null; }

  selectDay(day: string) { this.selDay.set(day); this.editMode.set(false); }

  startEdit() {
    this.tempMenu.set(JSON.parse(JSON.stringify(this.dayMenu())));
    this.editMode.set(true);
  }
  saveEdit() {
    this.s.updateWeeklyMenu(this.selDay(), this.tempMenu());
    this.editMode.set(false);
  }
  toggleDish(id: string) {
    this.tempMenu.update(m => ({
      ...m,
      dishes: m.dishes.includes(id) ? m.dishes.filter(d => d !== id) : [...m.dishes, id]
    }));
  }
  setSpecial(id: string) {
    this.tempMenu.update(m => ({ ...m, specialDishId: m.specialDishId === id ? undefined : id }));
  }
  togglePromo(id: string) {
    this.tempMenu.update(m => {
      const ex = m.promotions.find(p => p.dishId === id);
      return ex
        ? { ...m, promotions: m.promotions.filter(p => p.dishId !== id) }
        : { ...m, promotions: [...m.promotions, { dishId: id, discount: 10 }] };
    });
  }
  setPromoDiscount(dishId: string, discount: number) {
    this.tempMenu.update(m => ({
      ...m,
      promotions: m.promotions.map(p => p.dishId === dishId ? { ...p, discount } : p)
    }));
  }
}
