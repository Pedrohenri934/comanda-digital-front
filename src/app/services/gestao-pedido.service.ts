import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pagina, PedidoGestao, StatusPedido } from '../models/api.models';
import { mensagemDeErro } from './auth.service';

// Pedidos vistos pela cozinha e pela gerencia (perfis COZINHEIRO, GERENTE e ADMIN).
@Injectable({ providedIn: 'root' })
export class GestaoPedidoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/gestao/pedidos`;

  listar(status: StatusPedido[] = [], page = 0, size = 100, sort = 'createdAt,asc',
         filtros: { de?: string; ate?: string; canal?: string } = {}): Observable<Pagina<PedidoGestao>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    for (const s of status) params = params.append('status', s);
    if (filtros.de) params = params.set('de', filtros.de);
    if (filtros.ate) params = params.set('ate', filtros.ate);
    if (filtros.canal) params = params.set('canal', filtros.canal);
    return this.http.get<Pagina<PedidoGestao>>(this.base, { params });
  }

  alterarStatus(id: number, status: StatusPedido, motivo?: string): Observable<PedidoGestao> {
    return this.http.patch<PedidoGestao>(`${this.base}/${id}/status`, motivo ? { status, motivo } : { status });
  }
}

/** Mensagem para erro de status; no 422 de estoque lista cada ingrediente que falta. */
export function mensagemDePedido(err: unknown): string {
  if (err instanceof HttpErrorResponse && err.status === 422) {
    const campos = err.error?.campos;
    const linhas = campos && typeof campos === 'object' ? Object.entries(campos).map(([k, v]) => `${k}: ${v}`) : [];
    const base = err.error?.message ?? 'Não foi possível concluir.';
    return linhas.length ? `${base} — ${linhas.join('; ')}` : base;
  }
  if (err instanceof HttpErrorResponse && err.status === 403) return 'Seu perfil não tem permissão para esta ação.';
  return mensagemDeErro(err);
}
