import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DiaCardapio, ItemHoje } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CardapioSemanaService {
  private http = inject(HttpClient);
  private admin = `${environment.apiUrl}/api/admin/cardapio-semana`;

  /** Admin/gerente: os 7 dias com seus pratos. */
  listar(): Observable<DiaCardapio[]> { return this.http.get<DiaCardapio[]>(this.admin); }

  /** Troca os pratos de um dia (1 = segunda ... 7 = domingo). */
  salvarDia(dia: number, itens: { pratoId: number; destaque: boolean }[]): Observable<DiaCardapio> {
    return this.http.put<DiaCardapio>(`${this.admin}/${dia}`, { itens });
  }

  /** Publico: pratos e especiais de hoje. */
  hoje(): Observable<ItemHoje[]> { return this.http.get<ItemHoje[]>(`${environment.apiUrl}/api/cardapio/hoje`); }
}
