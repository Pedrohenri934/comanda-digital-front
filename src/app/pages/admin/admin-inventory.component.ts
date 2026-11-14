import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CadastroAdminService } from '../../services/cadastro-admin.service';
import { mensagemDeErro } from '../../services/auth.service';
import { Ingrediente, IngredienteForm, Unidade } from '../../models/api.models';

// Ingredientes e saldo de estoque (o saldo vem das movimentacoes: compras, vendas e estornos).
@Component({ selector:'app-admin-inventory', standalone:true, imports:[FormsModule], template:`
<div class="p-4 md:p-6 max-w-5xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div><h1 class="text-white text-2xl font-semibold">Estoque e Ingredientes</h1>
      <p class="text-neutral-400 text-sm mt-1">{{lista().length}} ingrediente(s) · <span class="text-red-400">{{abaixo()}} abaixo do mínimo</span></p></div>
    <button (click)="novo()" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm">+ Novo ingrediente</button>
  </div>
  <input [(ngModel)]="buscaTxt" (ngModelChange)="busca.set($event)" placeholder="Buscar por nome ou SKU..." [class]="campo" class="mb-4"/>
  @if(erro()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{{erro()}}</div>}
  @if(carregando()){<p class="text-center py-12 text-neutral-500">Carregando...</p>}
  <div class="space-y-2">
    @for(i of filtrados(); track i.id){
      <div class="bg-[#141414] border rounded-xl p-4 flex flex-wrap items-center gap-3" [class]="i.abaixoDoMinimo && i.status==='ATIVO' ? 'border-red-800/70' : 'border-neutral-800'" [class.opacity-60]="i.status==='INATIVO'">
        <div class="flex-1 min-w-[10rem]">
          <p class="text-white text-sm">{{i.nome}} @if(i.status==='INATIVO'){<span class="text-xs text-neutral-500">(inativo)</span>}</p>
          <p class="text-neutral-500 text-xs">SKU {{i.sku}} · custo R$ {{i.custoUnitario}} /{{i.unidadePadrao}}</p>
        </div>
        <div class="text-right">
          <p class="text-sm" [class]="i.abaixoDoMinimo?'text-red-400 font-semibold':'text-white'">{{i.saldo}} {{i.unidadePadrao}}</p>
          <p class="text-neutral-500 text-xs">mínimo {{i.estoqueMinimo}} {{i.unidadePadrao}}@if(i.abaixoDoMinimo){ · ⚠ repor}</p>
        </div>
        <button (click)="editar(i)" class="text-sm text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-800">Editar</button>
        @if(i.status==='ATIVO'){<button (click)="alternar(i)" class="text-sm text-red-400 px-3 py-1.5 rounded-lg border border-red-900/60">Inativar</button>}
        @else {<button (click)="alternar(i)" class="text-sm text-green-400 px-3 py-1.5 rounded-lg border border-green-900/60">Reativar</button>}
      </div>
    }
  </div>

  @if(aberto()){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="aberto.set(false)"></div>
      <div class="relative w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-6 space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 class="text-white font-semibold">{{editId()?'Editar ingrediente':'Novo ingrediente'}}</h2>
        @if(erroForm()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-3 py-2 text-sm">{{erroForm()}}</div>}
        <input [(ngModel)]="form.nome" placeholder="Nome *" maxlength="120" [class]="campo"/>
        <input [(ngModel)]="form.sku" placeholder="SKU * (ex.: CARNE-001)" maxlength="40" [class]="campo"/>
        <select [(ngModel)]="form.unidadePadrao" [class]="campo">
          @for(u of unidades; track u){<option [value]="u">{{u}}</option>}
        </select>
        <input [(ngModel)]="form.estoqueMinimo" type="number" min="0" step="any" placeholder="Estoque mínimo *" [class]="campo"/>
        <input [(ngModel)]="form.custoUnitario" type="number" min="0" step="any" placeholder="Custo por unidade padrão (R$) *" [class]="campo"/>
        <div class="flex justify-end gap-2 pt-2">
          <button (click)="aberto.set(false)" class="px-4 py-2 rounded-xl text-sm text-neutral-300 bg-neutral-800">Cancelar</button>
          <button (click)="salvar()" [disabled]="salvando()" class="px-4 py-2 rounded-xl text-sm text-white bg-red-800 hover:bg-red-700 disabled:opacity-50">{{salvando()?'Salvando...':'Salvar'}}</button>
        </div>
      </div>
    </div>
  }
</div>` })
export class AdminInventoryComponent implements OnInit {
  private api = inject(CadastroAdminService);
  campo = 'w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600';
  unidades: Unidade[] = ['G', 'KG', 'ML', 'L', 'UN'];
  lista = signal<Ingrediente[]>([]);
  busca = signal(''); buscaTxt = '';
  carregando = signal(true); erro = signal(''); erroForm = signal('');
  aberto = signal(false); salvando = signal(false); editId = signal<number | null>(null);
  form: IngredienteForm = this.vazio();

  private vazio(): IngredienteForm { return { nome: '', sku: '', unidadePadrao: 'G', estoqueMinimo: null, custoUnitario: null }; }
  filtrados = () => { const q = this.busca().trim().toLowerCase(); return q ? this.lista().filter(i => i.nome.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)) : this.lista(); };
  abaixo = () => this.lista().filter(i => i.abaixoDoMinimo && i.status === 'ATIVO').length;

  ngOnInit() { this.carregar(); }
  carregar() {
    this.api.ingredientes().subscribe({
      next: l => { this.lista.set(l); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemDeErro(e)); this.carregando.set(false); },
    });
  }
  novo() { this.editId.set(null); this.form = this.vazio(); this.erroForm.set(''); this.aberto.set(true); }
  editar(i: Ingrediente) {
    this.editId.set(i.id); this.erroForm.set('');
    this.form = { nome: i.nome, sku: i.sku, unidadePadrao: i.unidadePadrao, estoqueMinimo: i.estoqueMinimo, custoUnitario: i.custoUnitario };
    this.aberto.set(true);
  }
  salvar() {
    this.salvando.set(true); this.erroForm.set('');
    const id = this.editId();
    const req = id ? this.api.atualizarIngrediente(id, this.form) : this.api.criarIngrediente(this.form);
    req.subscribe({
      next: () => { this.salvando.set(false); this.aberto.set(false); this.carregar(); },
      error: e => { this.salvando.set(false); this.erroForm.set(mensagemDeErro(e)); },
    });
  }
  alternar(i: Ingrediente) {
    this.erro.set('');
    const req = i.status === 'ATIVO' ? this.api.inativarIngrediente(i.id) : this.api.reativarIngrediente(i.id);
    req.subscribe({ next: () => this.carregar(), error: e => this.erro.set(mensagemDeErro(e)) });
  }
}
