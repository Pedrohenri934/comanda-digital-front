import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, mensagemDeErro } from '../../services/auth.service';
import { CardapioService } from '../../services/cardapio.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { PedidoService } from '../../services/pedido.service';
import { Categoria, Prato } from '../../models/api.models';
import { moeda } from '../../models/status-pedido';

// Cardapio PUBLICO (RF-001): qualquer pessoa ve os pratos. Login so e exigido ao finalizar o pedido.
@Component({
  selector: 'app-client-menu',
  standalone: true,
  imports: [FormsModule],
  template: `
<div class="min-h-screen bg-[#0a0a0a]">
  <header class="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur border-b border-neutral-800/50 px-4 py-3">
    <div class="max-w-5xl mx-auto flex items-center justify-between gap-4">
      <button (click)="r.navigateByUrl('/')" class="flex items-center gap-2">
        <span class="text-red-500 text-xl">🔥</span>
        <span class="text-white font-semibold hidden sm:block">Boi Na Brasa</span>
      </button>
      <div class="flex-1 max-w-sm">
        <input [(ngModel)]="busca" (ngModelChange)="buscaSig.set($event)" placeholder="Buscar prato..."
          class="w-full bg-[#1a1a1a] border border-neutral-800 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/>
      </div>
      <div class="flex items-center gap-2">
        @if(auth.isLoggedIn() && auth.role()==='CLIENTE'){
          <span class="text-neutral-400 text-sm hidden md:block">{{auth.usuario()?.nome}}</span>
          <button (click)="r.navigateByUrl('/cliente/pedidos')" class="px-3 py-2 text-sm text-neutral-300 hover:text-red-400 transition-colors">Meus pedidos</button>
        } @else if(auth.isLoggedIn()){
          <span class="text-neutral-400 text-sm hidden md:block">{{auth.usuario()?.nome}}</span>
          <button (click)="irParaPainel()" class="px-3 py-2 text-sm text-neutral-300 hover:text-red-400 transition-colors">Meu painel</button>
        } @else {
          <button (click)="r.navigateByUrl('/entrar')" class="px-3 py-2 text-sm text-neutral-300 hover:text-red-400 transition-colors">Entrar</button>
          <button (click)="r.navigateByUrl('/cliente/cadastro')" class="px-3 py-2 text-sm bg-red-800 hover:bg-red-700 text-white rounded-xl transition-colors hidden sm:block">Cadastrar</button>
        }
        <button (click)="carrinhoAberto.set(true)" class="relative p-2 bg-red-900/40 hover:bg-red-900/60 border border-red-800/50 rounded-xl transition-colors" aria-label="Abrir carrinho">
          <span class="text-lg">🛒</span>
          @if(cart.quantidade()>0){<span class="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">{{cart.quantidade()}}</span>}
        </button>
        @if(auth.isLoggedIn()){
          <button (click)="sair()" class="px-2 py-2 text-xs text-neutral-500 hover:text-red-400 transition-colors">Sair</button>
        }
      </div>
    </div>
  </header>

  <div class="max-w-5xl mx-auto px-4 py-6">
    <div class="flex gap-2 overflow-x-auto pb-2 mb-6">
      <button (click)="escolherCategoria(null)" class="flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-colors"
        [class]="categoriaId()===null ? 'bg-red-800 text-white' : 'bg-[#1a1a1a] text-neutral-400 hover:text-white border border-neutral-800'">Todos</button>
      @for(c of categorias(); track c.id){
        <button (click)="escolherCategoria(c.id)" class="flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-colors"
          [class]="categoriaId()===c.id ? 'bg-red-800 text-white' : 'bg-[#1a1a1a] text-neutral-400 hover:text-white border border-neutral-800'">{{c.nome}}</button>
      }
    </div>

    @if(erro()){
      <div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4 flex items-center justify-between gap-3">
        <span>{{erro()}}</span>
        <button (click)="carregar()" class="underline flex-shrink-0">Tentar de novo</button>
      </div>
    }

    @if(carregando()){
      <div class="text-center py-16 text-neutral-500">Carregando cardápio...</div>
    } @else if(!erro() && filtrados().length===0){
      <div class="text-center py-16 text-neutral-500">Nenhum prato encontrado</div>
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for(p of filtrados(); track p.id){
          <div class="bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden group">
            <button (click)="abrirDetalhe(p)" class="block w-full text-left">
              <div class="relative h-44 bg-gradient-to-br from-red-950 to-neutral-900 flex items-center justify-center">
                @if(p.fotoUrl && !fotosQuebradas().has(p.id)){
                  <img [src]="p.fotoUrl" (error)="fotoQuebrou(p.id)" [alt]="p.nome" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                } @else {
                  <span class="text-5xl">{{emoji(p.categoria)}}</span>
                }
                <span class="absolute top-2 left-2 bg-black/60 text-neutral-200 text-xs px-2 py-1 rounded-lg">{{p.categoria}}</span>
              </div>
              <div class="p-4 pb-2">
                <h3 class="text-white text-sm mb-1">{{p.nome}}</h3>
                <p class="text-neutral-500 text-xs line-clamp-2 min-h-[2rem]">{{p.descricao}}</p>
                @if(p.tempoPreparoMin){<p class="text-neutral-600 text-xs mt-1">⏱ ~{{p.tempoPreparoMin}} min</p>}
              </div>
            </button>
            <div class="px-4 pb-4 flex items-center justify-between">
              <p class="text-red-400 font-bold">{{moeda(p.precoVenda)}}</p>
              @if(cart.qtdDoPrato(p.id)>0){
                <div class="flex items-center gap-2">
                  <button (click)="cart.alterarQuantidade(p.id, cart.qtdDoPrato(p.id)-1)" class="w-7 h-7 bg-neutral-800 hover:bg-red-900 text-white rounded-lg text-sm" aria-label="Diminuir">−</button>
                  <span class="text-white text-sm w-4 text-center">{{cart.qtdDoPrato(p.id)}}</span>
                  <button (click)="cart.adicionar(p)" class="w-7 h-7 bg-red-800 hover:bg-red-700 text-white rounded-lg text-sm" aria-label="Aumentar">+</button>
                </div>
              } @else {
                <button (click)="cart.adicionar(p)" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-3 py-1.5 text-sm transition-colors">+ Adicionar</button>
              }
            </div>
          </div>
        }
      </div>
      @if(!ultimaPagina()){
        <div class="text-center mt-6">
          <button (click)="carregarMais()" class="bg-[#1a1a1a] border border-neutral-800 text-neutral-300 hover:text-white rounded-xl px-6 py-2.5 text-sm">Carregar mais</button>
        </div>
      }
    }
  </div>

  <!-- Detalhe do prato -->
  @if(detalhe(); as d){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="detalhe.set(null)"></div>
      <div class="relative w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl max-h-[90vh] overflow-y-auto">
        <div class="h-40 bg-gradient-to-br from-red-950 to-neutral-900 flex items-center justify-center overflow-hidden rounded-t-2xl">
          @if(d.fotoUrl && !fotosQuebradas().has(d.id)){<img [src]="d.fotoUrl" (error)="fotoQuebrou(d.id)" [alt]="d.nome" class="w-full h-full object-cover"/>} @else {<span class="text-6xl">{{emoji(d.categoria)}}</span>}
        </div>
        <div class="p-6 space-y-3">
          <div class="flex items-start justify-between gap-3">
            <h2 class="text-white text-lg font-semibold">{{d.nome}}</h2>
            <button (click)="detalhe.set(null)" class="text-neutral-400 hover:text-white" aria-label="Fechar">✕</button>
          </div>
          <p class="text-neutral-400 text-sm">{{d.descricao}}</p>
          @if(d.tempoPreparoMin){<p class="text-neutral-500 text-xs">⏱ Preparo médio: {{d.tempoPreparoMin}} min</p>}
          <textarea [(ngModel)]="obsDetalhe" rows="2" maxlength="200" placeholder="Observações (ex.: sem cebola)" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"></textarea>
          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center gap-3">
              <button (click)="qtdDetalhe.set(max(1, qtdDetalhe()-1))" class="w-8 h-8 bg-neutral-800 text-white rounded-lg">−</button>
              <span class="text-white w-6 text-center">{{qtdDetalhe()}}</span>
              <button (click)="qtdDetalhe.set(min(50, qtdDetalhe()+1))" class="w-8 h-8 bg-red-800 text-white rounded-lg">+</button>
            </div>
            <button (click)="adicionarDetalhe(d)" class="bg-red-800 hover:bg-red-700 text-white rounded-xl px-5 py-2.5 text-sm">Adicionar · {{moeda(d.precoVenda*qtdDetalhe())}}</button>
          </div>
        </div>
      </div>
    </div>
  }

  <!-- Carrinho -->
  @if(carrinhoAberto()){
    <div class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-black/70" (click)="carrinhoAberto.set(false)"></div>
      <div class="relative w-full max-w-sm bg-[#111111] border-l border-neutral-800 h-full flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 class="text-white font-semibold">Meu Pedido</h2>
          <button (click)="carrinhoAberto.set(false)" class="text-neutral-400 hover:text-white" aria-label="Fechar">✕</button>
        </div>
        @if(cart.itens().length===0){
          <div class="flex-1 flex items-center justify-center text-neutral-500">Carrinho vazio</div>
        } @else {
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            @for(item of cart.itens(); track item.pratoId){
              <div class="bg-[#1a1a1a] rounded-xl p-3 space-y-2">
                <div class="flex items-center gap-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-white text-sm truncate">{{item.nome}}</p>
                    <p class="text-red-400 text-sm">{{moeda(item.precoVenda*item.quantidade)}}</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <button (click)="cart.alterarQuantidade(item.pratoId, item.quantidade-1)" class="w-6 h-6 bg-neutral-700 text-white rounded text-sm" aria-label="Diminuir">−</button>
                    <span class="text-white text-sm w-5 text-center">{{item.quantidade}}</span>
                    <button (click)="cart.alterarQuantidade(item.pratoId, item.quantidade+1)" class="w-6 h-6 bg-red-800 text-white rounded text-sm" aria-label="Aumentar">+</button>
                  </div>
                  <button (click)="cart.remover(item.pratoId)" class="text-neutral-500 hover:text-red-400 text-sm" aria-label="Remover">🗑</button>
                </div>
                <input [value]="item.observacoes" (input)="cart.alterarObservacoes(item.pratoId, $any($event.target).value)" maxlength="200" placeholder="Observações do item"
                  class="w-full bg-[#111] border border-neutral-800 text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:border-red-700 placeholder:text-neutral-600"/>
              </div>
            }
          </div>
          <div class="p-4 border-t border-neutral-800">
            <div class="flex justify-between text-white mb-1"><span>Total estimado</span><span class="text-red-400 font-bold">{{moeda(cart.total())}}</span></div>
            <p class="text-neutral-600 text-xs mb-4">O valor final é confirmado pelo restaurante ao enviar o pedido.</p>
            <button (click)="finalizar()" class="w-full bg-red-800 hover:bg-red-700 text-white rounded-xl py-3 transition-colors">Finalizar Pedido</button>
          </div>
        }
      </div>
    </div>
  }

  <!-- Checkout -->
  @if(checkoutAberto()){
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80" (click)="fecharCheckout()"></div>
      <div class="relative w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 class="text-white font-semibold">Finalizar Pedido</h2>
          <button (click)="fecharCheckout()" class="text-neutral-400 hover:text-white" aria-label="Fechar">✕</button>
        </div>
        <div class="p-6 space-y-4">
          @if(erroPedido()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm">{{erroPedido()}}</div>}
          <div class="bg-[#1a1a1a] rounded-xl p-3 text-sm space-y-1">
            @for(item of cart.itens(); track item.pratoId){
              <div class="flex justify-between text-neutral-300"><span>{{item.quantidade}}× {{item.nome}}</span><span>{{moeda(item.precoVenda*item.quantidade)}}</span></div>
            }
          </div>
          <h3 class="text-neutral-300 text-sm">📍 Endereço de entrega</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2"><input [(ngModel)]="end.rua" placeholder="Rua / Avenida *" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/></div>
            <input [(ngModel)]="end.numero" placeholder="Número *" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/>
            <input [(ngModel)]="end.cep" placeholder="CEP *" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/>
            <div class="col-span-2"><input [(ngModel)]="end.complemento" placeholder="Complemento / referência (opcional)" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"/></div>
          </div>
          <textarea [(ngModel)]="obsPedido" rows="2" maxlength="300" placeholder="Observações gerais do pedido (opcional)" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-red-700 placeholder:text-neutral-600"></textarea>
          <p class="text-neutral-500 text-xs">💵 Pagamento na entrega.</p>
          <div class="border-t border-neutral-800 pt-4 flex items-center justify-between">
            <div><p class="text-neutral-400 text-sm">Total estimado</p><p class="text-red-400 font-bold text-xl">{{moeda(cart.total())}}</p></div>
            <button (click)="enviarPedido()" [disabled]="enviando()" class="bg-red-800 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl px-6 py-3 transition-colors">
              {{enviando() ? 'Enviando...' : 'Confirmar Pedido'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  }
</div>`
})
export class ClientMenuComponent implements OnInit {
  auth = inject(AuthService);
  cart = inject(CarrinhoService);
  r = inject(Router);
  private route = inject(ActivatedRoute);
  private cardapio = inject(CardapioService);
  private pedidos = inject(PedidoService);

  moeda = moeda;
  max = Math.max; min = Math.min;
  readonly TAM = 50;

  categorias = signal<Categoria[]>([]);
  categoriaId = signal<number | null>(null);
  pratos = signal<Prato[]>([]);
  pagina = signal(0);
  ultimaPagina = signal(true);
  carregando = signal(true);
  erro = signal('');

  busca = '';
  buscaSig = signal('');
  filtrados = computed(() => {
    const q = this.buscaSig().trim().toLowerCase();
    return q ? this.pratos().filter(p => p.nome.toLowerCase().includes(q)) : this.pratos();
  });

  detalhe = signal<Prato | null>(null);
  qtdDetalhe = signal(1);
  obsDetalhe = '';

  carrinhoAberto = signal(false);
  checkoutAberto = signal(false);
  // Foto que nao carrega (link fora do ar) cai no emoji da categoria, em vez de mostrar imagem quebrada.
  fotosQuebradas = signal<Set<number>>(new Set());
  fotoQuebrou(id: number) { this.fotosQuebradas.update(s => new Set(s).add(id)); }
  enviando = signal(false);
  erroPedido = signal('');
  end = { rua: '', numero: '', cep: '', complemento: '' };
  obsPedido = '';

  ngOnInit() {
    this.cardapio.categorias().subscribe({ next: c => this.categorias.set(c), error: e => this.erro.set(mensagemDeErro(e)) });
    this.carregar();
    // Voltou do login com ?checkout=1: reabre a finalizacao do pedido.
    if (this.route.snapshot.queryParamMap.get('checkout') === '1' && this.auth.hasRole('CLIENTE') && this.cart.itens().length) {
      this.checkoutAberto.set(true);
      this.r.navigate([], { queryParams: {}, replaceUrl: true });
    }
  }

  carregar() {
    this.carregando.set(true); this.erro.set('');
    this.cardapio.listar(this.categoriaId(), 0, this.TAM).subscribe({
      next: p => { this.pratos.set(p.content); this.pagina.set(0); this.ultimaPagina.set(p.last); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemDeErro(e, 'Não foi possível carregar o cardápio.')); this.carregando.set(false); },
    });
  }

  carregarMais() {
    const prox = this.pagina() + 1;
    this.cardapio.listar(this.categoriaId(), prox, this.TAM).subscribe({
      next: p => { this.pratos.update(l => [...l, ...p.content]); this.pagina.set(prox); this.ultimaPagina.set(p.last); },
      error: e => this.erro.set(mensagemDeErro(e)),
    });
  }

  escolherCategoria(id: number | null) { this.categoriaId.set(id); this.carregar(); }

  emoji(categoria: string): string {
    const c = categoria.toLowerCase();
    if (c.includes('bebida')) return '🥤';
    if (c.includes('carne')) return '🥩';
    if (c.includes('combo')) return '🍽️';
    if (c.includes('sobremesa') || c.includes('doce')) return '🍨';
    if (c.includes('acompanh') || c.includes('porç')) return '🍟';
    return '🍔';
  }

  irParaPainel() {
    const perfil = this.auth.role();
    this.r.navigateByUrl(perfil === 'COZINHEIRO' ? '/cozinha/painel' : '/admin/dashboard');
  }

  abrirDetalhe(p: Prato) { this.qtdDetalhe.set(1); this.obsDetalhe = ''; this.detalhe.set(p); }
  adicionarDetalhe(p: Prato) { this.cart.adicionar(p, this.qtdDetalhe(), this.obsDetalhe); this.detalhe.set(null); }

  // Finalizar: sem login vai para a tela de entrada e volta aqui com o carrinho intacto.
  finalizar() {
    if (!this.auth.hasRole('CLIENTE')) {
      this.carrinhoAberto.set(false);
      this.r.navigate(['/entrar'], { queryParams: { returnUrl: '/?checkout=1' } });
      return;
    }
    this.carrinhoAberto.set(false);
    this.erroPedido.set('');
    this.checkoutAberto.set(true);
  }

  fecharCheckout() { if (!this.enviando()) this.checkoutAberto.set(false); }

  enviarPedido() {
    this.erroPedido.set('');
    if (!this.end.rua.trim() || !this.end.numero.trim() || !this.end.cep.trim()) {
      this.erroPedido.set('Preencha rua, número e CEP.'); return;
    }
    const enderecoEntrega = [`${this.end.rua.trim()}, ${this.end.numero.trim()}`, `CEP ${this.end.cep.trim()}`, this.end.complemento.trim()]
      .filter(Boolean).join(' - ');
    this.enviando.set(true);
    this.pedidos.criar({
      itens: this.cart.itens().map(i => ({ pratoId: i.pratoId, quantidade: i.quantidade, ...(i.observacoes.trim() ? { observacoes: i.observacoes.trim() } : {}) })),
      enderecoEntrega,
      ...(this.obsPedido.trim() ? { observacoes: this.obsPedido.trim() } : {}),
    }).subscribe({
      next: p => { this.enviando.set(false); this.checkoutAberto.set(false); this.cart.limpar(); this.r.navigateByUrl('/cliente/pedido/' + p.id); },
      // 422 de estoque insuficiente (RN03) chega aqui com a lista de ingredientes faltando na mensagem.
      error: e => { this.enviando.set(false); this.erroPedido.set(mensagemDeErro(e, 'Não foi possível enviar o pedido.')); },
    });
  }

  sair() { this.auth.logout('/cliente/cardapio'); }
}
