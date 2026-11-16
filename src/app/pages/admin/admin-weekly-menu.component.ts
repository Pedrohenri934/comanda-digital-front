import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CardapioSemanaService } from '../../services/cardapio-semana.service';
import { CadastroAdminService } from '../../services/cadastro-admin.service';
import { mensagemDeErro } from '../../services/auth.service';
import { DiaCardapio, PratoAdmin } from '../../models/api.models';
import { moeda } from '../../models/status-pedido';

// Cardapio da semana: define quais pratos aparecem em cada dia e qual e o especial do dia.
// O cliente ve os especiais de hoje no topo do cardapio.
@Component({
  selector: 'app-admin-weekly-menu',
  standalone: true,
  template: `
<div class="p-4 md:p-6 max-w-5xl mx-auto">
  <div class="mb-6">
    <h1 class="text-white text-2xl font-semibold">Cardápio da Semana</h1>
    <p class="text-neutral-400 text-sm mt-1">Escolha os pratos de cada dia e marque ⭐ o especial do dia (aparece em destaque para o cliente)</p>
  </div>

  @if(erro()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{{erro()}}</div>}
  @if(ok()){<div class="bg-green-900/30 border border-green-800/50 text-green-400 rounded-xl px-4 py-3 text-sm mb-4">{{ok()}}</div>}

  <div class="flex gap-2 overflow-x-auto pb-2 mb-6">
    @for(d of dias(); track d.dia){
      <button (click)="escolherDia(d.dia)" [disabled]="editando()"
        class="flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-colors relative disabled:opacity-60"
        [class]="sel()===d.dia ? 'bg-red-800 text-white' : 'bg-[#1a1a1a] text-neutral-400 border border-neutral-800 hover:text-white'">
        {{d.nome}}
        @if(d.hoje){<span class="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>}
      </button>
    }
  </div>

  @if(diaAtual(); as d){
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h2 class="text-white font-semibold">{{d.nome}} @if(d.hoje){<span class="text-green-400 text-sm">(Hoje)</span>}</h2>
          <p class="text-neutral-500 text-sm">{{d.itens.length}} pratos no cardápio</p>
        </div>
        @if(!editando()){
          <button (click)="editar()" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm transition-colors">Editar</button>
        } @else {
          <div class="flex gap-2">
            <button (click)="cancelar()" [disabled]="salvando()" class="bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl px-4 py-2 text-sm transition-colors">Cancelar</button>
            <button (click)="salvar()" [disabled]="salvando()" class="bg-green-800 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl px-4 py-2 text-sm transition-colors">{{salvando()?'Salvando...':'✓ Salvar'}}</button>
          </div>
        }
      </div>

      @if(!editando()){
        @if(d.itens.length===0){
          <p class="text-neutral-500 text-sm text-center py-8">Nenhum prato configurado para este dia</p>
        } @else {
          <div class="space-y-3">
            @for(i of d.itens; track i.pratoId){
              <div class="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3">
                @if(i.fotoUrl){<img [src]="i.fotoUrl" [alt]="i.nome" class="w-12 h-12 rounded-lg object-cover"/>} @else {<div class="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center">🍽️</div>}
                <div class="flex-1 min-w-0">
                  <p class="text-white text-sm flex items-center gap-2 flex-wrap">{{i.nome}}
                    @if(i.destaque){<span class="text-xs bg-yellow-900/40 text-yellow-300 px-2 py-0.5 rounded-full">⭐ Especial</span>}
                    @if(i.status!=='ATIVO'){<span class="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">Inativo</span>}
                  </p>
                  <p class="text-neutral-500 text-xs">{{i.categoria}} · {{moeda(i.preco)}}</p>
                </div>
              </div>
            }
          </div>
        }
      } @else {
        <p class="text-neutral-500 text-xs mb-3">Marque os pratos que entram neste dia. A estrela define o especial.</p>
        @if(carregandoPratos()){
          <p class="text-neutral-500 text-sm text-center py-8">Carregando pratos...</p>
        } @else {
          <div class="space-y-2">
            @for(p of pratos(); track p.id){
              <div class="flex items-center gap-3 rounded-xl p-3 border"
                [class]="incluido(p.id) ? 'bg-[#1a1a1a] border-red-900/50' : 'bg-[#101010] border-neutral-800'">
                <input type="checkbox" [checked]="incluido(p.id)" (change)="alternar(p.id)" class="w-4 h-4 accent-red-600"/>
                @if(p.fotoUrl){<img [src]="p.fotoUrl" [alt]="p.nome" class="w-10 h-10 rounded-lg object-cover"/>} @else {<div class="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">🍽️</div>}
                <div class="flex-1 min-w-0">
                  <p class="text-white text-sm truncate">{{p.nome}}</p>
                  <p class="text-neutral-500 text-xs">{{p.categoria}} · {{moeda(p.precoVenda)}}</p>
                </div>
                <button type="button" (click)="alternarDestaque(p.id)" [disabled]="!incluido(p.id)"
                  class="text-xl disabled:opacity-20" [title]="'Especial do dia'">{{destaque(p.id) ? '⭐' : '☆'}}</button>
              </div>
            }
          </div>
        }
      }
    </div>
  }
</div>`
})
export class AdminWeeklyMenuComponent implements OnInit {
  private api = inject(CardapioSemanaService);
  private cadastro = inject(CadastroAdminService);
  moeda = moeda;

  dias = signal<DiaCardapio[]>([]);
  sel = signal(1);
  diaAtual = computed(() => this.dias().find(d => d.dia === this.sel()) ?? null);
  pratos = signal<PratoAdmin[]>([]);
  carregandoPratos = signal(false);
  editando = signal(false);
  salvando = signal(false);
  erro = signal('');
  ok = signal('');
  // pratoId -> e especial? (so tem o que esta marcado para o dia em edicao)
  private marcados = signal<Record<number, boolean>>({});

  ngOnInit() {
    this.api.listar().subscribe({
      next: d => { this.dias.set(d); this.sel.set(d.find(x => x.hoje)?.dia ?? 1); },
      error: e => this.erro.set(mensagemDeErro(e, 'Não foi possível carregar o cardápio da semana.')),
    });
  }

  escolherDia(d: number) { this.sel.set(d); this.ok.set(''); }

  editar() {
    this.ok.set(''); this.erro.set('');
    const mapa: Record<number, boolean> = {};
    for (const i of this.diaAtual()?.itens ?? []) mapa[i.pratoId] = i.destaque;
    this.marcados.set(mapa);
    this.editando.set(true);
    this.carregandoPratos.set(true);
    this.cadastro.pratos(0, 100).subscribe({
      next: p => { this.pratos.set(p.content.filter(x => x.status === 'ATIVO')); this.carregandoPratos.set(false); },
      error: e => { this.carregandoPratos.set(false); this.editando.set(false); this.erro.set(mensagemDeErro(e)); },
    });
  }

  cancelar() { this.editando.set(false); }

  incluido(id: number) { return id in this.marcados(); }
  destaque(id: number) { return this.marcados()[id] === true; }
  alternar(id: number) {
    this.marcados.update(m => { const n = { ...m }; if (id in n) delete n[id]; else n[id] = false; return n; });
  }
  alternarDestaque(id: number) {
    if (!this.incluido(id)) return;
    this.marcados.update(m => ({ ...m, [id]: !m[id] }));
  }

  salvar() {
    const itens = Object.entries(this.marcados()).map(([id, destaque]) => ({ pratoId: Number(id), destaque }));
    this.salvando.set(true); this.erro.set('');
    this.api.salvarDia(this.sel(), itens).subscribe({
      next: d => {
        this.dias.update(l => l.map(x => x.dia === d.dia ? d : x));
        this.salvando.set(false); this.editando.set(false); this.ok.set(`Cardápio de ${d.nome} salvo.`);
      },
      error: e => { this.salvando.set(false); this.erro.set(mensagemDeErro(e, 'Não foi possível salvar.')); },
    });
  }
}
