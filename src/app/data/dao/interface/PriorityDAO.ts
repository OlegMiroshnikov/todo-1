import {CommonDAO} from './CommonDAO';
import {Priority} from '../../../model/Priority';
import {PrioritySearchValues} from '../search/SearchObjects';
import {Observable} from 'rxjs';

// специфичные методы для работы приоритетами (которые не входят в обычный CRUD)
export interface PriorityDAO extends CommonDAO<Priority> {

  // поиск приоритетов по любым параметрам, указанных в PrioritySearchValues
  findPriorities(prioritySearchValues: PrioritySearchValues): Observable<any>;

}
