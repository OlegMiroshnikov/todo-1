import {PriorityDAO} from '../interface/PriorityDAO';
import {Priority} from 'src/app/model/Priority';
import {Observable, of} from 'rxjs';
import {TestData} from '../../TestData';

export class PriorityDAOArray implements PriorityDAO {

  add(priority: Priority): Observable<Priority> {
    if (priority.id === null || priority.id === 0) {
      priority.id = this.getLastIdPriority();
    }
    TestData.priorities.push(priority);
    return of(priority);
  }

  delete(id: number): Observable<Priority> {
    // перед удалением - нужно в задачах занулить все ссылки на удаленное значение
    // в реальной БД сама обновляет все ссылки (cascade update) - здесь нам приходится делать это вручную (т.к. вместо БД - массив)
    TestData.tasks.forEach(task => {
      if (task.priority && task.priority.id === id) {
        task.priority = null;
      }
    });
    const tmpPriority = TestData.priorities.find(t => t.id === id); // удаляем по id
    TestData.priorities.splice(TestData.priorities.indexOf(tmpPriority), 1);
    return of(tmpPriority);
  }

  update(priority: Priority): Observable<Priority> {
    const priorityTmp = TestData.priorities.find(t => t.id === priority.id); // обновляем по id
    TestData.priorities.splice(TestData.priorities.indexOf(priorityTmp), 1, priority);
    return of(priorityTmp);
  }

  get(id: number): Observable<Priority> {
    return undefined;
  }

  getAll(): Observable<Priority[]> {
    return of(TestData.priorities);
  }

   getLastIdPriority(): number {
     return Math.max.apply(Math, TestData.priorities.map(priority => priority.id)) + 1;
   }

}
