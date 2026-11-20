import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CadastroAdminService } from '../../services/cadastro-admin.service';
import { mensagemDeErro } from '../../services/auth.service';
import { CategoriaAdmin, FichaItem, GrupoComboForm, Ingrediente, PratoAdmin, PratoForm, StatusPratoApi, Unidade } from '../../models/api.models';
import { corFoodCost, moeda } from '../../models/status-pedido';

const STATUS_COR: Record<StatusPratoApi, string> = {
  ATIVO: 'text-green-400 bg-green-900/20 border-green-800',
  PAUSADO: 'text-yellow-400 bg-yellow-900/20 border-yellow-800',
  INATIVO: 'text-neutral-400 bg-neutral-800/50 border-neutral-700',
};
const UNIDADES_COMPATIVEIS: Record<Unidade, Unidade[]> = { G: ['G', 'KG'], KG: ['G', 'KG'], ML: ['ML', 'L'], L: ['ML', 'L'], UN: ['UN'] };

// Gerenciar pratos (RF-009 a RF-012) e ficha tecnica (RF-013/014): custo por porcao e food cost calculados pela API.
@Component({ selector:'app-admin-dishes', standalone:true, imports:[FormsModule], template:`
<div class="p-4 md:p-6 max-w-5xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div><h1 class="text-white text-2xl font-semibold">Gerenciar Pratos</h1><p class="text-neutral-400 text-sm mt-1">{{pratos().length}} prato(s)</p></div>
    <button (click)="novo()" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm">+ Novo prato</button>
  </div>
  <div class="flex gap-2 overflow-x-auto pb-2 mb-4">
    @for(f of filtros; track f.key){
      <button (click)="filtro.set(f.key)" class="flex-shrink-0 px-4 py-2 rounded-xl text-sm" [class]="filtro()===f.key?'bg-red-800 text-white':'bg-[#1a1a1a] text-neutral-400 border border-neutral-800 hover:text-white'">{{f.label}}</button>
    }
  </div>
  @if(erro()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{{erro()}}</div>}
  @if(carregando()){<p class="text-center py-12 text-neutral-500">Carregando...</p>}
  <div class="space-y-3">
    @for(p of filtrados(); track p.id){
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex-1 min-w-[12rem]">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-white text-sm font-medium">{{p.nome}}</p>
              <span class="text-xs px-2 py-0.5 rounded-lg border" [class]="cor[p.status]">{{p.status}}</span>
            </div>
            <p class="text-neutral-500 text-xs mt-1">{{p.categoria}} · ⏱ {{p.tempoPreparoMin}} min</p>
          </div>
          <div class="text-right">
            <p class="text-red-400 font-bold">{{moeda(p.precoVenda)}}</p>
            @if(p.temFicha){<p class="text-xs text-neutral-400">custo {{moeda(p.custoPorPorcao!)}} · food cost <b [class]="corFC(p.foodCost)">{{p.foodCost}}%</b></p>}
            @else {<p class="text-xs text-yellow-500">sem ficha técnica</p>}
          </div>
        </div>
        @if(erros()[p.id]){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-lg px-3 py-2 text-xs mt-3">{{erros()[p.id]}}</div>}
        <div class="flex flex-wrap gap-2 mt-3">
          <button (click)="editar(p)" class="text-xs text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-800">Editar</button>
          <button (click)="abrirFicha(p)" class="text-xs text-blue-300 hover:text-blue-200 px-3 py-1.5 rounded-lg border border-blue-900/60">Ficha técnica</button>
          <button (click)="abrirOpcoes(p)" class="text-xs text-purple-300 hover:text-purple-200 px-3 py-1.5 rounded-lg border border-purple-900/60">Opções de escolha</button>
          @if(p.status!=='ATIVO'){<button (click)="mudarStatus(p,'ATIVO')" class="text-xs text-green-400 px-3 py-1.5 rounded-lg border border-green-900/60">Ativar</button>}
          @if(p.status==='ATIVO'){<button (click)="mudarStatus(p,'PAUSADO')" class="text-xs text-yellow-400 px-3 py-1.5 rounded-lg border border-yellow-900/60">Pausar</button>}
          @if(p.status!=='INATIVO'){<button (click)="mudarStatus(p,'INATIVO')" class="text-xs text-red-400 px-3 py-1.5 rounded-lg border border-red-900/60">Inativar</button>}
        </div>
      </div>
    }
    @if(!carregando() && filtrados().length===0){<p class="text-center py-12 text-neutral-500">Nenhum prato encontrado</p>}
  </div>

  <!-- Prato: criar / editar -->
  @if(modalPrato()){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="modalPrato.set(false)"></div>
      <div class="relative w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-2xl p-6 space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 class="text-white font-semibold">{{editId()?'Editar prato':'Novo prato'}}</h2>
        @if(erroForm()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-3 py-2 text-sm">{{erroForm()}}</div>}
        <input [(ngModel)]="form.nome" placeholder="Nome *" maxlength="120" [class]="campo"/>
        <select [(ngModel)]="form.categoriaId" [class]="campo">
          <option [ngValue]="null">Categoria *</option>
          @for(c of categoriasAtivas(); track c.id){<option [ngValue]="c.id">{{c.nome}}</option>}
        </select>
        <textarea [(ngModel)]="form.descricao" rows="2" placeholder="Descrição" [class]="campo"></textarea>
        <input [(ngModel)]="form.fotoUrl" placeholder="URL da foto (opcional)" maxlength="500" [class]="campo"/>
        <div class="grid grid-cols-2 gap-3">
          <input [(ngModel)]="form.precoVenda" type="number" min="0.01" step="0.01" placeholder="Preço de venda (R$) *" [class]="campo"/>
          <input [(ngModel)]="form.tempoPreparoMin" type="number" min="1" placeholder="Preparo (min) *" [class]="campo"/>
        </div>
        @if(!editId()){<p class="text-neutral-500 text-xs">O prato nasce inativo. Cadastre a ficha técnica e depois ative.</p>}
        <div class="flex justify-end gap-2 pt-2">
          <button (click)="modalPrato.set(false)" class="px-4 py-2 rounded-xl text-sm text-neutral-300 bg-neutral-800">Cancelar</button>
          <button (click)="salvarPrato()" [disabled]="salvando()" class="px-4 py-2 rounded-xl text-sm text-white bg-red-800 hover:bg-red-700 disabled:opacity-50">{{salvando()?'Salvando...':'Salvar'}}</button>
        </div>
      </div>
    </div>
  }

  <!-- Opcoes do combo -->
  @if(opcoesPrato(); as op){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="opcoesPrato.set(null)"></div>
      <div class="relative w-full max-w-2xl bg-[#111111] border border-neutral-800 rounded-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div class="flex items-start justify-between"><h2 class="text-white font-semibold">Opções de escolha — {{op.nome}}</h2>
          <button (click)="opcoesPrato.set(null)" class="text-neutral-400 hover:text-white" aria-label="Fechar">✕</button></div>
        <p class="text-neutral-500 text-xs">Cada grupo é uma escolha do cliente (ex.: Bebida). Mínimo 0 deixa o grupo opcional. A opção pode apontar para um prato: ao pedir, esse prato dá baixa no estoque.</p>
        @if(erroOpcoes()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-3 py-2 text-sm">{{erroOpcoes()}}</div>}
        @if(okOpcoes()){<div class="bg-green-900/30 border border-green-800/50 text-green-400 rounded-xl px-3 py-2 text-sm">{{okOpcoes()}}</div>}
        @for(g of gruposForm(); track $index; let gi=$index){
          <div class="bg-[#1a1a1a] rounded-xl p-3 space-y-2">
            <div class="grid grid-cols-12 gap-2 items-center">
              <input [(ngModel)]="g.nome" placeholder="Nome do grupo (ex.: Bebida)" maxlength="80" class="col-span-6 bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-3 py-2 text-sm"/>
              <label class="col-span-2 text-xs text-neutral-400">Mín.<input [(ngModel)]="g.minimo" type="number" min="0" max="10" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-lg px-2 py-1.5 text-sm"/></label>
              <label class="col-span-2 text-xs text-neutral-400">Máx.<input [(ngModel)]="g.maximo" type="number" min="1" max="10" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-lg px-2 py-1.5 text-sm"/></label>
              <button (click)="removerGrupo(gi)" class="col-span-2 text-xs text-red-400 hover:text-red-300">Remover grupo</button>
            </div>
            @for(o of g.opcoes; track $index; let oi=$index){
              <div class="grid grid-cols-12 gap-2 items-center">
                <input [(ngModel)]="o.nome" placeholder="Opção (ex.: Guaraná)" maxlength="80" class="col-span-4 bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-3 py-2 text-sm"/>
                <select [(ngModel)]="o.pratoId" class="col-span-4 bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-2 py-2 text-sm">
                  <option [ngValue]="null">Sem baixa de estoque</option>
                  @for(pr of pratos(); track pr.id){<option [ngValue]="pr.id">{{pr.nome}}</option>}
                </select>
                <input [(ngModel)]="o.acrescimo" type="number" min="0" step="0.5" title="Acréscimo no preço (R$)" class="col-span-3 bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-2 py-2 text-sm"/>
                <button (click)="removerOpcao(gi,oi)" class="col-span-1 text-neutral-500 hover:text-red-400" aria-label="Remover opção">🗑</button>
              </div>
            }
            <button (click)="adicionarOpcao(gi)" class="text-sm text-blue-300 hover:text-blue-200">+ Adicionar opção</button>
          </div>
        }
        <button (click)="adicionarGrupo()" class="text-sm text-blue-300 hover:text-blue-200">+ Adicionar grupo de escolha</button>
        <div class="flex justify-end gap-2 pt-2">
          <button (click)="opcoesPrato.set(null)" class="px-4 py-2 rounded-xl text-sm text-neutral-300 bg-neutral-800">Fechar</button>
          <button (click)="salvarOpcoes()" [disabled]="salvando()" class="px-4 py-2 rounded-xl text-sm text-white bg-red-800 hover:bg-red-700 disabled:opacity-50">{{salvando()?'Salvando...':'Salvar opções'}}</button>
        </div>
      </div>
    </div>
  }

  <!-- Ficha tecnica -->
  @if(fichaPrato(); as fp){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="fichaPrato.set(null)"></div>
      <div class="relative w-full max-w-2xl bg-[#111111] border border-neutral-800 rounded-2xl p-6 space-y-3 max-h-[92vh] overflow-y-auto">
        <div class="flex items-start justify-between"><h2 class="text-white font-semibold">Ficha técnica — {{fp.nome}}</h2>
          <button (click)="fichaPrato.set(null)" class="text-neutral-400 hover:text-white" aria-label="Fechar">✕</button></div>
        @if(erroFicha()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-3 py-2 text-sm">{{erroFicha()}}</div>}
        @if(okFicha()){<div class="bg-green-900/30 border border-green-800/50 text-green-400 rounded-xl px-3 py-2 text-sm">{{okFicha()}}</div>}
        <div class="grid grid-cols-3 gap-3 items-center">
          <label class="text-neutral-400 text-sm col-span-2">Rendimento (porções que a receita produz)</label>
          <input [(ngModel)]="rendimento" type="number" min="1" [class]="campo"/>
        </div>
        <p class="text-neutral-400 text-xs">INGREDIENTES (quantidade por receita, fator de correção ≥ 1,00 cobre perdas)</p>
        @for(it of itens(); track $index; let idx=$index){
          <div class="grid grid-cols-12 gap-2 items-center">
            <select [ngModel]="it.ingredienteId||null" (ngModelChange)="escolherIngrediente(idx,$event)" class="col-span-5 bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-2 py-2 text-sm">
              <option [ngValue]="null">Ingrediente</option>
              @for(g of ingredientesAtivos(); track g.id){<option [ngValue]="g.id">{{g.nome}}</option>}
            </select>
            <input [(ngModel)]="it.quantidade" type="number" min="0" step="any" placeholder="Qtd" class="col-span-2 bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-2 py-2 text-sm"/>
            <select [(ngModel)]="it.unidade" class="col-span-2 bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-2 py-2 text-sm">
              @for(u of unidadesDe(it); track u){<option [value]="u">{{u}}</option>}
            </select>
            <input [(ngModel)]="it.fatorCorrecao" type="number" min="1" step="0.01" title="Fator de correção" class="col-span-2 bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-2 py-2 text-sm"/>
            <button (click)="removerItem(idx)" class="col-span-1 text-neutral-500 hover:text-red-400" aria-label="Remover">🗑</button>
          </div>
        }
        <button (click)="adicionarItem()" class="text-sm text-blue-300 hover:text-blue-200">+ Adicionar ingrediente</button>
        <textarea [(ngModel)]="modoPreparo" rows="3" placeholder="Modo de preparo (opcional)" [class]="campo"></textarea>
        @if(resumo(); as r){
          <div class="bg-[#1a1a1a] rounded-xl p-3 text-sm text-neutral-300">
            Custo por porção: <b class="text-white">{{moeda(r.custo)}}</b> · Preço: {{moeda(r.preco)}} · Food cost: <b [class]="corFC(r.foodCost)">{{r.foodCost}}%</b>
          </div>
          @if(r.foodCost>35){<div class="bg-red-900/30 border border-red-800/50 text-red-300 rounded-xl px-3 py-2 text-sm">⚠️ {{avisoFicha() || 'Food cost acima de 35%. Revise o preço de venda ou a ficha técnica.'}}</div>}
        }
        <div class="flex justify-end gap-2 pt-2">
          <button (click)="fichaPrato.set(null)" class="px-4 py-2 rounded-xl text-sm text-neutral-300 bg-neutral-800">Fechar</button>
          <button (click)="salvarFicha()" [disabled]="salvando()" class="px-4 py-2 rounded-xl text-sm text-white bg-red-800 hover:bg-red-700 disabled:opacity-50">{{salvando()?'Salvando...':'Salvar ficha'}}</button>
        </div>
      </div>
    </div>
  }
</div>` })
export class AdminDishesComponent implements OnInit {
  private api = inject(CadastroAdminService);
  moeda = moeda; cor = STATUS_COR;
  campo = 'w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600';
  filtros: { key: StatusPratoApi | 'todos'; label: string }[] = [
    { key: 'todos', label: 'Todos' }, { key: 'ATIVO', label: 'Ativos' }, { key: 'PAUSADO', label: 'Pausados' }, { key: 'INATIVO', label: 'Inativos' },
  ];
  filtro = signal<StatusPratoApi | 'todos'>('todos');
  pratos = signal<PratoAdmin[]>([]);
  categorias = signal<CategoriaAdmin[]>([]);
  ingredientes = signal<Ingrediente[]>([]);
  categoriasAtivas = computed(() => this.categorias().filter(c => c.status === 'ATIVO'));
  ingredientesAtivos = computed(() => this.ingredientes().filter(i => i.status === 'ATIVO'));
  filtrados = computed(() => { const f = this.filtro(); return f === 'todos' ? this.pratos() : this.pratos().filter(p => p.status === f); });

  carregando = signal(true); erro = signal(''); erros = signal<Record<number, string>>({});
  salvando = signal(false);

  // prato
  modalPrato = signal(false); editId = signal<number | null>(null); erroForm = signal('');
  form: PratoForm = this.vazio();
  private vazio(): PratoForm { return { categoriaId: null, nome: '', descricao: '', fotoUrl: '', precoVenda: null, tempoPreparoMin: 15 }; }

  // opcoes do combo
  opcoesPrato = signal<PratoAdmin | null>(null);
  gruposForm = signal<GrupoComboForm[]>([]);
  erroOpcoes = signal(''); okOpcoes = signal('');
  abrirOpcoes(p: PratoAdmin) {
    this.opcoesPrato.set(p); this.erroOpcoes.set(''); this.okOpcoes.set(''); this.gruposForm.set([]);
    this.api.opcoesDoPrato(p.id).subscribe({
      next: gs => this.gruposForm.set(gs.map(g => ({ nome: g.nome, minimo: g.minimo, maximo: g.maximo,
        opcoes: g.opcoes.map(o => ({ nome: o.nome, pratoId: o.pratoId, acrescimo: o.acrescimo })) }))),
      error: e => this.erroOpcoes.set(mensagemDeErro(e)),
    });
  }
  adicionarGrupo() { this.gruposForm.update(l => [...l, { nome: '', minimo: 1, maximo: 1, opcoes: [{ nome: '', pratoId: null, acrescimo: 0 }] }]); }
  removerGrupo(i: number) { this.gruposForm.update(l => l.filter((_, k) => k !== i)); }
  adicionarOpcao(gi: number) { this.gruposForm.update(l => l.map((g, k) => k === gi ? { ...g, opcoes: [...g.opcoes, { nome: '', pratoId: null, acrescimo: 0 }] } : g)); }
  removerOpcao(gi: number, oi: number) { this.gruposForm.update(l => l.map((g, k) => k === gi ? { ...g, opcoes: g.opcoes.filter((_, j) => j !== oi) } : g)); }
  salvarOpcoes() {
    const p = this.opcoesPrato(); if (!p) return;
    this.erroOpcoes.set(''); this.okOpcoes.set('');
    const gs = this.gruposForm();
    for (const g of gs) {
      if (!g.nome.trim()) { this.erroOpcoes.set('Dê um nome a todos os grupos.'); return; }
      if (Number(g.minimo) > Number(g.maximo)) { this.erroOpcoes.set('No grupo "' + g.nome + '" o mínimo não pode ser maior que o máximo.'); return; }
      if (g.opcoes.length === 0 || g.opcoes.some(o => !o.nome.trim())) { this.erroOpcoes.set('Todas as opções do grupo "' + g.nome + '" precisam de nome.'); return; }
    }
    const corpo = gs.map(g => ({ nome: g.nome.trim(), minimo: Number(g.minimo), maximo: Number(g.maximo),
      opcoes: g.opcoes.map(o => ({ nome: o.nome.trim(), pratoId: o.pratoId, acrescimo: Number(o.acrescimo) || 0 })) }));
    this.salvando.set(true);
    this.api.salvarOpcoesDoPrato(p.id, corpo).subscribe({
      next: () => { this.salvando.set(false); this.okOpcoes.set('Opções salvas.'); },
      error: e => { this.salvando.set(false); this.erroOpcoes.set(mensagemDeErro(e)); },
    });
  }

  // ficha
  fichaPrato = signal<PratoAdmin | null>(null);
  itens = signal<FichaItem[]>([]);
  rendimento = 1; modoPreparo = '';
  erroFicha = signal(''); okFicha = signal('');
  avisoFicha = signal('');
  corFC = corFoodCost;
  custoSalvo = signal<{ custo: number; foodCost: number; preco: number } | null>(null);
  resumo = () => this.custoSalvo();

  ngOnInit() {
    this.carregar();
    this.api.categorias().subscribe({ next: c => this.categorias.set(c), error: e => this.erro.set(mensagemDeErro(e)) });
    this.api.ingredientes().subscribe({ next: i => this.ingredientes.set(i), error: () => {} });
  }

  carregar() {
    this.api.pratos().subscribe({
      next: pg => { this.pratos.set(pg.content); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemDeErro(e)); this.carregando.set(false); },
    });
  }

  // ---- prato
  novo() { this.editId.set(null); this.form = this.vazio(); this.erroForm.set(''); this.modalPrato.set(true); }
  editar(p: PratoAdmin) {
    this.editId.set(p.id); this.erroForm.set('');
    this.form = { categoriaId: p.categoriaId, nome: p.nome, descricao: p.descricao ?? '', fotoUrl: p.fotoUrl ?? '', precoVenda: p.precoVenda, tempoPreparoMin: p.tempoPreparoMin };
    this.modalPrato.set(true);
  }
  salvarPrato() {
    this.salvando.set(true); this.erroForm.set('');
    const id = this.editId();
    const req = id ? this.api.atualizarPrato(id, this.form) : this.api.criarPrato(this.form);
    req.subscribe({
      next: () => { this.salvando.set(false); this.modalPrato.set(false); this.carregar(); },
      error: e => { this.salvando.set(false); this.erroForm.set(mensagemDeErro(e)); },
    });
  }
  mudarStatus(p: PratoAdmin, status: StatusPratoApi) {
    this.erros.update(m => ({ ...m, [p.id]: '' }));
    this.api.statusPrato(p.id, status).subscribe({
      next: () => this.carregar(),
      error: e => this.erros.update(m => ({ ...m, [p.id]: mensagemDeErro(e) })),
    });
  }

  // ---- ficha tecnica
  abrirFicha(p: PratoAdmin) {
    this.fichaPrato.set(p); this.erroFicha.set(''); this.okFicha.set('');
    this.itens.set([]); this.rendimento = 1; this.modoPreparo = ''; this.custoSalvo.set(null); this.avisoFicha.set('');
    this.api.ficha(p.id).subscribe({
      next: f => {
        this.rendimento = f.rendimento; this.modoPreparo = f.modoPreparo ?? '';
        this.itens.set(f.itens.map(i => ({ ...i })));
        this.mostrarCusto(f.custoPorPorcao, f.foodCost, f.precoVenda);
        this.avisoFicha.set(f.aviso ?? '');
      },
      error: e => { if (e.status === 404) this.adicionarItem(); else this.erroFicha.set(mensagemDeErro(e)); },
    });
  }
  private mostrarCusto(custo: number | null, foodCost: number | null, preco: number) {
    this.custoSalvo.set(custo === null || foodCost === null ? null : { custo, foodCost, preco });
  }
  adicionarItem() { this.itens.update(l => [...l, { ingredienteId: 0, quantidade: 0, unidade: 'G', fatorCorrecao: 1 }]); }
  removerItem(idx: number) { this.itens.update(l => l.filter((_, i) => i !== idx)); }
  escolherIngrediente(idx: number, id: number | null) {
    const ing = this.ingredientes().find(i => i.id === id);
    this.itens.update(l => l.map((it, i) => i === idx ? { ...it, ingredienteId: id ?? 0, unidade: ing ? ing.unidadePadrao : it.unidade } : it));
  }
  unidadesDe(it: FichaItem): Unidade[] {
    const ing = this.ingredientes().find(i => i.id === it.ingredienteId);
    return ing ? UNIDADES_COMPATIVEIS[ing.unidadePadrao] : ['G', 'KG', 'ML', 'L', 'UN'];
  }
  salvarFicha() {
    const p = this.fichaPrato(); if (!p) return;
    this.erroFicha.set(''); this.okFicha.set('');
    const itens = this.itens();
    if (itens.length === 0 || itens.some(i => !i.ingredienteId || !(Number(i.quantidade) > 0))) {
      this.erroFicha.set('Escolha o ingrediente e informe a quantidade em todas as linhas.'); return;
    }
    this.salvando.set(true);
    this.api.salvarFicha(p.id, Number(this.rendimento), this.modoPreparo, itens.map(i => ({ ...i, quantidade: Number(i.quantidade), fatorCorrecao: Number(i.fatorCorrecao) }))).subscribe({
      next: f => {
        this.salvando.set(false); this.okFicha.set('Ficha técnica salva.');
        this.itens.set(f.itens.map(i => ({ ...i })));
        this.mostrarCusto(f.custoPorPorcao, f.foodCost, f.precoVenda);
        this.avisoFicha.set(f.aviso ?? '');
        this.carregar();
      },
      error: e => { this.salvando.set(false); this.erroFicha.set(mensagemDeErro(e)); },
    });
  }
}
