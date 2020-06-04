import {Priority} from './Priority';
import {Category} from './Category';

export class Task {
  id: number;
  title: string;
  completed: number; // вместо boolean, чтобы удобный было записывать в БД
  priority: Priority;
  category: Category;
  date?: Date;

// сюда будет записывать старое значение,
// которое изменили на новое (нужно для правильного обновления счетчиков категорий)
  oldCategory: Category;


  constructor(id: number, title: string, completed: number, priority: Priority, category: Category, oldCategory?: Category, date?: Date) {
    this.id = id;
    this.title = title;
    this.completed = completed;
    this.priority = priority;
    this.category = category;
    this.oldCategory = oldCategory;
    this.date = date;
  }
}
