import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
@Component({ selector:'app-client-login', standalone:true, imports:[FormsModule,RouterLink], template:`
<div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
  <div class="fixed inset-0 overflow-hidden pointer-events-none"><div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-red-900/15 rounded-full blur-3xl"></div></div>
  <div class="relative z-10 w-full max-w-md">
    <button (click)="r.navigateByUrl('/')" class="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors text-sm">← Voltar</button>
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-8">
      <div class="flex items-center gap-3 mb-8">
        <div class="p-2 bg-red-900/40 rounded-xl border border-red-800/50"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></div>
        <div><h1 class="text-white text-xl font-semibold">Entrar</h1><p class="text-neutral-500 text-sm">Área do Cliente</p></div>
      </div>
      @if(error()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">{{error()}}</div>}
      <div class="space-y-4">
        <div><label class="text-neutral-300 text-sm block mb-2">E-mail</label>
          <div class="relative"><svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <input [(ngModel)]="email" type="email" placeholder="seu@email.com" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl pl-10 pr-4 py-3 outline-none focus:border-red-700 transition-colors placeholder:text-neutral-600" (keydown.enter)="login()"/></div></div>
        <div><label class="text-neutral-300 text-sm block mb-2">Senha</label>
          <div class="relative"><svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input [(ngModel)]="password" [type]="showPass?'text':'password'" placeholder="••••••••" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl pl-10 pr-12 py-3 outline-none focus:border-red-700 transition-colors placeholder:text-neutral-600" (keydown.enter)="login()"/>
          <button type="button" (click)="togglePass()" class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors text-sm">{{showPass?'👁':'👁‍🗨'}}</button></div></div>
        <button (click)="login()" class="w-full bg-red-800 hover:bg-red-700 text-white rounded-xl py-3 transition-colors mt-2 font-semibold">Entrar</button>
      </div>
      <p class="text-center text-neutral-500 text-sm mt-6">Não tem conta? <a routerLink="/cliente/cadastro" class="text-red-400 hover:text-red-300 transition-colors">Cadastre-se</a></p>
      <div class="mt-4 p-3 bg-neutral-800/50 rounded-lg text-xs text-neutral-500">Demo: joao&#64;email.com / 123456</div>
    </div>
  </div>
</div>` })
export class ClientLoginComponent {
  email=''; password=''; showPass=false; error=signal('');
  constructor(public r:Router, private s:AppStateService){}
  login(){ this.error.set(''); if(this.s.loginClient(this.email,this.password))this.r.navigateByUrl('/cliente/cardapio'); else this.error.set('E-mail ou senha inválidos.'); }
  togglePass() { this.showPass = !this.showPass; }
}
