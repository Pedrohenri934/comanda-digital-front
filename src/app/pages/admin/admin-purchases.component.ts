import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompraAdminService } from '../../services/compra-admin.service';
import { CadastroAdminService } from '../../services/cadastro-admin.service';
import { mensagemDeErro } from '../../services/auth.service';
import { Compra, CompraItemForm, Fornecedor, Ingrediente, StatusCompra } from '../../models/api.models';
import { dataHora, moeda } from '../../models/status-pedido';

const COR: Record<StatusCompra, string> = {
  RASCUNHO: 'text-neutral-300 bg-neutral-800/60 border-neutral-700',
  ENVIADO: 'text-blue-400 bg-blue-900/20 border-blue-800',
  RECEBIDO: 'text-green-400 bg-green-900/20 border-green-800',
  CANCELADO: 'text-red-400 bg-red-900/20 border-red-800',
};

// Compras: RASCUNHO > ENVIADO > RECEBIDO. Ao receber, a API da entrada no estoque de cada item.
@Component({ selector:'app-admin-purchases', standalone:true, imports:[FormsModule], template:`
<div class="p-4 md:p-6 max-w-5xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div><h1 class="text-white text-2xl font-semibold">Compras</h1><p class="text-neutral-400 text-sm mt-1">Receber uma compra aumenta o estoque</p></div>
    <button (click)="nova()" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm">+ Nova compra</button>
  </div>
  <div class="flex gap-2 overflow-x-auto pb-2 mb-4">
    @for(f of filtros; track f.key){
      <button (click)="filtro.set(f.key)" class="flex-shrink-0 px-4 py-2 rounded-xl text-sm" [class]="filtro()===f.key?'bg-red-800 text-white':'bg-[#1a1a1a] text-neutral-400 border border-neutral-800 hover:text-white'">{{f.label}}</button>
    }
  </div>
  @if(erro()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{{erro()}}</div>}
  @if(carregando()){<p class="text-center py-12 text-neutral-500">Carregando...</p>}
  @else if(filtradas().length===0 && !erro()){<p class="text-center py-12 text-neutral-500">Nenhuma compra encontrada</p>}
  <div class="space-y-3">
    @for(c of filtradas(); track c.id){
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-4">
        <div class="flex flex-wrap items-center gap-3 mb-3">
          <div class="flex-1 min-w-[12rem]">
            <div class="flex items-center gap-2"><span class="text-white font-mono text-sm">#{{c.id}}</span>
              <span class="text-xs px-2 py-0.5 rounded-lg border" [class]="cor[c.status]">{{c.status}}</span></div>
            <p class="text-neutral-300 text-sm mt-1">{{c.fornecedorNome}}</p>
            <p class="text-neutral-500 text-xs">{{data(c.criadoEm)}}</p>
          </div>
          <p class="text-red-400 font-bold">{{moeda(c.valorTotal)}}</p>
        </div>
        @for(i of c.itens; track i.ingredienteId){
          <div class="flex justify-between text-sm py-0.5"><span class="text-neutral-300">{{i.ingredienteNome}} — {{i.quantidade}} {{i.unidade}} × {{moeda(i.precoUnitario)}}</span><span class="text-neutral-400">{{moeda(i.subtotal)}}</span></div>
        }
        @if(erros()[c.id]){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-lg px-3 py-2 text-xs mt-3">{{erros()[c.id]}}</div>}
        <div class="flex flex-wrap gap-2 mt-3">
          @if(c.status==='RASCUNHO'){
            <button (click)="editar(c)" class="text-xs text-neutral-300 px-3 py-1.5 rounded-lg bg-neutral-800">Editar</button>
            <button (click)="mudar(c,'ENVIADO')" class="text-xs text-blue-300 px-3 py-1.5 rounded-lg border border-blue-900/60">Marcar como enviado</button>
          }
          @if(c.status==='ENVIADO'){<button (click)="mudar(c,'RECEBIDO')" class="text-xs text-green-400 px-3 py-1.5 rounded-lg border border-green-900/60">Receber (entrada no estoque)</button>}
          @if(c.status==='RASCUNHO' || c.status==='ENVIADO'){<button (click)="mudar(c,'CANCELADO')" class="text-xs text-red-400 px-3 py-1.5 rounded-lg border border-red-900/60">Cancelar</button>}
        </div>
      </div>
    }
  </div>

  @if(aberto()){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="aberto.set(false)"></div>
      <div class="relative w-full max-w-2xl bg-[#111111] border border-neutral-800 rounded-2xl p-6 space-y-3 max-h-[92vh] overflow-y-auto">
        <h2 class="text-white font-semibold">{{editId()?'Editar compra #'+editId():'Nova compra'}}</h2>
        @if(erroForm()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-3 py-2 text-sm">{{erroForm()}}</div>}
        <select [(ngModel)]="fornecedorId" [class]="campo">
          <option [ngValue]="null">Fornecedor *</option>
          @for(f of fornecedoresAtivos(); track f.id){<option [ngValue]="f.id">{{f.razaoSocial}}</option>}
        </select>
        <p class="text-neutral-400 text-xs">ITENS (quantidade na unidade padrão do ingrediente, preço por essa unidade)</p>
        @for(it of itens(); track $index; let idx=$index){
          <div class="grid grid-cols-12 gap-2 items-center">
            <select [(ngModel)]="it.ingredienteId" class="col-span-5 bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-2 py-2 text-sm">
              <option [ngValue]="0">Ingrediente</option>
              @for(g of ingredientesAtivos(); track g.id){<option [ngValue]="g.id">{{g.nome}} ({{g.unidadePadrao}})</option>}
            </select>
            <input [(ngModel)]="it.quantidade" type="number" min="0" step="any" placeholder="Qtd" class="col-span-3 bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-2 py-2 text-sm"/>
            <input [(ngModel)]="it.precoUnitario" type="number" min="0" step="any" placeholder="Preço un." class="col-span-3 bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-2 py-2 text-sm"/>
            <button (click)="removerItem(idx)" class="col-span-1 text-neutral-500 hover:text-red-400" aria-label="Remover">🗑</button>
          </div>
        }
        <button (click)="adicionarItem()" class="text-sm text-blue-300 hover:text-blue-200">+ Adicionar item</button>
        <div class="flex items-center justify-between pt-2">
          <p class="text-neutral-300 text-sm">Total estimado: <b class="text-white">{{moeda(totalForm())}}</b></p>
          <div class="flex gap-2">
            <button (click)="aberto.set(false)" class="px-4 py-2 rounded-xl text-sm text-neutral-300 bg-neutral-800">Cancelar</button>
            <button (click)="salvar()" [disabled]="salvando()" class="px-4 py-2 rounded-xl text-sm text-white bg-red-800 hover:bg-red-700 disabled:opacity-50">{{salvando()?'Salvando...':'Salvar rascunho'}}</button>
          </div>
        </div>
      </div>
    </div>
  }
</div>` })
export class AdminPurchasesComponent implements OnInit {
  private api = inject(CompraAdminService);
  private cadastro = inject(CadastroAdminService);
  moeda = moeda; data = dataHora; cor = COR;
  campo = 'w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600';
  filtros: { key: StatusCompra | 'todas'; label: string }[] = [
    { key: 'todas', label: 'Todas' }, { key: 'RASCUNHO', label: 'Rascunho' }, { key: 'ENVIADO', label: 'Enviadas' },
    { key: 'RECEBIDO', label: 'Recebidas' }, { key: 'CANCELADO', label: 'Canceladas' },
  ];
  filtro = signal<StatusCompra | 'todas'>('todas');
  compras = signal<Compra[]>([]);
  fornecedores = signal<Fornecedor[]>([]);
  ingredientes = signal<Ingrediente[]>([]);
  fornecedoresAtivos = computed(() => this.fornecedores().filter(f => f.status === 'ATIVO'));
  ingredientesAtivos = computed(() => this.ingredientes().filter(i => i.status === 'ATIVO'));
  filtradas = computed(() => { const f = this.filtro(); return f === 'todas' ? this.compras() : this.compras().filter(c => c.status === f); });

  carregando = signal(true); erro = signal(''); erros = signal<Record<number, string>>({});
  aberto = signal(false); salvando = signal(false); erroForm = signal(''); editId = signal<number | null>(null);
  fornecedorId: number | null = null;
  itens = signal<CompraItemForm[]>([]);
  totalForm = () => this.itens().reduce((s, i) => s + (Number(i.quantidade) || 0) * (Number(i.precoUnitario) || 0), 0);

  ngOnInit() {
    this.carregar();
    this.api.fornecedores().subscribe({ next: f => this.fornecedores.set(f), error: e => this.erro.set(mensagemDeErro(e)) });
    this.cadastro.ingredientes().subscribe({ next: i => this.ingredientes.set(i), error: () => {} });
  }

  carregar() {
    this.api.compras().subscribe({
      next: l => { this.compras.set(l); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemDeErro(e)); this.carregando.set(false); },
    });
  }

  nova() { this.editId.set(null); this.fornecedorId = null; this.itens.set([{ ingredienteId: 0, quantidade: 0, precoUnitario: 0 }]); this.erroForm.set(''); this.aberto.set(true); }
  editar(c: Compra) {
    this.editId.set(c.id); this.fornecedorId = c.fornecedorId; this.erroForm.set('');
    this.itens.set(c.itens.map(i => ({ ingredienteId: i.ingredienteId, quantidade: i.quantidade, precoUnitario: i.precoUnitario })));
    this.aberto.set(true);
  }
  adicionarItem() { this.itens.update(l => [...l, { ingredienteId: 0, quantidade: 0, precoUnitario: 0 }]); }
  removerItem(idx: number) { this.itens.update(l => l.filter((_, i) => i !== idx)); }

  salvar() {
    this.erroForm.set('');
    const itens = this.itens();
    if (!this.fornecedorId) { this.erroForm.set('Escolha o fornecedor.'); return; }
    if (itens.length === 0 || itens.some(i => !i.ingredienteId || !(Number(i.quantidade) > 0))) {
      this.erroForm.set('Escolha o ingrediente e informe a quantidade em todos os itens.'); return;
    }
    const corpo = itens.map(i => ({ ingredienteId: i.ingredienteId, quantidade: Number(i.quantidade), precoUnitario: Number(i.precoUnitario) || 0 }));
    this.salvando.set(true);
    const id = this.editId();
    const req = id ? this.api.atualizarCompra(id, this.fornecedorId, corpo) : this.api.criarCompra(this.fornecedorId, corpo);
    req.subscribe({
      next: () => { this.salvando.set(false); this.aberto.set(false); this.carregar(); },
      error: e => { this.salvando.set(false); this.erroForm.set(mensagemDeErro(e)); },
    });
  }

  mudar(c: Compra, status: StatusCompra) {
    this.erros.update(m => ({ ...m, [c.id]: '' }));
    this.api.statusCompra(c.id, status).subscribe({
      next: () => this.carregar(),
      error: e => this.erros.update(m => ({ ...m, [c.id]: mensagemDeErro(e) })),
    });
  }
}
