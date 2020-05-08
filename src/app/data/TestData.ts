import {Category} from '../model/Category';
import {Priority} from '../model/Priority';
import {Task} from '../model/Task';

export class TestData {
  static categories: Category[] = [
    {id: 1, title: 'Работа'},
    {id: 2, title: 'Отдых'},
    {id: 3, title: 'Еда'}
  ];

  static priorities: Priority[] = [
    {id: 1, title: 'Низкий', color: '#e5e5e5'},
    {id: 2, title: 'Средний', color: '#85D1B2'},
    {id: 3, title: 'Высокий', color: '#F1828D'},
    {id: 4, title: 'Очень срочно', color: '#F1128D'}
  ];

  static tasks: Task[] = [
    {
      id: 1,
      title: 'Залить полный бак',
      completed: false,
      priority: TestData.priorities[1],
      category: TestData.categories[0],
      date: new Date('2020-05-08')
    },
    {
      id: 2,
      title: 'Убрать дом',
      completed: false
    }
  ];

}

