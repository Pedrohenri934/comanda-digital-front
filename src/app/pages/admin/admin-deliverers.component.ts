import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { EntregadorService } from '../../services/entregador.service';
import { mensagemDeErro } from '../../services/auth.service';
import { EntregadorAdmin } from '../../models/api.models';

// Gestao de entregadores: aprova ou recusa cadastros novos e remove (recusa) quem ja esta ativo.
@Component({
  selector: 'app-admin-deliverers',
  standalone: true,
  template: `
<div class="p-4 md:p-6 max-w-5xl mx-auto">
  <div class="mb-6">
    <h1 class="text-white text-2xl font-semibold">Entregadores</h1>
    <p class="text-neutral-400 text-sm mt-1">{{aprovados().length}} aprovados · {{pendentes().length}} aguardando</p>
  </div>

  @if(erro()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{{erro()}}</div>}

  @if(pendentes().length>0){
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-4"><span class="text-yellow-400">⏰</span><h2 class="text-white font-semibold">Aguardando Aprovação</h2>
        <span class="bg-yellow-700 text-white text-xs px-2 py-0.5 rounded-full">{{pendentes().length}}</span></div>
      <div class="space-y-3">
        @for(d of pendentes(); track d.id){
          <div class="bg-[#141414] border border-yellow-700/30 rounded-2xl p-4 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p class="text-white font-medium">{{d.nome}}</p>
              <p class="text-neutral-400 text-sm">{{d.email}} @if(d.telefone){· {{d.telefone}}}</p>
              <p class="text-neutral-500 text-sm">{{d.veiculo}} @if(d.placa){· {{d.placa}}}</p>
            </div>
            <div class="flex gap-2">
              <button (click)="mudar(d,'APROVADO')" class="bg-green-800 hover:bg-green-700 text-white rounded-xl px-3 py-2 text-sm transition-colors">✅ Aprovar</button>
              <button (click)="mudar(d,'RECUSADO')" class="bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-800/50 rounded-xl px-3 py-2 text-sm transition-colors">❌ Recusar</button>
            </div>
          </div>
        }
      </div>
    </div>
  }

  <div class="mb-8">
    <div class="flex items-center gap-2 mb-4"><span class="text-amber-400">🚗</span><h2 class="text-white font-semibold">Entregadores Ativos</h2></div>
    @if(aprovados().length===0){<div class="text-center py-12 text-neutral-500">Nenhum entregador aprovado</div>}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      @for(d of aprovados(); track d.id){
        <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-amber-900/30 border border-amber-800/40 rounded-xl flex items-center justify-center text-xl">🛵</div>
            <div class="min-w-0">
              <p class="text-white font-medium flex items-center gap-2">{{d.nome}}
                <span class="text-xs px-2 py-0.5 rounded-full" [class]="d.online ? 'bg-green-900/40 text-green-300' : 'bg-neutral-800 text-neutral-400'">{{d.online ? 'Online' : 'Offline'}}</span></p>
              <p class="text-neutral-400 text-sm truncate">{{d.email}}</p>
              <p class="text-neutral-500 text-xs">{{d.veiculo}} @if(d.placa){· {{d.placa}}}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-[#1a1a1a] rounded-xl p-3 text-center"><p class="text-green-400 text-xl font-bold">{{d.entregasConcluidas}}</p><p class="text-neutral-500 text-xs">Entregas Concluídas</p></div>
            <div class="bg-[#1a1a1a] rounded-xl p-3 text-center"><p class="text-blue-400 text-xl font-bold">{{d.emAndamento}}</p><p class="text-neutral-500 text-xs">Em Andamento</p></div>
          </div>
          <button (click)="mudar(d,'RECUSADO')" [disabled]="d.emAndamento>0" class="text-neutral-500 hover:text-red-400 disabled:opacity-40 disabled:hover:text-neutral-500 text-xs w-full text-center transition-colors"
            [title]="d.emAndamento>0 ? 'Há uma entrega em andamento' : ''">Remover entregador</button>
        </div>
      }
    </div>
  </div>

  @if(recusados().length>0){
    <div>
      <h2 class="text-neutral-400 font-semibold mb-3 text-sm">Recusados / removidos</h2>
      <div class="space-y-2">
        @for(d of recusados(); track d.id){
          <div class="bg-[#101010] border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-3">
            <div class="min-w-0"><p class="text-neutral-300 text-sm">{{d.nome}}</p><p class="text-neutral-600 text-xs truncate">{{d.email}}</p></div>
            <button (click)="mudar(d,'APROVADO')" class="text-green-400 hover:text-green-300 text-sm flex-shrink-0">Aprovar de novo</button>
          </div>
        }
      </div>
    </div>
  }
</div>`
})
export class AdminDeliverersComponent implements OnInit {
  private api = inject(EntregadorService);
  lista = signal<EntregadorAdmin[]>([]);
  erro = signal('');
  pendentes = computed(() => this.lista().filter(d => d.statusCadastro === 'PENDENTE'));
  aprovados = computed(() => this.lista().filter(d => d.statusCadastro === 'APROVADO'));
  recusados = computed(() => this.lista().filter(d => d.statusCadastro === 'RECUSADO'));

  ngOnInit() { this.carregar(); }

  carregar() {
    this.api.listarAdmin().subscribe({
      next: l => this.lista.set(l),
      error: e => this.erro.set(mensagemDeErro(e, 'Não foi possível carregar os entregadores.')),
    });
  }

  mudar(d: EntregadorAdmin, status: 'APROVADO' | 'RECUSADO') {
    this.erro.set('');
    this.api.alterarStatus(d.id, status).subscribe({
      next: () => this.carregar(),
      error: e => this.erro.set(mensagemDeErro(e, 'Não foi possível alterar o cadastro.')),
    });
  }
}
