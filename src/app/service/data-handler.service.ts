import {Injectable} from '@angular/core';
import {Task} from '../model/Task';
import {Observable} from 'rxjs';
import {TaskDAOArray} from '../data/dao/impl/TaskDAOArray';
import {Category} from '../model/Category';
import {CategoryDAOArray} from '../data/dao/impl/CategoryDAOArray';
import {Priority} from '../model/Priority';

@Injectable({
  providedIn: 'root'
})
export class DataHandlerService {

  // tasksSubject = new BehaviorSubject<Task[]>(TestData.tasks);
  // categoriesSubject = new BehaviorSubject<Category[]>(TestData.categories);
  private taskDAOArray = new TaskDAOArray();
  private categoryDAOArray = new CategoryDAOArray();

  constructor() {
  }

  // fillTasks() {
  //   this.tasksSubject.next(TestData.tasks);
  // }
  //
  // fillTasksByCategory(category: Category) {
  //   const tasks = TestData.tasks.filter(task => task.category === category);
  //   this.tasksSubject.next(tasks);
  // }

  getAllTasks(): Observable<Task[]> {
    return this.taskDAOArray.getAll();
  }

  getAllCategories(): Observable<Category []> {
    return this.categoryDAOArray.getAll();
  };

  searchTasks(category: Category, searchText: string, status: boolean, priority: Priority): Observable<Task[]> {
    return this.taskDAOArray.search(category, searchText, status, priority);
  }
}
