import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CategoriaAdmin, CategoriaForm, Ficha, GrupoCombo, GrupoComboForm, Movimentacao, FichaItem, Ingrediente, IngredienteForm, Pagina, PratoAdmin, PratoForm, StatusPratoApi,
} from '../models/api.models';

// Cadastros do painel administrativo (perfis ADMIN e GERENTE).
@Injectable({ providedIn: 'root' })
export class CadastroAdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/admin`;

  // categorias
  categorias(): Observable<CategoriaAdmin[]> { return this.http.get<CategoriaAdmin[]>(`${this.base}/categorias`); }
  criarCategoria(f: CategoriaForm) { return this.http.post<CategoriaAdmin>(`${this.base}/categorias`, f); }
  atualizarCategoria(id: number, f: CategoriaForm) { return this.http.put<CategoriaAdmin>(`${this.base}/categorias/${id}`, f); }
  inativarCategoria(id: number) { return this.http.delete<CategoriaAdmin>(`${this.base}/categorias/${id}`); }
  reativarCategoria(id: number) { return this.http.post<CategoriaAdmin>(`${this.base}/categorias/${id}/reativar`, {}); }

  // pratos
  pratos(page = 0, size = 100): Observable<Pagina<PratoAdmin>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', 'nome');
    return this.http.get<Pagina<PratoAdmin>>(`${this.base}/pratos`, { params });
  }
  opcoesDoPrato(id: number) { return this.http.get<GrupoCombo[]>(`${this.base}/pratos/${id}/opcoes`); }
  salvarOpcoesDoPrato(id: number, grupos: GrupoComboForm[]) { return this.http.put<GrupoCombo[]>(`${this.base}/pratos/${id}/opcoes`, { grupos }); }
  // estoque: alertas, historico e movimentacoes manuais
  alertasEstoque() { return this.http.get<Ingrediente[]>(`${this.base}/estoque/alertas`); }
  movimentacoes(ingredienteId: number | null, tipo: string, page = 0, size = 30) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (ingredienteId) params = params.set('ingredienteId', ingredienteId);
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<Pagina<Movimentacao>>(`${this.base}/estoque/movimentacoes`, { params });
  }
  entradaEstoque(corpo: { ingredienteId: number; quantidade: number; custoUnitario: number; lote?: string; validade?: string; observacao?: string }) {
    return this.http.post<void>(`${this.base}/estoque/entrada`, corpo);
  }
  saidaEstoque(corpo: { ingredienteId: number; quantidade: number; motivo: string; observacao?: string }) {
    return this.http.post<void>(`${this.base}/estoque/saida`, corpo);
  }

  criarPrato(f: PratoForm) { return this.http.post<PratoAdmin>(`${this.base}/pratos`, f); }
  atualizarPrato(id: number, f: PratoForm) { return this.http.put<PratoAdmin>(`${this.base}/pratos/${id}`, f); }
  statusPrato(id: number, status: StatusPratoApi) { return this.http.patch<PratoAdmin>(`${this.base}/pratos/${id}/status`, { status }); }

  // ficha tecnica
  ficha(pratoId: number): Observable<Ficha> { return this.http.get<Ficha>(`${this.base}/pratos/${pratoId}/ficha`); }
  salvarFicha(pratoId: number, rendimento: number, modoPreparo: string, itens: FichaItem[]): Observable<Ficha> {
    const corpo = {
      rendimento, modoPreparo,
      itens: itens.map(i => ({ ingredienteId: i.ingredienteId, quantidade: i.quantidade, unidade: i.unidade, fatorCorrecao: i.fatorCorrecao })),
    };
    return this.http.put<Ficha>(`${this.base}/pratos/${pratoId}/ficha`, corpo);
  }

  // ingredientes
  ingredientes(): Observable<Ingrediente[]> { return this.http.get<Ingrediente[]>(`${this.base}/ingredientes`); }
  criarIngrediente(f: IngredienteForm) { return this.http.post<Ingrediente>(`${this.base}/ingredientes`, f); }
  atualizarIngrediente(id: number, f: IngredienteForm) { return this.http.put<Ingrediente>(`${this.base}/ingredientes/${id}`, f); }
  inativarIngrediente(id: number) { return this.http.delete<Ingrediente>(`${this.base}/ingredientes/${id}`); }
  reativarIngrediente(id: number) { return this.http.post<Ingrediente>(`${this.base}/ingredientes/${id}/reativar`, {}); }
}
