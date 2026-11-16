import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, mensagemDeErro } from '../../services/auth.service';
@Component({ selector:'app-client-register', standalone:true, imports:[FormsModule,RouterLink], template:`
<div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-8">
  <div class="fixed inset-0 overflow-hidden pointer-events-none"><div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-red-900/15 rounded-full blur-3xl"></div></div>
  <div class="relative z-10 w-full max-w-md">
    <button (click)="r.navigateByUrl('/entrar')" class="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors text-sm">← Voltar</button>
    <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-8">
      <div class="flex items-center gap-3 mb-8">
        <div class="p-2 bg-red-900/40 rounded-xl border border-red-800/50"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></div>
        <div><h1 class="text-white text-xl font-semibold">Criar Conta</h1><p class="text-neutral-500 text-sm">Área do Cliente</p></div>
      </div>
      @if(error()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">{{error()}}</div>}
      <div class="space-y-4">
        @for(f of fields; track f.key){
          <div><label class="text-neutral-300 text-sm block mb-2">{{f.label}}</label>
          <input [(ngModel)]="form[f.key]" [type]="(f.key==='password'||f.key==='confirm')?(showPass?'text':'password'):f.type" [placeholder]="f.ph"
            class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 outline-none focus:border-red-700 transition-colors placeholder:text-neutral-600"/></div>
        }
        <button (click)="register()" [disabled]="loading()" class="w-full bg-red-800 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl py-3 transition-colors mt-2 font-semibold">{{loading()?'Criando conta...':'Criar conta'}}</button>
      </div>
      <p class="text-center text-neutral-500 text-sm mt-6">Já tem conta? <a routerLink="/entrar" class="text-red-400 hover:text-red-300 transition-colors">Entrar</a></p>
    </div>
  </div>
</div>` })
export class ClientRegisterComponent {
  form:Record<string,string>={name:'',email:'',phone:'',address:'',password:'',confirm:''};
  showPass=false; error=signal(''); loading=signal(false);
  fields=[{key:'name',label:'Nome completo',type:'text',ph:'Seu nome completo'},{key:'email',label:'E-mail',type:'email',ph:'seu@email.com'},{key:'phone',label:'Telefone',type:'tel',ph:'(11) 99999-0000'},{key:'address',label:'Endereço de entrega',type:'text',ph:'Rua, número, bairro'},{key:'password',label:'Senha',type:'password',ph:'••••••••'},{key:'confirm',label:'Confirmar senha',type:'password',ph:'••••••••'}];
  constructor(public r:Router, private auth:AuthService){}
  register(){
    this.error.set('');
    const f=this.form;
    if(!f['name'].trim()||!f['email'].trim()||!f['phone'].trim()||!f['address'].trim()){this.error.set('Preencha todos os campos.');return;}
    if(f['password']!==f['confirm']){this.error.set('As senhas não coincidem.');return;}
    if(f['password'].length<6){this.error.set('A senha deve ter pelo menos 6 caracteres.');return;}
    this.loading.set(true);
    this.auth.register({nome:f['name'].trim(),email:f['email'].trim(),senha:f['password'],telefone:f['phone'].trim(),endereco:f['address'].trim()}).subscribe({
      next:()=>{ this.loading.set(false); this.r.navigateByUrl('/cliente/cardapio'); },
      error:e=>{ this.loading.set(false); this.error.set(mensagemDeErro(e,'Não foi possível criar a conta.')); }
    });
  }
}
