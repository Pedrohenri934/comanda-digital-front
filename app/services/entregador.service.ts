import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Entrega, EntregadorAdmin, PerfilEntregador, RegisterEntregador } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class EntregadorService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // Publico
  cadastrar(dados: RegisterEntregador): Observable<void> {
    return this.http.post<void>(`${this.api}/api/auth/register-entregador`, dados);
  }

  // Painel do entregador
  me(): Observable<PerfilEntregador> { return this.http.get<PerfilEntregador>(`${this.api}/api/entregador/me`); }
  definirOnline(online: boolean): Observable<PerfilEntregador> {
    return this.http.patch<PerfilEntregador>(`${this.api}/api/entregador/online`, { online });
  }
  disponiveis(): Observable<Entrega[]> { return this.http.get<Entrega[]>(`${this.api}/api/entregador/pedidos/disponiveis`); }
  ativas(): Observable<Entrega[]> { return this.http.get<Entrega[]>(`${this.api}/api/entregador/pedidos/ativos`); }
  aceitar(pedidoId: number): Observable<void> { return this.http.post<void>(`${this.api}/api/entregador/pedidos/${pedidoId}/aceitar`, {}); }
  entregar(pedidoId: number): Observable<void> { return this.http.post<void>(`${this.api}/api/entregador/pedidos/${pedidoId}/entregar`, {}); }

  // Admin / gerente
  listarAdmin(): Observable<EntregadorAdmin[]> { return this.http.get<EntregadorAdmin[]>(`${this.api}/api/admin/entregadores`); }
  alterarStatus(id: number, status: 'APROVADO' | 'RECUSADO'): Observable<void> {
    return this.http.patch<void>(`${this.api}/api/admin/entregadores/${id}/status`, { status });
  }
}
