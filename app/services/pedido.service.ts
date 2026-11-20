import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CriarPedidoRequest, Pagina, Pedido, PedidoStatus } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/pedidos`;

  criar(dados: CriarPedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(this.base, dados);
  }

  meus(page = 0, size = 50): Observable<Pagina<Pedido>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Pagina<Pedido>>(`${this.base}/meus`, { params });
  }

  status(id: number): Observable<PedidoStatus> {
    return this.http.get<PedidoStatus>(`${this.base}/${id}/status`);
  }
}
