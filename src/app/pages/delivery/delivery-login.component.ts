import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
@Component({ selector:'app-delivery-login', standalone:true, imports:[FormsModule,RouterLink], template:`
<div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
  <div class="fixed inset-0 overflow-hidden pointer-events-none"><div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-amber-900/15 rounded-full blur-3xl"></div></div>
  <div class="relative z-10 w-full max-w-md">
    <button (click)="r.navigateByUrl('/')" class="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors text-sm">← Voltar</button>
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-8">
      <div class="flex items-center gap-3 mb-8">
        <div class="p-2 bg-amber-900/40 rounded-xl border border-amber-800/50"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="13" x="1" y="3" rx="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>
        <div><h1 class="text-white text-xl font-semibold">Entrar</h1><p class="text-neutral-500 text-sm">Área do Entregador</p></div>
      </div>
      @if(error()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">{{error()}}</div>}
      <div class="space-y-4">
        <div><label class="text-neutral-300 text-sm block mb-2">E-mail</label>
          <input [(ngModel)]="email" type="email" placeholder="seu@email.com" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-700 transition-colors placeholder:text-neutral-600"/></div>
        <div><label class="text-neutral-300 text-sm block mb-2">Senha</label>
          <input [(ngModel)]="password" type="password" placeholder="••••••••" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-700 transition-colors placeholder:text-neutral-600" (keydown.enter)="login()"/></div>
        <button (click)="login()" class="w-full bg-amber-800 hover:bg-amber-700 text-white rounded-xl py-3 transition-colors font-semibold">Entrar</button>
      </div>
      <p class="text-center text-neutral-500 text-sm mt-6">Não tem conta? <a routerLink="/entregador/cadastro" class="text-amber-400 hover:text-amber-300 transition-colors">Cadastre-se</a></p>
      <div class="mt-4 p-3 bg-neutral-800/50 rounded-lg text-xs text-neutral-500">Demo: carlos&#64;entrega.com / 123456</div>
    </div>
  </div>
</div>` })
export class DeliveryLoginComponent {
  email=''; password=''; error=signal('');
  constructor(public r:Router, private s:AppStateService){}
  login(){
    this.error.set('');
    const d=this.s.deliverers().find(d=>d.email===this.email);
    if(d&&!d.approved){this.error.set('Seu cadastro está aguardando aprovação do administrador.');return;}
    if(this.s.loginDeliverer(this.email,this.password))this.r.navigateByUrl('/entregador/painel');
    else this.error.set('E-mail ou senha inválidos.');
  }
}
