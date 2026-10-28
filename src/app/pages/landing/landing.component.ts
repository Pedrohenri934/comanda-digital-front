import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({ selector:'app-landing', standalone:true, template:`
<div class="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
  <div class="fixed inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-900/20 rounded-full blur-3xl"></div>
  </div>
  <div class="relative z-10 text-center mb-12">
    <div class="flex items-center justify-center gap-3 mb-4">
      <div class="p-3 bg-red-900/50 rounded-2xl border border-red-700/50">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
      </div>
    </div>
    <h1 class="text-5xl text-white mb-2" style="font-weight:800;letter-spacing:-1px">Boi <span class="text-red-500">Na Brasa</span></h1>
    <p class="text-neutral-400 text-lg">Sistema Integrado de Gestão</p>
  </div>
  <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
    @for (area of areas; track area.path) {
      <button (click)="go(area.path)" class="rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group border bg-gradient-to-br"
        [class]="area.color+' '+area.border+' '+area.hover">
        <div class="flex items-start gap-4">
          <div class="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:bg-white/10 transition-colors" [innerHTML]="area.iconSvg"></div>
          <div><h3 class="text-white mb-1 font-semibold">{{area.label}}</h3><p class="text-neutral-400 text-sm">{{area.desc}}</p></div>
        </div>
      </button>
    }
  </div>
  <p class="relative z-10 text-neutral-600 text-sm mt-10">© 2026 Boi Na Brasa — Todos os direitos reservados</p>
</div>` })
export class LandingComponent {
  constructor(private r: Router){}
  go(path:string){this.r.navigateByUrl(path)}
  areas = [
    {label:'Área do Cliente',desc:'Faça pedidos e acompanhe entregas',path:'/cliente/login',color:'from-red-900/40 to-red-800/20',border:'border-red-800/50',hover:'hover:border-red-600',iconSvg:`<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`},
    {label:'Área da Cozinha',desc:'Gerencie pedidos em tempo real',path:'/cozinha/login',color:'from-orange-900/40 to-orange-800/20',border:'border-orange-800/50',hover:'hover:border-orange-600',iconSvg:`<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/></svg>`},
    {label:'Área do Entregador',desc:'Aceite e gerencie suas entregas',path:'/entregador/login',color:'from-amber-900/40 to-amber-800/20',border:'border-amber-800/50',hover:'hover:border-amber-600',iconSvg:`<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="13" x="1" y="3" rx="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`},
    {label:'Administrador',desc:'Controle total do restaurante',path:'/admin/login',color:'from-purple-900/40 to-purple-800/20',border:'border-purple-800/50',hover:'hover:border-purple-600',iconSvg:`<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`},
  ];
}
