import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DataHandlerService} from '../../service/data-handler.service';
import {Task} from '../../model/Task';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {EditTaskDialogComponent} from '../../dialog/edit-task-dialog/edit-task-dialog.component';
import {ConfirmDialogComponent} from '../../dialog/confirm-dialog/confirm-dialog.component';
import {Category} from '../../model/Category';
import {Priority} from '../../model/Priority';
import {OperType} from '../../dialog/OpenType';


@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  displayedColumns: string[] = ['color', 'id', 'title', 'date', 'priority', 'category', 'operations', 'select'];
  dataSource: MatTableDataSource<Task>;
  @Input() selectedCategory: Category;
  @Output() filterByTitle = new EventEmitter<string>();

  @Input('tasks')
  private set setTasks(tasks: Task[]) {
    this.tasks = tasks;
    this.fillTable();
  }

  @Output() filterByStatus = new EventEmitter<boolean>();
  @Output() filterByPriority = new EventEmitter<Priority>();

  @Output() updateTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();
  @Output() selectCategory = new EventEmitter<Category>(); // нажали на категорию из списка задач
  @Output() addTask = new EventEmitter<Task>();
  private tasks: Task[];
  private priorities: Priority[]; // список приоритетов (для фильтрации задач)
  // поиск
  private searchTaskText: string; // текущее значение для поиска задач

  @ViewChild(MatPaginator, {static: false}) private paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) private sort: MatSort;
  private selectedStatusFilter: boolean = null;   // по-умолчанию будут показываться задачи по всем статусам (решенные и нерешенные)
  private selectedPriorityFilter: Priority = null;   // по-умолчанию будут показываться задачи по всем приоритетам

  @Input('priorities')
  set setPriorities(priorities: Priority[]) {
    this.priorities = priorities;
  }

  constructor(
    private dataHandler: DataHandlerService,
    private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();
    this.fillTable();
  }

  // в зависимости от статуса задачи - вернуть цвет названия
  getPriorityColor(task: Task): string {
    if (task.completed) {
      return '#F8F9FA'; // TODO put colors on a separate list
    }
    if (task.priority && task.priority.color) {
      return task.priority.color;
    }
    return '#fff';  // TODO put colors on a separate list
  }

  toggleTaskCompleted(task: Task): void {
    task.completed = !task.completed;
  }

  private fillTable(): void {
    if (!this.dataSource) {
      return;
    }
    this.dataSource.data = this.tasks; // обновить источник данных (т.к. данные массива tasks обновились)
    this.addTableObjects();

    // когда получаем новые данные..
    // чтобы можно было сортировать по столбцам "категория" и "приоритет", т.к. там не примитивные типы, а объекты
    // @ts-ignore - показывает ошибку для типа даты, но так работает, т.к. можно возвращать любой тип
    this.dataSource.sortingDataAccessor = (task, colName) => {
      switch (colName) {
        case 'priority': {
          return task.priority ? task.priority.id : null;
        }
        case 'category': {
          return task.category ? task.category.title : null;
        }
        case 'date': {
          return task.date ? task.date : null;
        }
        case 'title': {
          return task.title;
        }
      }
    };
  }

  private addTableObjects(): void {
    this.dataSource.sort = this.sort; // компонент для сортировки данных (если необходимо)
    this.dataSource.paginator = this.paginator; // обновить компонент постраничности (кол-во записей, страниц)
  }

  // диалоговое окно редактирования задачи
  private openEditTaskDialog(task: Task): void {
    // открытие диалогового окна
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      data:
        [task, 'Редактирование задачи', OperType.EDIT],
      autoFocus: false
    });
    // обработка результатов
    dialogRef.afterClosed().subscribe(result => {
      // завершить задачу
      if (result === 'complete') {
        task.completed = true; // ставим статус задачи как выполненная
        this.updateTask.emit(task);
      }
      // активировать задачу
      if (result === 'activate') {
        task.completed = false; // возвращаем статус задачи как невыполненная
        this.updateTask.emit(task);
        return;
      }
      // если подтвердили удаление задачи
      if (result === 'delete') {
        this.deleteTask.emit(task);
        return;
      }
      // если нажали ОК и есть результат
      if (result as Task) {
        this.updateTask.emit(task);
        return;
      }
    });
  }

  // диалоговое окно подтверждения удаления
  private openDeleteDialog(task: Task) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {dialogTitle: 'Подтвердите действие', message: `Вы действительно хотите удалить задачу: "${task.title}"?`},
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) { // если нажали ОК
        this.deleteTask.emit(task);
      }
    });
  }

  private onToggleStatus(task: Task) {
    task.completed = !task.completed;
    this.updateTask.emit(task);
  }

  private onSelectCategory(category: Category): void {
    this.selectCategory.emit(category);
  }

  // фильтрация по названию
  private onFilterByTitle() {
    this.filterByTitle.emit(this.searchTaskText);
  }

  // фильтрация по статусу
  private onFilterByStatus(value: boolean) {
    // на всякий случай проверяем изменилось ли значение (хотя сам UI компонент должен это делать)
    if (value !== this.selectedStatusFilter) {
      this.selectedStatusFilter = value;
      this.filterByStatus.emit(this.selectedStatusFilter);
    }
  }

  // фильтрация по приоритету
  private onFilterByPriority(value: Priority) {
    // на всякий случай проверяем изменилось ли значение (хотя сам UI компонент должен это делать)
    if (value !== this.selectedPriorityFilter) {
      this.selectedPriorityFilter = value;
      this.filterByPriority.emit(this.selectedPriorityFilter);
    }
  }

  // диалоговое окно для добавления задачи
  private openAddTaskDialog() {
    // то же самое, что и при редактировании, но только передаем пустой объект Task
    const task = new Task(null, '', false, null, this.selectedCategory);
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {data: [task, 'Добавление задачи', OperType.ADD]});
    dialogRef.afterClosed().subscribe(result => {
      if (result) { // если нажали ОК и есть результат
        this.addTask.emit(task);
      }
    });
  }

}
