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
}

export type StatusPedido =
  | 'RECEBIDO' | 'CONFIRMADO' | 'EM_PREPARO' | 'PRONTO'
  | 'SAIU_ENTREGA' | 'FINALIZADO' | 'CANCELADO';

export interface ItemPedidoRequest {
  pratoId: number;
  quantidade: number;
  observacoes?: string;
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
  custoPorPorcao: number | null; precoVenda: number; foodCost: number | null;
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
export interface DashboardTotais { pedidos: number; vendas: number; cancelados: number; pedidosAbertos: number; faturamento: number; ticketMedio: number; }
export interface Dashboard {
  dias: number;
  totais: DashboardTotais;
  pedidosPorStatus: { status: StatusPedido; quantidade: number }[];
  vendasPorDia: { data: string; pedidos: number; faturamento: number }[];
  maisVendidos: { prato: string; quantidade: number; receita: number }[];
  estoqueBaixo: Ingrediente[];
}
