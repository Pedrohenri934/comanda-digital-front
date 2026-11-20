import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CadastroAdminService } from '../../services/cadastro-admin.service';
import { mensagemDeErro } from '../../services/auth.service';
import { CategoriaAdmin, CategoriaForm } from '../../models/api.models';

@Component({ selector:'app-admin-categories', standalone:true, imports:[FormsModule], template:`
<div class="p-4 md:p-6 max-w-4xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div><h1 class="text-white text-2xl font-semibold">Categorias</h1><p class="text-neutral-400 text-sm mt-1">{{lista().length}} categoria(s)</p></div>
    <button (click)="novo()" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm">+ Nova categoria</button>
  </div>
  @if(erro()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{{erro()}}</div>}
  @if(carregando()){<p class="text-center py-12 text-neutral-500">Carregando...</p>}
  <div class="space-y-2">
    @for(c of lista(); track c.id){
      <div class="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex items-center gap-3" [class.opacity-60]="c.status==='INATIVO'">
        <span class="text-neutral-500 text-sm w-8">#{{c.ordem}}</span>
        <div class="flex-1 min-w-0"><p class="text-white text-sm">{{c.nome}} @if(c.status==='INATIVO'){<span class="text-xs text-neutral-500">(inativa)</span>}</p>
          <p class="text-neutral-500 text-xs truncate">{{c.descricao}}</p></div>
        <button (click)="editar(c)" class="text-sm text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-800">Editar</button>
        @if(c.status==='ATIVO'){<button (click)="alternar(c)" class="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-900/60">Inativar</button>}
        @else {<button (click)="alternar(c)" class="text-sm text-green-400 hover:text-green-300 px-3 py-1.5 rounded-lg border border-green-900/60">Reativar</button>}
      </div>
    }
  </div>

  @if(aberto()){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="aberto.set(false)"></div>
      <div class="relative w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-6 space-y-3">
        <h2 class="text-white font-semibold">{{editId()?'Editar categoria':'Nova categoria'}}</h2>
        @if(erroForm()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-3 py-2 text-sm">{{erroForm()}}</div>}
        <input [(ngModel)]="form.nome" placeholder="Nome *" maxlength="80" [class]="campo"/>
        <input [(ngModel)]="form.descricao" placeholder="Descrição" maxlength="255" [class]="campo"/>
        <input [(ngModel)]="form.ordem" type="number" min="0" placeholder="Ordem no cardápio" [class]="campo"/>
        <div class="flex justify-end gap-2 pt-2">
          <button (click)="aberto.set(false)" class="px-4 py-2 rounded-xl text-sm text-neutral-300 bg-neutral-800">Cancelar</button>
          <button (click)="salvar()" [disabled]="salvando()" class="px-4 py-2 rounded-xl text-sm text-white bg-red-800 hover:bg-red-700 disabled:opacity-50">{{salvando()?'Salvando...':'Salvar'}}</button>
        </div>
      </div>
    </div>
  }
</div>` })
export class AdminCategoriesComponent implements OnInit {
  private api = inject(CadastroAdminService);
  campo = 'w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600';
  lista = signal<CategoriaAdmin[]>([]);
  carregando = signal(true); erro = signal(''); erroForm = signal('');
  aberto = signal(false); salvando = signal(false); editId = signal<number | null>(null);
  form: CategoriaForm = { nome: '', descricao: '', ordem: 0 };

  ngOnInit() { this.carregar(); }
  carregar() {
    this.api.categorias().subscribe({
      next: l => { this.lista.set(l); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemDeErro(e)); this.carregando.set(false); },
    });
  }
  novo() { this.editId.set(null); this.form = { nome: '', descricao: '', ordem: this.lista().length + 1 }; this.erroForm.set(''); this.aberto.set(true); }
  editar(c: CategoriaAdmin) { this.editId.set(c.id); this.form = { nome: c.nome, descricao: c.descricao ?? '', ordem: c.ordem }; this.erroForm.set(''); this.aberto.set(true); }
  salvar() {
    this.salvando.set(true); this.erroForm.set('');
    const id = this.editId();
    const req = id ? this.api.atualizarCategoria(id, this.form) : this.api.criarCategoria(this.form);
    req.subscribe({
      next: () => { this.salvando.set(false); this.aberto.set(false); this.carregar(); },
      error: e => { this.salvando.set(false); this.erroForm.set(mensagemDeErro(e)); },
    });
  }
  alternar(c: CategoriaAdmin) {
    this.erro.set('');
    const req = c.status === 'ATIVO' ? this.api.inativarCategoria(c.id) : this.api.reativarCategoria(c.id);
    req.subscribe({ next: () => this.carregar(), error: e => this.erro.set(mensagemDeErro(e)) });
  }
}
