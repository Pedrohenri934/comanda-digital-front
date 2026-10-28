import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { JwtPayload, LoginRequest, LoginResponse, Perfil, RegisterRequest } from '../models/auth.models';

const TOKEN_KEY = 'comanda-digital:token';

function readToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

// Decodifica o payload do JWT (só leitura, sem validar assinatura: quem valida é o back).
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = `${environment.apiUrl}/api/auth`;

  readonly token = signal<string | null>(readToken());
  readonly payload = computed(() => {
    const t = this.token();
    return t ? decodePayload(t) : null;
  });
  // Logado = tem token válido e não expirado (exp vem em segundos).
  readonly isLoggedIn = computed(() => {
    const p = this.payload();
    return !!p && p.exp * 1000 > Date.now();
  });
  readonly role = computed<Perfil | null>(() => (this.isLoggedIn() ? this.payload()!.role : null));

  login(dados: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/login`, dados).pipe(tap(r => this.setToken(r.token)));
  }

  // Cadastro público: o back cria sempre perfil CLIENTE (RN/RF-039).
  register(dados: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.api}/register`, dados);
  }

  logout(redirectTo: string = '/'): void {
    this.setToken(null);
    this.router.navigateByUrl(redirectTo);
  }

  hasRole(...roles: Perfil[]): boolean {
    const r = this.role();
    return !!r && roles.includes(r);
  }

  private setToken(token: string | null): void {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch { /* armazenamento indisponível: segue só em memória */ }
    this.token.set(token);
  }
}
