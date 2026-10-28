import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { Dish, DishCategory } from '../../models/models';

const CATS: { key: DishCategory; label: string }[] = [
  { key: 'carnes', label: 'Carnes' },
  { key: 'acompanhamentos', label: 'Acompanhamentos' },
  { key: 'bebidas', label: 'Bebidas' },
  { key: 'sobremesas', label: 'Sobremesas' },
  { key: 'combos', label: 'Combos' },
];

const EMPTY_FORM = {
  name: '', description: '', price: '', cost: '',
  category: 'carnes' as DishCategory, image: '', active: true, promotion: ''
};

@Component({
  selector: 'app-admin-dishes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-dishes.component.html'
})
export class AdminDishesComponent {
  cats = CATS;
  // Pre-built list including "Todos" — avoids spread operator in template
  filterOptions = [{ key: 'todos', label: 'Todos' }, ...CATS] as { key: DishCategory | 'todos'; label: string }[];
  filter: DishCategory | 'todos' = 'todos';
  modalOpen = signal(false);
  editId = signal<string | null>(null);
  form = { ...EMPTY_FORM };

  constructor(public s: AppStateService) {}

  setFilter(key: DishCategory | 'todos') { this.filter = key; }
  toggleActive() { this.form.active = !this.form.active; }

  filtered() {
    return this.filter === 'todos'
      ? this.s.dishes()
      : this.s.dishes().filter(d => d.category === this.filter);
  }

  catLabel(k: string) {
    return CATS.find(c => c.key === k)?.label || k;
  }

  margin(dish: Dish) {
    return ((dish.price - dish.cost) / dish.price * 100).toFixed(1);
  }

  openAdd() {
    this.form = { ...EMPTY_FORM };
    this.editId.set(null);
    this.modalOpen.set(true);
  }

  openEdit(d: Dish) {
    this.form = {
      name: d.name, description: d.description,
      price: String(d.price), cost: String(d.cost),
      category: d.category, image: d.image,
      active: d.active, promotion: String(d.promotion || '')
    };
    this.editId.set(d.id);
    this.modalOpen.set(true);
  }

  autoMargin() {
    if (!this.form.price || !this.form.cost) return null;
    return ((+this.form.price - +this.form.cost) / +this.form.price * 100).toFixed(1);
  }

  save() {
    if (!this.form.name || !this.form.price || !this.form.cost) return;
    const data = {
      name: this.form.name, description: this.form.description,
      price: +this.form.price, cost: +this.form.cost,
      category: this.form.category, image: this.form.image,
      active: this.form.active,
      promotion: this.form.promotion ? +this.form.promotion : undefined
    };
    if (this.editId()) this.s.updateDish(this.editId()!, data);
    else this.s.addDish({ ...data, sales: 0 } as any);
    this.modalOpen.set(false);
  }
}
