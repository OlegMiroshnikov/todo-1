import {TaskDAO} from '../interface/TaskDAO';
import {Observable, of} from 'rxjs';
import {Task} from 'src/app/model/Task';
import {Priority} from 'src/app/model/Priority';
import {Category} from '../../../model/Category';
import {TestData} from '../../TestData';

export class TaskDAOArray implements TaskDAO {

  add(T): Observable<Task> {
    return undefined;
  }

  delete(id: number): Observable<Task> {
    return undefined;
  }

  get(id: number): Observable<Task> {
    return undefined;
  }

  getAll(): Observable<Task[]> {
    return of(TestData.tasks);
  }

  getCompletedCountInCategory(category: Category): Observable<number> {
    return undefined;
  }

  getTotalCount(): Observable<number> {
    return undefined;
  }

  getTotalCountInCategory(category: Category): Observable<number> {
    return undefined;
  }

  getUncompletedCountInCategory(category: Category): Observable<number> {
    return undefined;
  }

  // поиск задач по параметрам
  // если значение null - параметр не нужно учитывать при поиске
  search(category: Category, searchText: string, status: boolean, priority: Priority): Observable<Task[]> {
    return of(this.searchTodos(category, searchText, status, priority));
  }

  update(T): Observable<Task> {
    return undefined;
  }

  private searchTodos(category: Category, searchText: string, status: boolean, priority: Priority): Task[] {
    let allTasks = TestData.tasks;
    if (category != null) {
      allTasks = allTasks.filter(task => task.category === category);
    }
    return allTasks; // отфильтрованный массив
  }

}
