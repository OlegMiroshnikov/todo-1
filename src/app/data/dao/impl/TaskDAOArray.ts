import {TaskDAO} from '../interface/TaskDAO';
import {Observable, of} from 'rxjs';
import {Task} from 'src/app/model/Task';
import {Priority} from 'src/app/model/Priority';
import {Category} from '../../../model/Category';
import {TestData} from '../../TestData';

export class TaskDAOArray implements TaskDAO {

  add(task: Task): Observable<Task> {
    // если id пустой - генерируем его
    if (task.id === null || task.id === 0) {
      task.id = this.getLastIdTask();
    }
    TestData.tasks.push(task);
    return of(task);
  }

  // если значение null - параметр не нужно учитывать при поиске
  search(category: Category, searchText: string, status: boolean, priority: Priority): Observable<Task[]> {
    return of(this.searchTasks(category, searchText, status, priority));
  }


  delete(id: number): Observable<Task> {
    const taskTmp = TestData.tasks.find(t => t.id === id); // удаляем по id
    TestData.tasks.splice(TestData.tasks.indexOf(taskTmp), 1);
    return of(taskTmp);
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

  // находит последний id (чтобы потом вставить новую запись с id, увеличенным на 1) - в реальной БД это происходит автоматически
  private getLastIdTask(): number {
    return Math.max.apply(Math, TestData.tasks.map(task => task.id)) + 1;
  }

  private searchTasks(category: Category, searchText: string, status: boolean, priority: Priority): Task[] {
    let allTasks = TestData.tasks;
    if (status != null) {
      allTasks = allTasks.filter(task => task.completed === status);
    }
    if (category != null) {
      allTasks = allTasks.filter(task => task.category === category);
    }
    if (priority != null) {
      allTasks = allTasks.filter(task => task.priority === priority);
    }
    if (searchText != null) {
      allTasks = allTasks.filter(
        task =>
          task.title.toUpperCase().includes(searchText.toUpperCase()) // учитываем текст поиска (если '' - возвращаются все значения)
      );
    }
    return allTasks;
  }

  update(task: Task): Observable<Task> {
    const taskTmp = TestData.tasks.find(t => t.id === task.id); // обновляем по id
    TestData.tasks.splice(TestData.tasks.indexOf(taskTmp), 1, task);
    return of(task);
  }

}
