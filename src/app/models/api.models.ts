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
