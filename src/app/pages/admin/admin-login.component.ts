import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
@Component({ selector:'app-admin-login', standalone:true, imports:[FormsModule], template:`
<div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
  <div class="fixed inset-0 overflow-hidden pointer-events-none"><div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-900/15 rounded-full blur-3xl"></div></div>
  <div class="relative z-10 w-full max-w-md">
    <button (click)="r.navigateByUrl('/')" class="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors text-sm">← Voltar</button>
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-8">
      <div class="flex items-center gap-3 mb-8">
        <div class="p-2 bg-purple-900/40 rounded-xl border border-purple-800/50"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div><h1 class="text-white text-xl font-semibold">Painel Administrativo</h1><p class="text-neutral-500 text-sm">Acesso restrito</p></div>
      </div>
      @if(error()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">{{error()}}</div>}
      <div class="space-y-4">
        <div><label class="text-neutral-300 text-sm block mb-2">Senha de Administrador</label>
          <div class="relative"><svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input [(ngModel)]="password" type="password" placeholder="••••••••" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl pl-10 pr-4 py-3 outline-none focus:border-purple-700 transition-colors placeholder:text-neutral-600" (keydown.enter)="login()"/></div></div>
        <button (click)="login()" class="w-full bg-purple-800 hover:bg-purple-700 text-white rounded-xl py-3 transition-colors font-semibold">Entrar</button>
      </div>
      <div class="mt-4 p-3 bg-neutral-800/50 rounded-lg text-xs text-neutral-500">Demo: admin123</div>
    </div>
  </div>
</div>` })
export class AdminLoginComponent {
  password=''; error=signal('');
  constructor(public r:Router, private s:AppStateService){}
  login(){if(this.s.loginAdmin(this.password))this.r.navigateByUrl('/admin/dashboard');else this.error.set('Senha incorreta.');}
}
