export type DishCategory = 'carnes' | 'acompanhamentos' | 'bebidas' | 'sobremesas' | 'combos';
export interface Dish { id:string; name:string; description:string; price:number; cost:number; category:DishCategory; image:string; active:boolean; promotion?:number; sales:number; }
export type OrderStatus = 'confirmado'|'em_preparo'|'finalizado'|'saiu_entrega'|'entregue';
export interface OrderItem { dishId:string; dishName:string; qty:number; price:number; }
export interface Order { id:string; clientId:string; clientName:string; items:OrderItem[]; address:{street:string;number:string;cep:string;complement?:string;reference?:string}; paymentMethod:string; status:OrderStatus; total:number; createdAt:Date; delivererId?:string; }
export interface Deliverer { id:string; name:string; email:string; phone:string; cpf:string; vehicleType:string; plate:string; password:string; approved:boolean; online:boolean; }
export interface Client { id:string; name:string; email:string; phone:string; password:string; favorites:string[]; }
export interface CartItem { dish:Dish; qty:number; }
export interface WeeklyMenuDay { dishes:string[]; specialDishId?:string; promotions:{dishId:string;discount:number}[]; }
export type WeeklyMenu = {[day:string]:WeeklyMenuDay};
export interface InventoryItem { id:string; name:string; category:'carne'|'vegetal'|'tempero'|'bebida'|'outro'; quantity:number; minQuantity:number; unit:'kg'|'g'|'l'|'ml'|'un'; lastUpdate:string; }
