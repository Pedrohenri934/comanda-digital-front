import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Compra, CompraItemForm, Fornecedor, FornecedorForm, StatusCompra } from '../models/api.models';

// Fornecedores e compras (perfis ADMIN e GERENTE). Receber uma compra da entrada no estoque.
@Injectable({ providedIn: 'root' })
export class CompraAdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/admin`;

  fornecedores(): Observable<Fornecedor[]> { return this.http.get<Fornecedor[]>(`${this.base}/fornecedores`); }
  criarFornecedor(f: FornecedorForm) { return this.http.post<Fornecedor>(`${this.base}/fornecedores`, f); }
  atualizarFornecedor(id: number, f: FornecedorForm) { return this.http.put<Fornecedor>(`${this.base}/fornecedores/${id}`, f); }
  inativarFornecedor(id: number) { return this.http.delete<Fornecedor>(`${this.base}/fornecedores/${id}`); }
  reativarFornecedor(id: number) { return this.http.post<Fornecedor>(`${this.base}/fornecedores/${id}/reativar`, {}); }

  compras(status?: StatusCompra): Observable<Compra[]> {
    const params = status ? new HttpParams().set('status', status) : new HttpParams();
    return this.http.get<Compra[]>(`${this.base}/compras`, { params });
  }
  criarCompra(fornecedorId: number, itens: CompraItemForm[]) { return this.http.post<Compra>(`${this.base}/compras`, { fornecedorId, itens }); }
  atualizarCompra(id: number, fornecedorId: number, itens: CompraItemForm[]) { return this.http.put<Compra>(`${this.base}/compras/${id}`, { fornecedorId, itens }); }
  statusCompra(id: number, status: StatusCompra) { return this.http.patch<Compra>(`${this.base}/compras/${id}/status`, { status }); }
}
