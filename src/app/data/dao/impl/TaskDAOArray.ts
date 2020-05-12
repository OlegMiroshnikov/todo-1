import {TaskDAO} from '../interface/TaskDAO';
import {Observable} from 'rxjs';
import {Task} from 'src/app/model/Task';
import {Priority} from 'src/app/model/Priority';
import {Category} from '../../../model/Category';

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
    return undefined;
  }

  search(category: Category, searchStrin: string, status: boolean, priority: Priority): Observable<Task[]> {
    return undefined;
  }

  update(id: number): Observable<Task> {
    return undefined;
  }

}
