import { Injectable, signal, computed, effect } from '@angular/core';
import { Client, Deliverer, Dish, Order, OrderStatus, CartItem, WeeklyMenu, WeeklyMenuDay } from '../models/models';

const now = new Date();
const mAgo = (m:number) => new Date(now.getTime()-m*60000);

const DISHES:Dish[] = [
  {id:'d1',name:'Picanha na Brasa',description:'Picanha premium grelhada no carvão, servida com alho frito',price:89.90,cost:38,category:'carnes',image:'https://images.unsplash.com/photo-1596995804697-27d11d43652e?w=600&q=80',active:true,sales:320},
  {id:'d2',name:'Costela Bovina',description:'Costela bovina defumada por 12 horas, desfiada na hora',price:79.90,cost:32,category:'carnes',image:'https://images.unsplash.com/photo-1720569594980-0b7a5450d989?w=600&q=80',active:true,sales:210},
  {id:'d3',name:'Filé Mignon Grelhado',description:'Filé mignon grelhado ao ponto, com molho de ervas finas',price:99.90,cost:48,category:'carnes',image:'https://images.unsplash.com/photo-1709433420549-06e96379c2b9?w=600&q=80',active:true,sales:180},
  {id:'d4',name:'Linguiça Toscana',description:'Linguiça toscana artesanal grelhada na brasa com pimenta',price:44.90,cost:16,category:'carnes',image:'https://images.unsplash.com/photo-1703355333430-4c799ed364be?w=600&q=80',active:true,sales:280},
  {id:'d5',name:'Fritas Crocantes',description:'Batata frita crocante com tempero especial da casa',price:24.90,cost:6,category:'acompanhamentos',image:'https://images.unsplash.com/photo-1762922425286-5c3dabdb2d83?w=600&q=80',active:true,sales:450},
  {id:'d6',name:'Purê de Mandioca',description:'Purê cremoso de mandioca com manteiga e ervas',price:19.90,cost:5,category:'acompanhamentos',image:'https://images.unsplash.com/photo-1637194502327-c99c94943680?w=600&q=80',active:true,sales:200},
  {id:'d7',name:'Cerveja Artesanal',description:'Cerveja artesanal gelada, lata 350ml - vários estilos',price:16.90,cost:6,category:'bebidas',image:'https://images.unsplash.com/photo-1766589220911-74584516c516?w=600&q=80',active:true,sales:520},
  {id:'d8',name:'Refrigerante',description:'Refrigerante gelado lata 350ml - cola, laranja ou limão',price:8.90,cost:2.5,category:'bebidas',image:'https://images.unsplash.com/photo-1763297059500-5810c9142d2c?w=600&q=80',active:true,sales:390},
  {id:'d9',name:'Pudim de Leite',description:'Pudim cremoso de leite condensado com calda de caramelo',price:22.90,cost:7,category:'sobremesas',image:'https://images.unsplash.com/photo-1763208384514-9b8531d62ee6?w=600&q=80',active:true,sales:150},
  {id:'d10',name:'Combo Boi Festão',description:'Picanha + Fritas + Bebida + Sobremesa — a escolha do campeão!',price:119.90,cost:52,category:'combos',image:'https://images.unsplash.com/photo-1764408182227-c1232be04e22?w=600&q=80',active:true,sales:260},
  {id:'d11',name:'Combo Família',description:'2 Costelas + 2 Fritas + 2 Refrigerantes — ideal para dividir',price:189.90,cost:80,category:'combos',image:'https://images.unsplash.com/photo-1596995804697-27d11d43652e?w=600&q=80',active:true,sales:90},
  {id:'d12',name:'Coração de Frango',description:'Corações de frango temperados e grelhados no espeto',price:34.90,cost:10,category:'carnes',image:'https://images.unsplash.com/photo-1703355333430-4c799ed364be?w=600&q=80',active:false,sales:30},
];
const CLIENTS:Client[] = [{id:'c1',name:'João Silva',email:'joao@email.com',phone:'11999990000',password:'123456',favorites:['d1','d7']}];
const DELIVERERS:Deliverer[] = [
  {id:'e1',name:'Carlos Moto',email:'carlos@entrega.com',phone:'11988880000',cpf:'123.456.789-00',vehicleType:'Moto',plate:'ABC-1234',password:'123456',approved:true,online:false},
  {id:'e2',name:'Ana Bike',email:'ana@entrega.com',phone:'11977770000',cpf:'987.654.321-00',vehicleType:'Bicicleta',plate:'N/A',password:'123456',approved:false,online:false},
];
const ORDERS:Order[] = [
  {id:'p001',clientId:'c1',clientName:'João Silva',items:[{dishId:'d1',dishName:'Picanha na Brasa',qty:1,price:89.90},{dishId:'d7',dishName:'Cerveja Artesanal',qty:2,price:16.90}],address:{street:'Rua das Flores',number:'42',cep:'01310-100',complement:'Apto 5',reference:'Próx ao mercado'},paymentMethod:'Cartão de Crédito',status:'em_preparo',total:123.70,createdAt:mAgo(15)},
  {id:'p002',clientId:'c1',clientName:'Maria Costa',items:[{dishId:'d10',dishName:'Combo Boi Festão',qty:1,price:119.90}],address:{street:'Av. Paulista',number:'1000',cep:'01310-200'},paymentMethod:'PIX',status:'confirmado',total:119.90,createdAt:mAgo(5)},
  {id:'p003',clientId:'c2',clientName:'Pedro Souza',items:[{dishId:'d3',dishName:'Filé Mignon Grelhado',qty:2,price:99.90},{dishId:'d5',dishName:'Fritas Crocantes',qty:2,price:24.90}],address:{street:'Rua Augusta',number:'200',cep:'01305-000'},paymentMethod:'Dinheiro',status:'finalizado',total:249.60,createdAt:mAgo(30)},
  {id:'p004',clientId:'c3',clientName:'Fernanda Lima',items:[{dishId:'d4',dishName:'Linguiça Toscana',qty:1,price:44.90},{dishId:'d8',dishName:'Refrigerante',qty:1,price:8.90}],address:{street:'Rua Consolação',number:'55',cep:'01302-000'},paymentMethod:'Cartão de Débito',status:'saiu_entrega',total:53.80,createdAt:mAgo(45),delivererId:'e1'},
  {id:'p005',clientId:'c1',clientName:'Ricardo Nunes',items:[{dishId:'d11',dishName:'Combo Família',qty:1,price:189.90}],address:{street:'Alameda Santos',number:'300',cep:'01419-001'},paymentMethod:'PIX',status:'entregue',total:189.90,createdAt:mAgo(120),delivererId:'e1'},
];
const WEEKLY_MENU:WeeklyMenu = {
  'Segunda':{dishes:['d1','d5','d7','d8','d9'],specialDishId:'d1',promotions:[{dishId:'d5',discount:10}]},
  'Terça':{dishes:['d2','d5','d6','d7','d8'],specialDishId:'d2',promotions:[]},
  'Quarta':{dishes:['d3','d5','d7','d8','d9','d10'],specialDishId:'d10',promotions:[{dishId:'d10',discount:15}]},
  'Quinta':{dishes:['d1','d4','d5','d6','d7','d8'],specialDishId:'d4',promotions:[]},
  'Sexta':{dishes:['d1','d2','d5','d7','d8','d9','d10','d11'],specialDishId:'d11',promotions:[{dishId:'d11',discount:10}]},
  'Sábado':{dishes:['d1','d2','d3','d4','d5','d6','d7','d8','d9','d10','d11'],specialDishId:'d3',promotions:[{dishId:'d9',discount:20}]},
  'Domingo':{dishes:['d1','d2','d3','d5','d7','d8','d9','d10'],specialDishId:'d10',promotions:[{dishId:'d10',discount:20}]},
};

// ─── Persistência entre abas ───────────────────────────────────────────────
// Cada chave do localStorage corresponde a um signal "compartilhado" (visível
// para cozinha, entregador, admin e cliente simultaneamente). O evento nativo
// "storage" do navegador dispara em todas as OUTRAS abas sempre que uma aba
// grava no localStorage — é assim que sincronizamos os dados sem backend.
const STORAGE_PREFIX = 'boi-na-brasa:';
const SYNCED_KEYS = ['orders', 'dishes', 'deliverers', 'clients', 'weeklyMenu'] as const;
type SyncedKey = typeof SYNCED_KEYS[number];

function loadFromStorage<T>(key: SyncedKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return reviveDates(parsed) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: SyncedKey, value: unknown) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Armazenamento indisponível (modo privado, quota excedida, etc.) — falha silenciosa.
  }
}

// JSON.parse não reconstrói objetos Date; os pedidos guardam createdAt como Date.
function reviveDates(value: any): any {
  if (Array.isArray(value)) return value.map(reviveDates);
  if (value && typeof value === 'object') {
    if (typeof value.createdAt === 'string') value.createdAt = new Date(value.createdAt);
    for (const k in value) value[k] = reviveDates(value[k]);
  }
  return value;
}

@Injectable({ providedIn: 'root' })
export class AppStateService {
  // Dados compartilhados entre abas — inicializados do localStorage quando disponível,
  // caindo para os dados de demonstração na primeira execução.
  dishes     = signal<Dish[]>(loadFromStorage('dishes', DISHES));
  orders     = signal<Order[]>(loadFromStorage('orders', ORDERS));
  clients    = signal<Client[]>(loadFromStorage('clients', CLIENTS));
  deliverers = signal<Deliverer[]>(loadFromStorage('deliverers', DELIVERERS));
  weeklyMenu = signal<WeeklyMenu>(loadFromStorage('weeklyMenu', WEEKLY_MENU));

  // Dados específicos da aba/sessão atual — não sincronizados (cada usuário tem seu próprio carrinho/login).
  cart = signal<CartItem[]>([]);
  currentClient    = signal<Client | null>(null);
  currentDeliverer = signal<Deliverer | null>(null);
  isAdminLoggedIn  = signal(false);
  isKitchenLoggedIn = signal(false);

  cartCount = computed(() => this.cart().reduce((s,i) => s+i.qty, 0));
  cartTotal = computed(() => this.cart().reduce((s,i) => s+i.dish.price*i.qty, 0));

  constructor() {
    // Sempre que um signal compartilhado mudar NESTA aba, grava no localStorage
    // para que as outras abas recebam o evento "storage" e atualizem.
    effect(() => saveToStorage('dishes', this.dishes()));
    effect(() => saveToStorage('orders', this.orders()));
    effect(() => saveToStorage('clients', this.clients()));
    effect(() => saveToStorage('deliverers', this.deliverers()));
    effect(() => saveToStorage('weeklyMenu', this.weeklyMenu()));

    // Escuta gravações feitas por OUTRAS abas e atualiza o signal correspondente.
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e: StorageEvent) => {
        if (!e.key || !e.key.startsWith(STORAGE_PREFIX)) return;
        const key = e.key.slice(STORAGE_PREFIX.length) as SyncedKey;
        if (!e.newValue) return;
        try {
          const parsed = reviveDates(JSON.parse(e.newValue));
          switch (key) {
            case 'dishes': this.dishes.set(parsed); break;
            case 'orders': this.orders.set(parsed); break;
            case 'clients': this.clients.set(parsed); break;
            case 'deliverers': this.deliverers.set(parsed); break;
            case 'weeklyMenu': this.weeklyMenu.set(parsed); break;
          }
        } catch {
          // Ignora payloads corrompidos vindos de outra aba.
        }
      });
    }
  }

  // ── Client ──────────────────────────────────────────────────────────────
  loginClient(email:string,password:string):boolean { const c=this.clients().find(c=>c.email===email&&c.password===password); if(c){this.currentClient.set(c);return true;} return false; }
  registerClient(data:Omit<Client,'id'|'favorites'>):boolean { if(this.clients().find(c=>c.email===data.email))return false; const nc:Client={...data,id:'c'+Date.now(),favorites:[]}; this.clients.update(cs=>[...cs,nc]); this.currentClient.set(nc); return true; }
  logoutClient() { this.currentClient.set(null); this.cart.set([]); }
  toggleFavorite(dishId:string) { const c=this.currentClient();if(!c)return; const favs=c.favorites.includes(dishId)?c.favorites.filter(f=>f!==dishId):[...c.favorites,dishId]; const u={...c,favorites:favs}; this.currentClient.set(u); this.clients.update(cs=>cs.map(x=>x.id===u.id?u:x)); }
  addToCart(dish:Dish) { this.cart.update(p=>{const ex=p.find(i=>i.dish.id===dish.id); return ex?p.map(i=>i.dish.id===dish.id?{...i,qty:i.qty+1}:i):[...p,{dish,qty:1}];}); }
  removeFromCart(dishId:string) { this.cart.update(p=>p.filter(i=>i.dish.id!==dishId)); }
  updateCartQty(dishId:string,qty:number) { if(qty<=0){this.removeFromCart(dishId);return;} this.cart.update(p=>p.map(i=>i.dish.id===dishId?{...i,qty}:i)); }
  clearCart() { this.cart.set([]); }
  placeOrder(address:Order['address'],paymentMethod:string):Order|null {
    const c=this.currentClient();const cart=this.cart();if(!c||!cart.length)return null;
    const total=cart.reduce((s,i)=>s+i.dish.price*i.qty,0);
    const o:Order={id:'p'+Date.now(),clientId:c.id,clientName:c.name,items:cart.map(i=>({dishId:i.dish.id,dishName:i.dish.name,qty:i.qty,price:i.dish.price})),address,paymentMethod,status:'confirmado',total,createdAt:new Date()};
    this.orders.update(os=>[o,...os]);
    this.dishes.update(ds=>ds.map(d=>{const ci=cart.find(i=>i.dish.id===d.id);return ci?{...d,sales:d.sales+ci.qty}:d;}));
    this.clearCart(); return o;
  }

  // ── Kitchen ─────────────────────────────────────────────────────────────
  loginKitchen(password:string):boolean { if(password==='cozinha123'){this.isKitchenLoggedIn.set(true);return true;} return false; }
  logoutKitchen() { this.isKitchenLoggedIn.set(false); }
  updateOrderStatus(orderId:string,status:OrderStatus) { this.orders.update(os=>os.map(o=>o.id===orderId?{...o,status}:o)); }

  // ── Deliverer ───────────────────────────────────────────────────────────
  loginDeliverer(email:string,password:string):boolean { const d=this.deliverers().find(d=>d.email===email&&d.password===password); if(d?.approved){this.currentDeliverer.set(d);return true;} return false; }
  registerDeliverer(data:Omit<Deliverer,'id'|'approved'|'online'>):boolean { if(this.deliverers().find(d=>d.email===data.email))return false; const nd:Deliverer={...data,id:'e'+Date.now(),approved:false,online:false}; this.deliverers.update(ds=>[...ds,nd]); return true; }
  logoutDeliverer() { this.currentDeliverer.set(null); }
  toggleDelivererOnline() { const d=this.currentDeliverer();if(!d)return; const u={...d,online:!d.online}; this.currentDeliverer.set(u); this.deliverers.update(ds=>ds.map(x=>x.id===u.id?u:x)); }
  acceptDelivery(orderId:string) { const d=this.currentDeliverer();if(!d)return; this.orders.update(os=>os.map(o=>o.id===orderId?{...o,delivererId:d.id,status:'saiu_entrega'}:o)); }
  markDelivered(orderId:string) { this.orders.update(os=>os.map(o=>o.id===orderId?{...o,status:'entregue'}:o)); }

  // ── Admin ───────────────────────────────────────────────────────────────
  loginAdmin(password:string):boolean { if(password==='admin123'){this.isAdminLoggedIn.set(true);return true;} return false; }
  logoutAdmin() { this.isAdminLoggedIn.set(false); }
  addDish(dish:Omit<Dish,'id'|'sales'>) { this.dishes.update(ds=>[...ds,{...dish,id:'d'+Date.now(),sales:0}]); }
  updateDish(id:string,data:Partial<Dish>) { this.dishes.update(ds=>ds.map(d=>d.id===id?{...d,...data}:d)); }
  deleteDish(id:string) { this.dishes.update(ds=>ds.filter(d=>d.id!==id)); }
  approveDeliverer(id:string) { this.deliverers.update(ds=>ds.map(d=>d.id===id?{...d,approved:true}:d)); }
  rejectDeliverer(id:string) { this.deliverers.update(ds=>ds.filter(d=>d.id!==id)); }
  updateWeeklyMenu(day:string,data:WeeklyMenuDay) { this.weeklyMenu.update(m=>({...m,[day]:data})); }

  // ── Utilitário de desenvolvimento ──────────────────────────────────────
  // Restaura os dados de demonstração originais em todas as abas abertas.
  resetDemoData() {
    this.dishes.set(structuredClone(DISHES));
    this.orders.set(structuredClone(ORDERS));
    this.clients.set(structuredClone(CLIENTS));
    this.deliverers.set(structuredClone(DELIVERERS));
    this.weeklyMenu.set(structuredClone(WEEKLY_MENU));
  }
}
