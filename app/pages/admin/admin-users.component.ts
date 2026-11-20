import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioAdminService } from '../../services/usuario-admin.service';
import { AuthService, mensagemDeErro } from '../../services/auth.service';
import { PerfilInterno, UsuarioInterno, UsuarioInternoForm } from '../../models/api.models';

// Usuarios internos (RF-041): somente o ADMIN cria, edita e inativa gerentes, cozinheiros e outros admins.
@Component({ selector: 'app-admin-users', standalone: true, imports: [FormsModule], template: `
<div class="p-4 md:p-6 max-w-4xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div><h1 class="text-white text-2xl font-semibold">Usuários internos</h1>
      <p class="text-neutral-400 text-sm mt-1">Administradores, gerentes e cozinheiros. Clientes e entregadores têm telas próprias.</p></div>
    <button (click)="novo()" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm">+ Novo usuário</button>
  </div>
  @if(erro()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{{erro()}}</div>}
  @if(carregando()){<p class="text-center py-12 text-neutral-500">Carregando...</p>}
  <div class="space-y-2">
    @for(u of lista(); track u.id){
      <div class="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex flex-wrap items-center gap-3" [class.opacity-60]="u.status==='INATIVO'">
        <div class="flex-1 min-w-[12rem]">
          <p class="text-white text-sm">{{u.nome}} @if(souEu(u)){<span class="text-xs text-neutral-500">(você)</span>}</p>
          <p class="text-neutral-500 text-xs">{{u.email}}@if(u.telefone){ · {{u.telefone}}}</p>
        </div>
        <span class="text-xs px-2 py-0.5 rounded-lg border" [class]="corPerfil[u.perfil]">{{u.perfil}}</span>
        <span class="text-xs" [class]="u.status==='ATIVO'?'text-green-400':'text-neutral-500'">{{u.status}}</span>
        <button (click)="editar(u)" class="text-sm text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-800">Editar</button>
        @if(u.status==='ATIVO'){<button (click)="alternar(u)" [disabled]="souEu(u)" class="text-sm text-red-400 px-3 py-1.5 rounded-lg border border-red-900/60 disabled:opacity-30">Inativar</button>}
        @else {<button (click)="alternar(u)" class="text-sm text-green-400 px-3 py-1.5 rounded-lg border border-green-900/60">Reativar</button>}
      </div>
    }
    @if(!carregando() && lista().length===0){<p class="text-center py-12 text-neutral-500">Nenhum usuário</p>}
  </div>

  @if(aberto()){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="aberto.set(false)"></div>
      <div class="relative w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-6 space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 class="text-white font-semibold">{{editId()?'Editar usuário':'Novo usuário'}}</h2>
        @if(erroForm()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-3 py-2 text-sm">{{erroForm()}}</div>}
        <input [(ngModel)]="form.nome" placeholder="Nome *" maxlength="120" [class]="campo"/>
        <input [(ngModel)]="form.email" [disabled]="!!editId()" placeholder="Email *" type="email" maxlength="160" [class]="campo" class="disabled:opacity-50"/>
        <select [(ngModel)]="form.perfil" [class]="campo">
          <option value="COZINHEIRO">Cozinheiro</option><option value="GERENTE">Gerente</option><option value="ADMIN">Administrador</option>
        </select>
        <input [(ngModel)]="form.telefone" placeholder="Telefone (opcional)" maxlength="20" [class]="campo"/>
        <input [(ngModel)]="form.senha" type="password" [placeholder]="editId() ? 'Nova senha (deixe em branco para manter)' : 'Senha * (mínimo 6 caracteres)'" maxlength="72" [class]="campo"/>
        <div class="flex justify-end gap-2 pt-2">
          <button (click)="aberto.set(false)" class="px-4 py-2 rounded-xl text-sm text-neutral-300 bg-neutral-800">Cancelar</button>
          <button (click)="salvar()" [disabled]="salvando()" class="px-4 py-2 rounded-xl text-sm text-white bg-red-800 hover:bg-red-700 disabled:opacity-50">{{salvando()?'Salvando...':'Salvar'}}</button>
        </div>
      </div>
    </div>
  }
</div>` })
export class AdminUsersComponent implements OnInit {
  private api = inject(UsuarioAdminService);
  private auth = inject(AuthService);
  campo = 'w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600';
  corPerfil: Record<PerfilInterno, string> = {
    ADMIN: 'text-red-300 border-red-800/60 bg-red-900/20', GERENTE: 'text-blue-300 border-blue-800/60 bg-blue-900/20', COZINHEIRO: 'text-yellow-300 border-yellow-800/60 bg-yellow-900/20',
  };
  lista = signal<UsuarioInterno[]>([]);
  carregando = signal(true); erro = signal(''); erroForm = signal('');
  aberto = signal(false); salvando = signal(false); editId = signal<number | null>(null);
  form: UsuarioInternoForm = this.vazio();

  private vazio(): UsuarioInternoForm { return { nome: '', email: '', senha: '', perfil: 'COZINHEIRO', telefone: '' }; }
  souEu(u: UsuarioInterno) { return u.email.toLowerCase() === (this.auth.usuario()?.email ?? '').toLowerCase(); }

  ngOnInit() { this.carregar(); }
  carregar() {
    this.api.listar().subscribe({
      next: l => { this.lista.set(l); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemDeErro(e)); this.carregando.set(false); },
    });
  }
  novo() { this.editId.set(null); this.form = this.vazio(); this.erroForm.set(''); this.aberto.set(true); }
  editar(u: UsuarioInterno) {
    this.editId.set(u.id); this.erroForm.set('');
    this.form = { nome: u.nome, email: u.email, senha: '', perfil: u.perfil, telefone: u.telefone ?? '' };
    this.aberto.set(true);
  }
  salvar() {
    this.erroForm.set('');
    const f = this.form;
    if (!f.nome.trim()) { this.erroForm.set('Informe o nome.'); return; }
    const id = this.editId();
    if (!id && (!f.email.trim() || !f.senha)) { this.erroForm.set('Informe email e senha.'); return; }
    this.salvando.set(true);
    const tel = f.telefone.trim() ? { telefone: f.telefone.trim() } : {};
    const req = id
      ? this.api.atualizar(id, { nome: f.nome.trim(), perfil: f.perfil, ...tel, ...(f.senha ? { senha: f.senha } : {}) })
      : this.api.criar({ nome: f.nome.trim(), email: f.email.trim(), senha: f.senha, perfil: f.perfil, ...tel });
    req.subscribe({
      next: () => { this.salvando.set(false); this.aberto.set(false); this.carregar(); },
      error: e => { this.salvando.set(false); this.erroForm.set(mensagemDeErro(e)); },
    });
  }
  alternar(u: UsuarioInterno) {
    this.erro.set('');
    this.api.status(u.id, u.status === 'ATIVO' ? 'INATIVO' : 'ATIVO').subscribe({
      next: () => this.carregar(), error: e => this.erro.set(mensagemDeErro(e)),
    });
  }
}
