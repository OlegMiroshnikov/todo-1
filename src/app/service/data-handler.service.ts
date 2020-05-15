import {Injectable} from '@angular/core';
import {Task} from '../model/Task';
import {Observable} from 'rxjs';
import {TaskDAOArray} from '../data/dao/impl/TaskDAOArray';
import {Category} from '../model/Category';
import {CategoryDAOArray} from '../data/dao/impl/CategoryDAOArray';
import {Priority} from '../model/Priority';
import {PriorityDAOArray} from '../data/dao/impl/PriorityDAOArray';

// класс реализовывает методы, которые нужны frontend'у, т.е. для удобной работы представлений
// напоминает паттер Фасад (Facade) - выдает только то, что нужно для функционала
// сервис не реализовывает напрямую интерфейсы DAO, а использует их реализации (в данном случае массивы)
// может использовать не все методы DAO, а только нужные

@Injectable({
  providedIn: 'root'
})
export class DataHandlerService {

  private taskDAOArray = new TaskDAOArray();
  private categoryDAOArray = new CategoryDAOArray();
  private priorityDAOArray = new PriorityDAOArray();

  constructor() {
  }

  getAllTasks(): Observable<Task[]> {
    return this.taskDAOArray.getAll();
  }

  getAllCategories(): Observable<Category []> {
    return this.categoryDAOArray.getAll();
  };

  getAllPriorities(): Observable<Priority[]> {
    return this.priorityDAOArray.getAll();
  }

  updateTask(task: Task): Observable<Task> {
    return this.taskDAOArray.update(task);
  }

  // поиск задач по параметрам
  searchTasks(category: Category, searchText: string, status: boolean, priority: Priority): Observable<Task[]> {
    return this.taskDAOArray.search(category, searchText, status, priority);
  }
}
