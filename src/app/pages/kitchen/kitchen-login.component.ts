import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
@Component({ selector:'app-kitchen-login', standalone:true, imports:[FormsModule], template:`
<div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
  <div class="fixed inset-0 overflow-hidden pointer-events-none"><div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-orange-900/15 rounded-full blur-3xl"></div></div>
  <div class="relative z-10 w-full max-w-md">
    <button (click)="r.navigateByUrl('/')" class="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors text-sm">← Voltar</button>
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-8">
      <div class="flex items-center gap-3 mb-8">
        <div class="p-2 bg-orange-900/40 rounded-xl border border-orange-800/50"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/></svg></div>
        <div><h1 class="text-white text-xl font-semibold">Área da Cozinha</h1><p class="text-neutral-500 text-sm">Acesso exclusivo</p></div>
      </div>
      @if(error()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">{{error()}}</div>}
      <div class="space-y-4">
        <div><label class="text-neutral-300 text-sm block mb-2">Senha de Acesso</label>
          <div class="relative"><svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input [(ngModel)]="password" type="password" placeholder="••••••••" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-700 transition-colors placeholder:text-neutral-600" (keydown.enter)="login()"/></div></div>
        <button (click)="login()" class="w-full bg-orange-800 hover:bg-orange-700 text-white rounded-xl py-3 transition-colors font-semibold">Entrar</button>
      </div>
      <div class="mt-4 p-3 bg-neutral-800/50 rounded-lg text-xs text-neutral-500">Demo: cozinha123</div>
    </div>
  </div>
</div>` })
export class KitchenLoginComponent {
  password=''; error=signal('');
  constructor(public r:Router, private s:AppStateService){}
  login(){if(this.s.loginKitchen(this.password))this.r.navigateByUrl('/cozinha/painel');else this.error.set('Senha incorreta.');}
}
