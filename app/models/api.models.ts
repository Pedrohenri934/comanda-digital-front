// Modelos que espelham os DTOs da API (Etapa 3). Nomes IGUAIS aos do back-end.

export interface Pagina<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  last: boolean;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface Prato {
  id: number;
  nome: string;
  descricao: string | null;
  fotoUrl: string | null;
  precoVenda: number;
  tempoPreparoMin: number | null;
  categoriaId: number;
  categoria: string;
  temOpcoes?: boolean;
}

// Combos com escolhas (grupos e opcoes).
export interface OpcaoCombo { id: number; nome: string; pratoId: number | null; acrescimo: number; disponivel: boolean; }
export interface GrupoCombo { id: number; nome: string; minimo: number; maximo: number; opcoes: OpcaoCombo[]; }
export interface EscolhaCarrinho { grupo: string; opcaoId: number; nome: string; acrescimo: number; }
export interface GrupoComboForm { nome: string; minimo: number; maximo: number; opcoes: { nome: string; pratoId: number | null; acrescimo: number }[]; }

export type StatusPedido =
  | 'RECEBIDO' | 'CONFIRMADO' | 'EM_PREPARO' | 'PRONTO'
  | 'SAIU_ENTREGA' | 'FINALIZADO' | 'CANCELADO';

export interface ItemPedidoRequest {
  pratoId: number;
  quantidade: number;
  observacoes?: string;
  opcoes?: number[];
}

export interface CriarPedidoRequest {
  itens: ItemPedidoRequest[];
  observacoes?: string;
  enderecoEntrega?: string;
}

export interface PedidoItem {
  pratoId: number;
  pratoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  observacoes: string | null;
  escolhas?: string[];
}

export interface Pedido {
  id: number;
  status: StatusPedido;
  valorTotal: number;
  enderecoEntrega: string | null;
  observacoes: string | null;
  pago: boolean;
  motivoCancelamento: string | null;
  criadoEm: string;
  itens: PedidoItem[];
}

export interface PedidoStatus {
  id: number;
  status: StatusPedido;
  motivoCancelamento: string | null;
  atualizadoEm: string;
}

// Item do carrinho (fica no navegador ate o pedido ser enviado).
export interface ItemCarrinho {
  chave: string;
  escolhas: EscolhaCarrinho[];
  pratoId: number;
  nome: string;
  precoVenda: number;
  fotoUrl: string | null;
  quantidade: number;
  observacoes: string;
}

// Pedido na visao da cozinha/gerencia (GET /api/gestao/pedidos).
export interface PedidoGestao {
  id: number;
  status: StatusPedido;
  valorTotal: number;
  enderecoEntrega: string | null;
  observacoes: string | null;
  pago: boolean;
  canal: string;
  motivoCancelamento: string | null;
  criadoEm: string;
  atualizadoEm: string;
  clienteId: number;
  clienteNome: string;
  clienteTelefone: string | null;
  itens: PedidoItem[];
}

// ---- Cadastros do admin (categorias, pratos, ingredientes, ficha tecnica)
export type StatusPratoApi = 'ATIVO' | 'INATIVO' | 'PAUSADO';

export interface CategoriaAdmin { id: number; nome: string; descricao: string | null; ordem: number; status: 'ATIVO' | 'INATIVO'; }
export interface CategoriaForm { nome: string; descricao: string; ordem: number; }

export interface PratoAdmin {
  id: number; nome: string; descricao: string | null; fotoUrl: string | null; precoVenda: number;
  tempoPreparoMin: number; categoriaId: number; categoria: string; status: StatusPratoApi;
  custoPorPorcao: number | null; foodCost: number | null; temFicha: boolean;
}
export interface PratoForm {
  categoriaId: number | null; nome: string; descricao: string; fotoUrl: string; precoVenda: number | null; tempoPreparoMin: number | null;
}

export type Unidade = 'G' | 'KG' | 'ML' | 'L' | 'UN';
export interface Ingrediente {
  id: number; nome: string; sku: string; unidadePadrao: Unidade; estoqueMinimo: number; custoUnitario: number;
  status: 'ATIVO' | 'INATIVO'; saldo: number; abaixoDoMinimo: boolean;
}
export interface IngredienteForm { nome: string; sku: string; unidadePadrao: Unidade; estoqueMinimo: number | null; custoUnitario: number | null; }

export interface FichaItem { ingredienteId: number; ingredienteNome?: string; quantidade: number; unidade: Unidade; fatorCorrecao: number; custoLinha?: number; }
export interface Ficha {
  pratoId: number; rendimento: number; modoPreparo: string | null; itens: FichaItem[];
  custoPorPorcao: number | null; precoVenda: number; foodCost: number | null; aviso?: string | null;
}

// ---- Fornecedores e compras
export interface Fornecedor { id: number; razaoSocial: string; cnpj: string; telefone: string | null; email: string | null; status: 'ATIVO' | 'INATIVO'; }
export interface FornecedorForm { razaoSocial: string; cnpj: string; telefone: string; email: string; }

export type StatusCompra = 'RASCUNHO' | 'ENVIADO' | 'RECEBIDO' | 'CANCELADO';
export interface CompraItemForm { ingredienteId: number; quantidade: number; precoUnitario: number; }
export interface CompraItem extends CompraItemForm { ingredienteNome: string; unidade: Unidade; subtotal: number; }
export interface Compra {
  id: number; fornecedorId: number; fornecedorNome: string; status: StatusCompra; valorTotal: number;
  criadoEm: string; itens: CompraItem[];
}

// ---- Dashboard
export interface DashboardTotais { pedidos: number; vendas: number; cancelados: number; pedidosAbertos: number; faturamento: number; ticketMedio: number; foodCostMedio: number | null; }
export interface Dashboard {
  dias: number;
  totais: DashboardTotais;
  pedidosPorStatus: { status: StatusPedido; quantidade: number }[];
  vendasPorDia: { data: string; pedidos: number; faturamento: number }[];
  maisVendidos: { prato: string; quantidade: number; receita: number }[];
  estoqueBaixo: Ingrediente[];
}

// ---------- Cardapio da semana ----------
export interface ItemDia { pratoId: number; nome: string; categoria: string; fotoUrl: string | null; preco: number; status: string; destaque: boolean; }
export interface DiaCardapio { dia: number; nome: string; hoje: boolean; itens: ItemDia[]; }
export interface ItemHoje {
  pratoId: number; nome: string; descricao: string | null; categoria: string; fotoUrl: string | null;
  preco: number; tempoPreparoMin: number | null; destaque: boolean;
}

// ---------- Vendas por prato e Matriz BCG ----------
export type QuadranteBcg = 'ESTRELA' | 'VACA_LEITEIRA' | 'INTERROGACAO' | 'ABACAXI';
export interface PratoBcg {
  pratoId: number; nome: string; categoria: string; fotoUrl: string | null; preco: number; custo: number | null;
  margemPct: number; quantidade: number; receita: number; quadrante: QuadranteBcg;
}
export interface RelatorioBcg {
  dias: number; mediaMargemPct: number; limiarVendas: number;
  pratos: PratoBcg[]; maisVendidos: PratoBcg[]; menosVendidos: PratoBcg[];
}

// ---------- Entregadores ----------
export type StatusCadastroEntregador = 'PENDENTE' | 'APROVADO' | 'RECUSADO';
export interface PerfilEntregador {
  nome: string; email: string; veiculo: string; placa: string | null; statusCadastro: StatusCadastroEntregador;
  online: boolean; disponiveis: number; emEntrega: number; entreguesHoje: number; entreguesTotal: number;
}
export interface Entrega {
  pedidoId: number; cliente: string; telefone: string | null; endereco: string; valorTotal: number; pago: boolean;
  observacoes: string | null; itens: string | null; status: string; criadoEm: string;
}
export interface EntregadorAdmin {
  id: number; nome: string; email: string; telefone: string | null; veiculo: string; placa: string | null;
  statusCadastro: StatusCadastroEntregador; online: boolean; entregasConcluidas: number; emAndamento: number;
}
export interface RegisterEntregador {
  nome: string; email: string; senha: string; telefone: string; veiculo: string; placa: string;
}

// ---- Usuarios internos (RF-041)
export type PerfilInterno = 'ADMIN' | 'GERENTE' | 'COZINHEIRO';
export interface UsuarioInterno { id: number; nome: string; email: string; perfil: PerfilInterno; telefone: string | null; status: 'ATIVO' | 'INATIVO'; criadoEm: string; }
export interface UsuarioInternoForm { nome: string; email: string; senha: string; perfil: PerfilInterno; telefone: string; }

// ---- Movimentacoes de estoque
export type MotivoBaixa = 'DESPERDICIO' | 'VENCIMENTO' | 'QUEBRA' | 'USO_INTERNO';
export interface Movimentacao {
  id: number; ingredienteId: number; ingredienteNome: string; unidade: string; tipo: 'ENTRADA' | 'SAIDA' | 'ESTORNO'; motivo: string;
  quantidade: number; lote: string | null; validade: string | null; custoUnitario: number | null; observacao: string | null;
  usuarioNome: string; pedidoId: number | null; criadoEm: string;
}
