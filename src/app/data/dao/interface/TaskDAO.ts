import {CommonDAO} from './CommonDAO';
import {Task} from 'src/app/model/Task';
import {Priority} from '../../../model/Priority';
import {Category} from '../../../model/Category';
import {Observable} from 'rxjs';

export interface TaskDAO extends CommonDAO<Task> {

  search(category: Category, searchStrin: string, status: boolean, priority: Priority): Observable<Task[]>;
}
