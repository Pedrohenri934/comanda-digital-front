import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompraAdminService } from '../../services/compra-admin.service';
import { mensagemDeErro } from '../../services/auth.service';
import { moeda } from '../../models/status-pedido';
import { CadastroAdminService } from '../../services/cadastro-admin.service';
import { Fornecedor, FornecedorForm, Ingrediente, ProdutoFornecedor } from '../../models/api.models';

@Component({ selector:'app-admin-suppliers', standalone:true, imports:[FormsModule], template:`
<div class="p-4 md:p-6 max-w-4xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div><h1 class="text-white text-2xl font-semibold">Fornecedores</h1><p class="text-neutral-400 text-sm mt-1">{{lista().length}} fornecedor(es)</p></div>
    <button (click)="novo()" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm">+ Novo fornecedor</button>
  </div>
  @if(erro()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{{erro()}}</div>}
  @if(carregando()){<p class="text-center py-12 text-neutral-500">Carregando...</p>}
  @else if(lista().length===0 && !erro()){<p class="text-center py-12 text-neutral-500">Nenhum fornecedor cadastrado</p>}
  <div class="space-y-2">
    @for(f of lista(); track f.id){
      <div class="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex flex-wrap items-center gap-3" [class.opacity-60]="f.status==='INATIVO'">
        <div class="flex-1 min-w-[12rem]">
          <p class="text-white text-sm">{{f.razaoSocial}} @if(f.status==='INATIVO'){<span class="text-xs text-neutral-500">(inativo)</span>}</p>
          <p class="text-neutral-500 text-xs">CNPJ {{f.cnpj}}@if(f.telefone){ · {{f.telefone}}}@if(f.email){ · {{f.email}}}</p>
        </div>
        <button (click)="abrirCatalogo(f)" class="text-sm text-blue-300 px-3 py-1.5 rounded-lg border border-blue-900/60">Catálogo</button>
        <button (click)="editar(f)" class="text-sm text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-800">Editar</button>
        @if(f.status==='ATIVO'){<button (click)="alternar(f)" class="text-sm text-red-400 px-3 py-1.5 rounded-lg border border-red-900/60">Inativar</button>}
        @else {<button (click)="alternar(f)" class="text-sm text-green-400 px-3 py-1.5 rounded-lg border border-green-900/60">Reativar</button>}
      </div>
    }
  </div>

  @if(catalogo(); as forn){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="catalogo.set(null)"></div>
      <div class="relative w-full max-w-2xl bg-[#111111] border border-neutral-800 rounded-2xl p-6 space-y-3 max-h-[92vh] overflow-y-auto">
        <h2 class="text-white font-semibold">Catálogo — {{forn.razaoSocial}}</h2>
        <p class="text-neutral-500 text-xs">Preço por unidade padrão do ingrediente. Usado na cotação comparativa das compras.</p>
        @if(erroCat()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-3 py-2 text-sm">{{erroCat()}}</div>}
        <div class="space-y-1">
          @for(p of produtos(); track p.ingredienteId){
            <div class="flex items-center gap-3 bg-[#141414] border border-neutral-800 rounded-lg px-3 py-2 text-sm">
              <span class="flex-1 text-white">{{p.ingredienteNome}}</span>
              <span class="text-neutral-300">{{moeda(p.preco)}} / {{p.unidadePadrao}}</span>
              <button (click)="removerProduto(forn, p)" class="text-neutral-500 hover:text-red-400" aria-label="Remover">🗑</button>
            </div>
          }
          @if(produtos().length===0){<p class="text-neutral-500 text-sm py-3 text-center">Nenhum produto no catálogo</p>}
        </div>
        <div class="grid grid-cols-12 gap-2 items-center pt-2">
          <select [(ngModel)]="novoIng" class="col-span-6 bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-2 py-2 text-sm">
            <option [ngValue]="0">Ingrediente</option>
            @for(g of ingredientes(); track g.id){<option [ngValue]="g.id">{{g.nome}} ({{g.unidadePadrao}})</option>}
          </select>
          <input [(ngModel)]="novoPreco" type="number" min="0" step="any" placeholder="Preço" class="col-span-4 bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-2 py-2 text-sm"/>
          <button (click)="adicionarProduto(forn)" class="col-span-2 bg-red-800 hover:bg-red-700 text-white rounded-xl py-2 text-sm">Salvar</button>
        </div>
        <div class="flex justify-end pt-2"><button (click)="catalogo.set(null)" class="px-4 py-2 rounded-xl text-sm text-neutral-300 bg-neutral-800">Fechar</button></div>
      </div>
    </div>
  }

  @if(aberto()){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="aberto.set(false)"></div>
      <div class="relative w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-6 space-y-3">
        <h2 class="text-white font-semibold">{{editId()?'Editar fornecedor':'Novo fornecedor'}}</h2>
        @if(erroForm()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-3 py-2 text-sm">{{erroForm()}}</div>}
        <input [(ngModel)]="form.razaoSocial" placeholder="Razão social *" maxlength="160" [class]="campo"/>
        <input [(ngModel)]="form.cnpj" placeholder="CNPJ *" maxlength="18" [class]="campo"/>
        <input [(ngModel)]="form.telefone" placeholder="Telefone" maxlength="20" [class]="campo"/>
        <input [(ngModel)]="form.email" type="email" placeholder="E-mail" maxlength="160" [class]="campo"/>
        <div class="flex justify-end gap-2 pt-2">
          <button (click)="aberto.set(false)" class="px-4 py-2 rounded-xl text-sm text-neutral-300 bg-neutral-800">Cancelar</button>
          <button (click)="salvar()" [disabled]="salvando()" class="px-4 py-2 rounded-xl text-sm text-white bg-red-800 hover:bg-red-700 disabled:opacity-50">{{salvando()?'Salvando...':'Salvar'}}</button>
        </div>
      </div>
    </div>
  }
</div>` })
export class AdminSuppliersComponent implements OnInit {
  private api = inject(CompraAdminService);
  private cadastro = inject(CadastroAdminService);
  moeda = moeda;
  catalogo = signal<Fornecedor | null>(null); produtos = signal<ProdutoFornecedor[]>([]);
  ingredientes = signal<Ingrediente[]>([]); erroCat = signal(''); novoIng = 0; novoPreco: number | null = null;
  abrirCatalogo(f: Fornecedor) {
    this.erroCat.set(''); this.novoIng = 0; this.novoPreco = null; this.produtos.set([]); this.catalogo.set(f);
    if (this.ingredientes().length === 0) this.cadastro.ingredientes().subscribe({ next: l => this.ingredientes.set(l.filter(i => i.status === 'ATIVO')), error: () => {} });
    this.api.produtosFornecedor(f.id).subscribe({ next: l => this.produtos.set(l), error: e => this.erroCat.set(mensagemDeErro(e)) });
  }
  adicionarProduto(f: Fornecedor) {
    if (!this.novoIng || !(Number(this.novoPreco) > 0)) { this.erroCat.set('Escolha o ingrediente e informe um preço maior que zero.'); return; }
    this.erroCat.set('');
    this.api.gravarProduto(f.id, { ingredienteId: this.novoIng, preco: Number(this.novoPreco) }).subscribe({
      next: l => { this.produtos.set(l); this.novoIng = 0; this.novoPreco = null; },
      error: e => this.erroCat.set(mensagemDeErro(e)),
    });
  }
  removerProduto(f: Fornecedor, p: ProdutoFornecedor) {
    this.api.removerProduto(f.id, p.ingredienteId).subscribe({ next: l => this.produtos.set(l), error: e => this.erroCat.set(mensagemDeErro(e)) });
  }
  campo = 'w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600';
  lista = signal<Fornecedor[]>([]);
  carregando = signal(true); erro = signal(''); erroForm = signal('');
  aberto = signal(false); salvando = signal(false); editId = signal<number | null>(null);
  form: FornecedorForm = { razaoSocial: '', cnpj: '', telefone: '', email: '' };

  ngOnInit() { this.carregar(); }
  carregar() {
    this.api.fornecedores().subscribe({
      next: l => { this.lista.set(l); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemDeErro(e)); this.carregando.set(false); },
    });
  }
  novo() { this.editId.set(null); this.form = { razaoSocial: '', cnpj: '', telefone: '', email: '' }; this.erroForm.set(''); this.aberto.set(true); }
  editar(f: Fornecedor) {
    this.editId.set(f.id); this.erroForm.set('');
    this.form = { razaoSocial: f.razaoSocial, cnpj: f.cnpj, telefone: f.telefone ?? '', email: f.email ?? '' };
    this.aberto.set(true);
  }
  salvar() {
    this.salvando.set(true); this.erroForm.set('');
    const id = this.editId();
    const req = id ? this.api.atualizarFornecedor(id, this.form) : this.api.criarFornecedor(this.form);
    req.subscribe({
      next: () => { this.salvando.set(false); this.aberto.set(false); this.carregar(); },
      error: e => { this.salvando.set(false); this.erroForm.set(mensagemDeErro(e)); },
    });
  }
  alternar(f: Fornecedor) {
    this.erro.set('');
    const req = f.status === 'ATIVO' ? this.api.inativarFornecedor(f.id) : this.api.reativarFornecedor(f.id);
    req.subscribe({ next: () => this.carregar(), error: e => this.erro.set(mensagemDeErro(e)) });
  }
}
