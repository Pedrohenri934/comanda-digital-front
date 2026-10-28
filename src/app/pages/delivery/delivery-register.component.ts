import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
@Component({ selector:'app-delivery-register', standalone:true, imports:[FormsModule,RouterLink], template:`
<div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-8">
  <div class="relative z-10 w-full max-w-md">
    <button (click)="r.navigateByUrl('/entregador/login')" class="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors text-sm">← Voltar</button>
    @if(success()){
      <div class="text-center">
        <div class="w-16 h-16 bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-700/50">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2 class="text-white text-xl mb-2">Cadastro realizado!</h2>
        <p class="text-neutral-400 mb-6">Aguarde a aprovação do administrador para acessar o painel.</p>
        <a routerLink="/entregador/login" class="bg-amber-800 hover:bg-amber-700 text-white rounded-xl px-6 py-3 transition-colors">Ir para Login</a>
      </div>
    } @else {
      <div class="bg-[#141414] border border-neutral-800 rounded-2xl p-8">
        <div class="flex items-center gap-3 mb-8">
          <div class="p-2 bg-amber-900/40 rounded-xl border border-amber-800/50"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="13" x="1" y="3" rx="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>
          <div><h1 class="text-white text-xl font-semibold">Cadastro de Entregador</h1><p class="text-neutral-500 text-sm">Aguardará aprovação do admin</p></div>
        </div>
        @if(error()){<div class="bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">{{error()}}</div>}
        <div class="space-y-4">
          @for(f of fields; track f.key){
            <div><label class="text-neutral-300 text-sm block mb-2">{{f.label}}</label>
              <input [(ngModel)]="form[f.key]" [type]="f.type" [placeholder]="f.ph" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-700 transition-colors placeholder:text-neutral-600"/></div>
          }
          <div><label class="text-neutral-300 text-sm block mb-2">Tipo de Veículo</label>
            <select [(ngModel)]="form['vehicleType']" class="w-full bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-700 appearance-none">
              <option>Moto</option><option>Carro</option><option>Bicicleta</option>
            </select></div>
          <button (click)="register()" class="w-full bg-amber-800 hover:bg-amber-700 text-white rounded-xl py-3 transition-colors font-semibold">Cadastrar</button>
        </div>
        <p class="text-center text-neutral-500 text-sm mt-6">Já tem conta? <a routerLink="/entregador/login" class="text-amber-400 hover:text-amber-300">Entrar</a></p>
      </div>
    }
  </div>
</div>` })
export class DeliveryRegisterComponent {
  form:Record<string,string>={name:'',email:'',phone:'',cpf:'',vehicleType:'Moto',plate:'',password:''};
  error=signal(''); success=signal(false);
  fields=[{key:'name',label:'Nome completo',type:'text',ph:'Seu nome'},{key:'email',label:'E-mail',type:'email',ph:'seu@email.com'},{key:'phone',label:'Telefone',type:'tel',ph:'(11) 99999-0000'},{key:'cpf',label:'CPF',type:'text',ph:'000.000.000-00'},{key:'plate',label:'Placa',type:'text',ph:'ABC-1234'},{key:'password',label:'Senha',type:'password',ph:'••••••••'}];
  constructor(public r:Router, private s:AppStateService){}
  register(){
    this.error.set('');
    const ok=this.s.registerDeliverer({name:this.form['name'],email:this.form['email'],phone:this.form['phone'],cpf:this.form['cpf'],vehicleType:this.form['vehicleType'],plate:this.form['plate'],password:this.form['password']});
    if(ok)this.success.set(true);else this.error.set('E-mail já cadastrado.');
  }
}
