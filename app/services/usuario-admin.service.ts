import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PerfilInterno, UsuarioInterno } from '../models/api.models';

// Usuarios internos (somente ADMIN).
@Injectable({ providedIn: 'root' })
export class UsuarioAdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/admin/usuarios`;

  listar() { return this.http.get<UsuarioInterno[]>(this.base); }
  criar(f: { nome: string; email: string; senha: string; perfil: PerfilInterno; telefone?: string }) { return this.http.post<UsuarioInterno>(this.base, f); }
  atualizar(id: number, f: { nome: string; perfil: PerfilInterno; telefone?: string; senha?: string }) { return this.http.put<UsuarioInterno>(`${this.base}/${id}`, f); }
  status(id: number, status: 'ATIVO' | 'INATIVO') { return this.http.patch<UsuarioInterno>(`${this.base}/${id}/status`, { status }); }
}
