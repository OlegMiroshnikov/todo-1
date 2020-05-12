import {PriorityDAO} from '../interface/PriorityDAO';
import {Priority} from 'src/app/model/Priority';
import {Observable} from 'rxjs';

export class PriorityDAOArray implements PriorityDAO {

  add(T): Observable<Priority> {
    return undefined;
  }

  delete(id: number): Observable<Priority> {
    return undefined;
  }

  get(id: number): Observable<Priority> {
    return undefined;
  }

  getAll(): Observable<Priority[]> {
    return undefined;
  }

  update(id: number): Observable<Priority> {
    return undefined;
  }

}
