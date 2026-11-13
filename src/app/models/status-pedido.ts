import { StatusPedido } from './api.models';

// Textos e cores de cada status (usados em "Meus pedidos" e no acompanhamento).
export const STATUS_INFO: Record<StatusPedido, { label: string; desc: string; emoji: string; color: string }> = {
  RECEBIDO:     { label: 'Recebido',          desc: 'Recebemos seu pedido! Aguardando confirmação.',    emoji: '📥', color: 'text-sky-400 bg-sky-900/20 border-sky-800' },
  CONFIRMADO:   { label: 'Confirmado',        desc: 'Pedido confirmado pelo restaurante.',               emoji: '✅', color: 'text-blue-400 bg-blue-900/20 border-blue-800' },
  EM_PREPARO:   { label: 'Em preparo',        desc: 'A cozinha está preparando seu pedido.',             emoji: '👨‍🍳', color: 'text-orange-400 bg-orange-900/20 border-orange-800' },
  PRONTO:       { label: 'Pronto',            desc: 'Pedido pronto! Em breve sai para entrega.',         emoji: '⏰', color: 'text-yellow-400 bg-yellow-900/20 border-yellow-800' },
  SAIU_ENTREGA: { label: 'Saiu para entrega', desc: 'Seu pedido está a caminho!',                         emoji: '🚗', color: 'text-purple-400 bg-purple-900/20 border-purple-800' },
  FINALIZADO:   { label: 'Entregue',          desc: 'Pedido entregue. Bom apetite!',                      emoji: '🎉', color: 'text-green-400 bg-green-900/20 border-green-800' },
  CANCELADO:    { label: 'Cancelado',         desc: 'Este pedido foi cancelado.',                         emoji: '❌', color: 'text-red-400 bg-red-900/20 border-red-800' },
};

// Ordem da linha do tempo (CANCELADO fica fora: e um desvio, nao uma etapa).
export const ETAPAS: StatusPedido[] = ['RECEBIDO', 'CONFIRMADO', 'EM_PREPARO', 'PRONTO', 'SAIU_ENTREGA', 'FINALIZADO'];

// Pedidos que ainda nao terminaram (o acompanhamento continua atualizando sozinho).
export const emAndamento = (s: StatusPedido) => s !== 'FINALIZADO' && s !== 'CANCELADO';

export const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
