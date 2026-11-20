import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Categoria, GrupoCombo, Pagina, Prato } from '../models/api.models';

// Cardapio publico: nao precisa de login (RF-001).
@Injectable({ providedIn: 'root' })
export class CardapioService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/cardapio`;

  listar(categoriaId: number | null, page = 0, size = 50): Observable<Pagina<Prato>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (categoriaId !== null) params = params.set('categoriaId', categoriaId);
    return this.http.get<Pagina<Prato>>(this.base, { params });
  }

  opcoes(pratoId: number): Observable<GrupoCombo[]> {
    return this.http.get<GrupoCombo[]>(`${this.base}/${pratoId}/opcoes`);
  }

  categorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.base}/categorias`);
  }
}
