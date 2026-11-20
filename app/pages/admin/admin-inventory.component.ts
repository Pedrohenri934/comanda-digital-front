import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CadastroAdminService } from '../../services/cadastro-admin.service';
import { mensagemDeErro } from '../../services/auth.service';
import { Ingrediente, IngredienteForm, Movimentacao, Unidade } from '../../models/api.models';

// Ingredientes e saldo de estoque (o saldo vem das movimentacoes: compras, vendas e estornos).
@Component({ selector:'app-admin-inventory', standalone:true, imports:[FormsModule], template:`
<div class="p-4 md:p-6 max-w-5xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div><h1 class="text-white text-2xl font-semibold">Estoque e Ingredientes</h1>
      <p class="text-neutral-400 text-sm mt-1">{{lista().length}} ingrediente(s) · <span class="text-red-400">{{abaixo()}} abaixo do mínimo</span></p></div>
    <button (click)="novo()" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm">+ Novo ingrediente</button>
  </div>
  <div class="flex gap-2 mb-4">
    <button (click)="aba.set('saldo')" class="px-4 py-2 rounded-xl text-sm" [class]="aba()==='saldo' ? 'bg-red-800 text-white' : 'bg-neutral-800 text-neutral-300'">Saldo</button>
    <button (click)="abrirHistorico()" class="px-4 py-2 rounded-xl text-sm" [class]="aba()==='historico' ? 'bg-red-800 text-white' : 'bg-neutral-800 text-neutral-300'">Movimentações</button>
  </div>
  @if(okMov()){<div class="bg-green-900/30 border border-green-800/50 text-green-400 rounded-xl px-4 py-3 text-sm mb-4">{{okMov()}}</div>}
  @if(aba()==='historico'){
    <div class="flex flex-wrap gap-3 mb-4">
      <select [(ngModel)]="filtroIng" (ngModelChange)="carregarHistorico()" class="bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-3 py-2 text-sm">
        <option [ngValue]="null">Todos os ingredientes</option>
        @for(g of lista(); track g.id){<option [ngValue]="g.id">{{g.nome}}</option>}
      </select>
      <select [(ngModel)]="filtroTipo" (ngModelChange)="carregarHistorico()" class="bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-3 py-2 text-sm">
        <option value="">Todos os tipos</option><option value="ENTRADA">Entradas</option><option value="SAIDA">Saídas</option><option value="ESTORNO">Estornos</option>
      </select>
    </div>
    <div class="space-y-2">
      @for(m of movs(); track m.id){
        <div class="bg-[#141414] border border-neutral-800 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm">
          <span class="text-xs px-2 py-0.5 rounded-lg border" [class]="m.tipo==='SAIDA' ? 'text-red-300 border-red-800/60' : 'text-green-300 border-green-800/60'">{{m.tipo}}</span>
          <div class="flex-1 min-w-[10rem]">
            <p class="text-white">{{m.ingredienteNome}} <span class="text-neutral-400">{{m.tipo==='SAIDA' ? '−' : '+'}}{{m.quantidade}} {{m.unidade}}</span></p>
            <p class="text-neutral-500 text-xs">{{m.motivo}}@if(m.lote){ · lote {{m.lote}}}@if(m.validade){ · val. {{m.validade}}}@if(m.custoUnitario!==null){ · custo R$ {{m.custoUnitario}}}@if(m.pedidoId){ · pedido #{{m.pedidoId}}}@if(m.observacao){ · {{m.observacao}}}</p>
          </div>
          <div class="text-right text-xs text-neutral-500"><p>{{data(m.criadoEm)}}</p><p>{{m.usuarioNome}}</p></div>
        </div>
      }
      @if(!carregandoMov() && movs().length===0){<p class="text-center py-10 text-neutral-500">Nenhuma movimentação</p>}
      @if(carregandoMov()){<p class="text-center py-6 text-neutral-500">Carregando...</p>}
      @if(temMais()){<button (click)="maisHistorico()" class="w-full py-2 rounded-xl text-sm text-neutral-300 bg-neutral-800">Ver mais</button>}
    </div>
  } @else {
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
        @if(i.status==='ATIVO'){
          <button (click)="abrirEntrada(i)" class="text-sm text-green-300 px-3 py-1.5 rounded-lg border border-green-900/60">Entrada</button>
          <button (click)="abrirBaixa(i)" class="text-sm text-yellow-300 px-3 py-1.5 rounded-lg border border-yellow-900/60">Baixa</button>
        }
        <button (click)="editar(i)" class="text-sm text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-800">Editar</button>
        @if(i.status==='ATIVO'){<button (click)="alternar(i)" class="text-sm text-red-400 px-3 py-1.5 rounded-lg border border-red-900/60">Inativar</button>}
        @else {<button (click)="alternar(i)" class="text-sm text-green-400 px-3 py-1.5 rounded-lg border border-green-900/60">Reativar</button>}
      </div>
    }
  </div>

  }

  <!-- Entrada manual -->
  @if(entrada(); as ing){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="entrada.set(null)"></div>
      <div class="relative w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-6 space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 class="text-white font-semibold">Entrada de estoque — {{ing.nome}}</h2>
        <p class="text-neutral-500 text-xs">Saldo atual: {{ing.saldo}} {{ing.unidadePadrao}}</p>
        @if(erroMov()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-3 py-2 text-sm">{{erroMov()}}</div>}
        <input [(ngModel)]="mov.quantidade" type="number" min="0" step="any" [placeholder]="'Quantidade * (' + ing.unidadePadrao + ')'" [class]="campo"/>
        <input [(ngModel)]="mov.custo" type="number" min="0" step="any" [placeholder]="'Custo por ' + ing.unidadePadrao + ' (R$) *'" [class]="campo"/>
        <input [(ngModel)]="mov.lote" placeholder="Lote (opcional)" maxlength="50" [class]="campo"/>
        <label class="block text-xs text-neutral-400">Validade (opcional)<input [(ngModel)]="mov.validade" type="date" [class]="campo" class="mt-1"/></label>
        <input [(ngModel)]="mov.obs" placeholder="Observação (opcional)" maxlength="255" [class]="campo"/>
        <div class="flex justify-end gap-2 pt-2">
          <button (click)="entrada.set(null)" class="px-4 py-2 rounded-xl text-sm text-neutral-300 bg-neutral-800">Cancelar</button>
          <button (click)="salvarEntrada(ing)" [disabled]="salvando()" class="px-4 py-2 rounded-xl text-sm text-white bg-green-800 hover:bg-green-700 disabled:opacity-50">{{salvando()?'Salvando...':'Registrar entrada'}}</button>
        </div>
      </div>
    </div>
  }

  <!-- Baixa por perda -->
  @if(baixa(); as ing){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="baixa.set(null)"></div>
      <div class="relative w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-6 space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 class="text-white font-semibold">Baixa de estoque — {{ing.nome}}</h2>
        <p class="text-neutral-500 text-xs">Saldo atual: {{ing.saldo}} {{ing.unidadePadrao}}</p>
        @if(erroMov()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-3 py-2 text-sm">{{erroMov()}}</div>}
        <input [(ngModel)]="mov.quantidade" type="number" min="0" step="any" [placeholder]="'Quantidade * (' + ing.unidadePadrao + ')'" [class]="campo"/>
        <select [(ngModel)]="mov.motivo" [class]="campo">
          <option value="DESPERDICIO">Desperdício</option><option value="VENCIMENTO">Vencimento</option><option value="QUEBRA">Quebra</option><option value="USO_INTERNO">Uso interno</option>
        </select>
        <input [(ngModel)]="mov.obs" placeholder="Observação (opcional)" maxlength="255" [class]="campo"/>
        <div class="flex justify-end gap-2 pt-2">
          <button (click)="baixa.set(null)" class="px-4 py-2 rounded-xl text-sm text-neutral-300 bg-neutral-800">Cancelar</button>
          <button (click)="salvarBaixa(ing)" [disabled]="salvando()" class="px-4 py-2 rounded-xl text-sm text-white bg-yellow-800 hover:bg-yellow-700 disabled:opacity-50">{{salvando()?'Salvando...':'Registrar baixa'}}</button>
        </div>
      </div>
    </div>
  }

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

  // movimentacoes manuais e historico
  aba = signal<'saldo' | 'historico'>('saldo');
  entrada = signal<Ingrediente | null>(null); baixa = signal<Ingrediente | null>(null);
  mov = { quantidade: null as number | null, custo: null as number | null, lote: '', validade: '', obs: '', motivo: 'DESPERDICIO' };
  erroMov = signal(''); okMov = signal('');
  movs = signal<Movimentacao[]>([]); pagMov = signal(0); temMais = signal(false); carregandoMov = signal(false);
  filtroIng: number | null = null; filtroTipo = '';
  data = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  abrirEntrada(i: Ingrediente) { this.mov = { quantidade: null, custo: i.custoUnitario, lote: '', validade: '', obs: '', motivo: 'DESPERDICIO' }; this.erroMov.set(''); this.entrada.set(i); }
  abrirBaixa(i: Ingrediente) { this.mov = { quantidade: null, custo: null, lote: '', validade: '', obs: '', motivo: 'DESPERDICIO' }; this.erroMov.set(''); this.baixa.set(i); }
  salvarEntrada(i: Ingrediente) {
    if (!this.mov.quantidade || this.mov.quantidade <= 0) { this.erroMov.set('Informe uma quantidade maior que zero.'); return; }
    if (this.mov.custo === null || this.mov.custo < 0) { this.erroMov.set('Informe o custo por unidade.'); return; }
    this.salvando.set(true); this.erroMov.set('');
    this.api.entradaEstoque({
      ingredienteId: i.id, quantidade: this.mov.quantidade, custoUnitario: this.mov.custo,
      ...(this.mov.lote.trim() ? { lote: this.mov.lote.trim() } : {}), ...(this.mov.validade ? { validade: this.mov.validade } : {}),
      ...(this.mov.obs.trim() ? { observacao: this.mov.obs.trim() } : {}),
    }).subscribe({
      next: () => { this.salvando.set(false); this.entrada.set(null); this.okMov.set('Entrada registrada em ' + i.nome + '.'); this.carregar(); },
      error: e => { this.salvando.set(false); this.erroMov.set(mensagemDeErro(e)); },
    });
  }
  salvarBaixa(i: Ingrediente) {
    if (!this.mov.quantidade || this.mov.quantidade <= 0) { this.erroMov.set('Informe uma quantidade maior que zero.'); return; }
    this.salvando.set(true); this.erroMov.set('');
    this.api.saidaEstoque({
      ingredienteId: i.id, quantidade: this.mov.quantidade, motivo: this.mov.motivo,
      ...(this.mov.obs.trim() ? { observacao: this.mov.obs.trim() } : {}),
    }).subscribe({
      next: () => { this.salvando.set(false); this.baixa.set(null); this.okMov.set('Baixa registrada em ' + i.nome + '.'); this.carregar(); },
      error: e => { this.salvando.set(false); this.erroMov.set(mensagemDeErro(e)); },
    });
  }
  abrirHistorico() { this.aba.set('historico'); this.carregarHistorico(); }
  carregarHistorico() { this.pagMov.set(0); this.movs.set([]); this.buscarPagina(0); }
  maisHistorico() { this.buscarPagina(this.pagMov() + 1); }
  private buscarPagina(p: number) {
    this.carregandoMov.set(true);
    this.api.movimentacoes(this.filtroIng, this.filtroTipo, p, 30).subscribe({
      next: pg => { this.movs.update(l => [...l, ...pg.content]); this.pagMov.set(p); this.temMais.set(!pg.last); this.carregandoMov.set(false); },
      error: e => { this.erro.set(mensagemDeErro(e)); this.carregandoMov.set(false); },
    });
  }

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
