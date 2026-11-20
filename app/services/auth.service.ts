import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { JwtPayload, LoginRequest, LoginResponse, Perfil, RegisterRequest, UsuarioApi } from '../models/auth.models';
import { AppStateService } from './app-state.service';

const TOKEN_KEY = 'comanda-digital:token';
const USUARIO_KEY = 'comanda-digital:usuario';

function lerStorage(chave: string): string | null {
  try { return localStorage.getItem(chave); } catch { return null; }
}

function gravarStorage(chave: string, valor: string | null): void {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, valor);
  } catch { /* armazenamento indisponivel: segue so em memoria */ }
}

function lerUsuario(): UsuarioApi | null {
  const raw = lerStorage(USUARIO_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as UsuarioApi; } catch { return null; }
}

// Decodifica o payload do JWT (so leitura, sem validar assinatura: quem valida e o back).
function decodePayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Transforma o erro HTTP em uma mensagem amigavel para mostrar na tela (RNF10). */
export function mensagemDeErro(err: unknown, padrao = 'Não foi possível concluir. Tente novamente.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Não foi possível conectar ao servidor. Confira se o back-end está rodando.';
    const campos = err.error?.campos;
    if (campos && typeof campos === 'object') {
      const primeiro = Object.values(campos)[0];
      if (typeof primeiro === 'string') return primeiro;
    }
    if (typeof err.error?.message === 'string') return err.error.message;
  }
  return padrao;
}

/** Le ?returnUrl= (so aceita caminhos internos, para evitar redirecionar para outro site). */
export function urlDeRetorno(route: ActivatedRoute, padrao: string): string {
  const u = route.snapshot.queryParamMap.get('returnUrl');
  return u && u.startsWith('/') && !u.startsWith('//') ? u : padrao;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private estado = inject(AppStateService);
  private api = `${environment.apiUrl}/api/auth`;

  readonly token = signal<string | null>(lerStorage(TOKEN_KEY));
  readonly usuario = signal<UsuarioApi | null>(lerUsuario());
  readonly payload = computed(() => {
    const t = this.token();
    return t ? decodePayload(t) : null;
  });
  // Logado = tem token valido e nao expirado (exp vem em segundos).
  readonly isLoggedIn = computed(() => {
    const p = this.payload();
    return !!p && p.exp * 1000 > Date.now();
  });
  readonly role = computed<Perfil | null>(() => (this.isLoggedIn() ? this.payload()!.role : null));

  constructor() {
    // As telas antigas (ainda com dados de demonstracao) chamam logoutClient/logoutAdmin/logoutKitchen
    // do AppStateService. Este gancho faz esses botoes tambem encerrarem a sessao real.
    this.estado.onLogout = () => this.limparSessao();

    // Recarregou a pagina com sessao valida: reconstroi o estado das telas antigas.
    const u = this.usuario();
    if (this.isLoggedIn() && u) this.sincronizarEstado(u);
    else if (this.token()) this.limparSessao(); // token expirado ou corrompido
  }

  login(dados: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/login`, dados).pipe(tap(r => this.iniciarSessao(r)));
  }

  // Cadastro publico: o back cria sempre perfil CLIENTE (RF-039) e ja devolve o token.
  register(dados: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/register`, dados).pipe(tap(r => this.iniciarSessao(r)));
  }

  logout(redirectTo: string = '/'): void {
    this.limparSessao();
    this.router.navigateByUrl(redirectTo);
  }

  /** Apaga token e usuario (sem navegar). */
  limparSessao(): void {
    gravarStorage(TOKEN_KEY, null);
    gravarStorage(USUARIO_KEY, null);
    this.token.set(null);
    this.usuario.set(null);
    this.estado.currentClient.set(null);
    this.estado.cart.set([]);
    this.estado.isAdminLoggedIn.set(false);
    this.estado.isKitchenLoggedIn.set(false);
  }

  hasRole(...roles: Perfil[]): boolean {
    const r = this.role();
    return !!r && roles.includes(r);
  }

  private iniciarSessao(r: LoginResponse): void {
    gravarStorage(TOKEN_KEY, r.token);
    gravarStorage(USUARIO_KEY, JSON.stringify(r.usuario));
    this.token.set(r.token);
    this.usuario.set(r.usuario);
    this.sincronizarEstado(r.usuario);
  }

  // Ponte temporaria: ate as telas de cardapio e pedidos usarem a API (Etapa 3), elas ainda leem
  // o cliente logado do AppStateService.
  private sincronizarEstado(u: UsuarioApi): void {
    if (u.perfil === 'CLIENTE') {
      this.estado.currentClient.set({ id: String(u.id), name: u.nome, email: u.email, phone: '', password: '', favorites: [] });
    }
  }
}
