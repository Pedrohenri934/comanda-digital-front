import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventoryItem } from '../../models/models';

const INITIAL: InventoryItem[] = [
  {id:'1', name:'Picanha',            category:'carne',   quantity:45,  minQuantity:20, unit:'kg', lastUpdate:'2026-03-25'},
  {id:'2', name:'Costela',            category:'carne',   quantity:15,  minQuantity:25, unit:'kg', lastUpdate:'2026-03-25'},
  {id:'3', name:'Alcatra',            category:'carne',   quantity:30,  minQuantity:15, unit:'kg', lastUpdate:'2026-03-24'},
  {id:'4', name:'Alho',               category:'tempero', quantity:5,   minQuantity:2,  unit:'kg', lastUpdate:'2026-03-23'},
  {id:'5', name:'Sal Grosso',         category:'tempero', quantity:8,   minQuantity:5,  unit:'kg', lastUpdate:'2026-03-25'},
  {id:'6', name:'Farofa',             category:'outro',   quantity:12,  minQuantity:10, unit:'kg', lastUpdate:'2026-03-24'},
  {id:'7', name:'Vinagrete',          category:'vegetal', quantity:3,   minQuantity:5,  unit:'kg', lastUpdate:'2026-03-25'},
  {id:'8', name:'Cerveja Skol 350ml', category:'bebida',  quantity:120, minQuantity:50, unit:'un', lastUpdate:'2026-03-25'},
  {id:'9', name:'Coca-Cola 350ml',    category:'bebida',  quantity:45,  minQuantity:60, unit:'un', lastUpdate:'2026-03-24'},
  {id:'10',name:'Batata',             category:'vegetal', quantity:28,  minQuantity:15, unit:'kg', lastUpdate:'2026-03-25'},
  {id:'11',name:'Mandioca',           category:'vegetal', quantity:8,   minQuantity:10, unit:'kg', lastUpdate:'2026-03-24'},
  {id:'12',name:'Pimenta do Reino',   category:'tempero', quantity:1.5, minQuantity:1,  unit:'kg', lastUpdate:'2026-03-22'},
];

const CATS = [
  {v:'carne',   l:'Carnes'},
  {v:'vegetal', l:'Vegetais'},
  {v:'tempero', l:'Temperos'},
  {v:'bebida',  l:'Bebidas'},
  {v:'outro',   l:'Outros'},
] as const;

const UNITS = ['kg','g','l','ml','un'] as const;

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [FormsModule],
  template: `
<div class="p-4 md:p-6 max-w-6xl mx-auto">
  <div class="mb-6">
    <h1 class="text-white text-2xl font-semibold">📦 Controle de Estoque</h1>
    <p class="text-neutral-400 text-sm mt-1">Gerencie ingredientes e produtos do restaurante</p>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div class="bg-[#141414] border border-neutral-800 rounded-xl p-5">
      <div class="flex items-center justify-between mb-2"><p class="text-neutral-400 text-sm">Total de Itens</p><span>📦</span></div>
      <p class="text-3xl text-white font-bold">{{inventory().length}}</p>
    </div>
    <div class="bg-[#141414] border border-red-800/50 rounded-xl p-5">
      <div class="flex items-center justify-between mb-2"><p class="text-neutral-400 text-sm">Estoque Baixo</p><span>⚠️</span></div>
      <p class="text-3xl text-red-400 font-bold">{{lowCount()}}</p>
    </div>
    <div class="bg-[#141414] border border-neutral-800 rounded-xl p-5">
      <div class="flex items-center justify-between mb-2"><p class="text-neutral-400 text-sm">Categorias</p><span>📂</span></div>
      <p class="text-3xl text-white font-bold">{{cats.length}}</p>
    </div>
  </div>

  <!-- Filters -->
  <div class="bg-[#141414] border border-neutral-800 rounded-xl p-4 mb-6">
    <div class="flex flex-col lg:flex-row gap-3">
      <div class="flex-1 relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">🔍</span>
        <input [(ngModel)]="search" placeholder="Buscar item..."
          class="w-full bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-purple-700 placeholder:text-neutral-600"/>
      </div>
      <select [(ngModel)]="filterCat"
        class="lg:w-48 bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none">
        <option value="">Todas as Categorias</option>
        @for(c of cats; track c.v){<option [value]="c.v">{{c.l}}</option>}
      </select>
      <button (click)="toggleLowStock()"
        class="px-4 py-2.5 rounded-xl text-sm transition-colors border"
        [class]="showLow() ? 'bg-red-900/40 border-red-700/50 text-red-300' : 'bg-[#0a0a0a] border-neutral-800 text-neutral-400 hover:text-white'">
        ⚠️ Estoque Baixo {{showLow() ? '(ativo)' : ''}}
      </button>
      <button (click)="openModal()"
        class="bg-purple-900/40 border border-purple-700/50 text-purple-300 hover:bg-purple-900/60 rounded-xl px-4 py-2.5 text-sm transition-colors">
        + Adicionar Item
      </button>
    </div>
  </div>

  <!-- Table -->
  <div class="bg-[#141414] border border-neutral-800 rounded-xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-[#0a0a0a] border-b border-neutral-800">
          <tr>
            <th class="text-left text-neutral-400 text-xs p-4 font-medium">Item</th>
            <th class="text-left text-neutral-400 text-xs p-4 font-medium">Categoria</th>
            <th class="text-right text-neutral-400 text-xs p-4 font-medium">Qtd. Atual</th>
            <th class="text-right text-neutral-400 text-xs p-4 font-medium">Qtd. Mínima</th>
            <th class="text-center text-neutral-400 text-xs p-4 font-medium">Status</th>
            <th class="text-left text-neutral-400 text-xs p-4 font-medium">Atualização</th>
            <th class="text-right text-neutral-400 text-xs p-4 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          @if(filtered().length===0){
            <tr><td colspan="7" class="text-center text-neutral-500 py-10">Nenhum item encontrado</td></tr>
          }
          @for(item of filtered(); track item.id){
            @let low = item.quantity <= item.minQuantity;
            @let pct = item.quantity / item.minQuantity;
            <tr class="border-b border-neutral-800 hover:bg-neutral-900/30 transition-colors">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    [class]="low ? 'bg-red-900/30 border border-red-800/50' : 'bg-neutral-800'">📦</div>
                  <span class="text-white text-sm font-medium">{{item.name}}</span>
                </div>
              </td>
              <td class="p-4"><span class="text-neutral-400 text-sm">{{catLabel(item.category)}}</span></td>
              <td class="p-4 text-right">
                <span class="font-semibold text-sm" [class]="low ? 'text-red-400' : 'text-white'">
                  {{item.quantity}} {{item.unit}}
                </span>
              </td>
              <td class="p-4 text-right"><span class="text-neutral-500 text-sm">{{item.minQuantity}} {{item.unit}}</span></td>
              <td class="p-4">
                <div class="flex justify-center">
                  @if(low){
                    <span class="text-xs px-2 py-1 rounded-lg bg-red-900/30 border border-red-800/50 text-red-400">⚠️ Baixo</span>
                  } @else if(pct < 1.5){
                    <span class="text-xs px-2 py-1 rounded-lg bg-yellow-900/30 border border-yellow-800/50 text-yellow-400">Médio</span>
                  } @else {
                    <span class="text-xs px-2 py-1 rounded-lg bg-green-900/30 border border-green-800/50 text-green-400">OK</span>
                  }
                </div>
              </td>
              <td class="p-4"><span class="text-neutral-500 text-sm">{{fmtDate(item.lastUpdate)}}</span></td>
              <td class="p-4">
                <div class="flex items-center justify-end gap-2">
                  <button (click)="openModal(item)" class="text-neutral-400 hover:text-white text-sm p-1 transition-colors">✏️</button>
                  <button (click)="deleteItem(item.id)" class="text-neutral-500 hover:text-red-400 text-sm p-1 transition-colors">🗑️</button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>

  <!-- Modal -->
  @if(modalOpen()){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="closeModal()"></div>
      <div class="relative w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-white font-semibold">{{editingItem() ? 'Editar Item' : 'Adicionar Item'}}</h2>
          <button (click)="closeModal()" class="text-neutral-400 hover:text-white">✕</button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="text-neutral-300 text-sm block mb-1">Nome do Item *</label>
            <input [(ngModel)]="form.name" placeholder="Ex: Picanha"
              class="w-full bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-700 placeholder:text-neutral-600"/>
          </div>
          <div>
            <label class="text-neutral-300 text-sm block mb-1">Categoria</label>
            <select [(ngModel)]="form.category"
              class="w-full bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm outline-none">
              @for(c of cats; track c.v){<option [value]="c.v">{{c.l}}</option>}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-neutral-300 text-sm block mb-1">Quantidade Atual *</label>
              <input [(ngModel)]="form.quantity" type="number" min="0" placeholder="0"
                class="w-full bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm outline-none"/>
            </div>
            <div>
              <label class="text-neutral-300 text-sm block mb-1">Qtd. Mínima *</label>
              <input [(ngModel)]="form.minQuantity" type="number" min="1" placeholder="0"
                class="w-full bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm outline-none"/>
            </div>
          </div>
          <div>
            <label class="text-neutral-300 text-sm block mb-1">Unidade de Medida</label>
            <select [(ngModel)]="form.unit"
              class="w-full bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm outline-none">
              @for(u of units; track u){<option [value]="u">{{u}}</option>}
            </select>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button (click)="closeModal()" class="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl py-3 text-sm transition-colors">Cancelar</button>
          <button (click)="saveItem()" class="flex-1 bg-purple-800 hover:bg-purple-700 text-white rounded-xl py-3 text-sm transition-colors">
            {{editingItem() ? 'Salvar' : 'Adicionar'}}
          </button>
        </div>
      </div>
    </div>
  }
</div>`
})
export class AdminInventoryComponent {
  inventory = signal<InventoryItem[]>(INITIAL);
  cats = CATS;
  units = UNITS;
  search = '';
  filterCat = '';
  showLow = signal(false);
  modalOpen = signal(false);
  editingItem = signal<InventoryItem | null>(null);
  form = { name:'', category:'carne' as InventoryItem['category'], quantity:'', minQuantity:'', unit:'kg' as InventoryItem['unit'] };

  filtered() {
    return this.inventory().filter(item => {
      const ms = !this.search || item.name.toLowerCase().includes(this.search.toLowerCase());
      const mc = !this.filterCat || item.category === this.filterCat;
      const ml = !this.showLow() || item.quantity <= item.minQuantity;
      return ms && mc && ml;
    });
  }

  lowCount() { return this.inventory().filter(i => i.quantity <= i.minQuantity).length; }
  catLabel(v: string) { return CATS.find(c => c.v === v)?.l || v; }
  fmtDate(d: string) { return new Date(d).toLocaleDateString('pt-BR'); }
  toggleLowStock() { this.showLow.update(v => !v); }

  openModal(item?: InventoryItem) {
    this.editingItem.set(item ?? null);
    if (item) {
      this.form = { name: item.name, category: item.category, quantity: String(item.quantity), minQuantity: String(item.minQuantity), unit: item.unit };
    } else {
      this.form = { name:'', category:'carne', quantity:'', minQuantity:'', unit:'kg' };
    }
    this.modalOpen.set(true);
  }

  closeModal() { this.modalOpen.set(false); }

  saveItem() {
    if (!this.form.name || !this.form.quantity || !this.form.minQuantity) return;
    const item: InventoryItem = {
      id: this.editingItem()?.id || Date.now().toString(),
      name: this.form.name,
      category: this.form.category,
      quantity: parseFloat(this.form.quantity),
      minQuantity: parseFloat(this.form.minQuantity),
      unit: this.form.unit,
      lastUpdate: new Date().toISOString().split('T')[0],
    };
    if (this.editingItem()) {
      this.inventory.update(inv => inv.map(i => i.id === item.id ? item : i));
    } else {
      this.inventory.update(inv => [...inv, item]);
    }
    this.closeModal();
  }

  deleteItem(id: string) {
    if (confirm('Remover este item do estoque?')) {
      this.inventory.update(inv => inv.filter(i => i.id !== id));
    }
  }
}
