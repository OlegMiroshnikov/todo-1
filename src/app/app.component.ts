import {Component} from '@angular/core';
import {Task} from './model/Task';
import {DataHandlerService} from './service/data-handler.service';
import {Category} from './model/Category';
import {Priority} from './model/Priority';
import {zip} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Todo';
  private tasks: Task[];
  private categories: Category[];
  private priorities: Priority[];
  private selectedCategory: Category = null;

  // статистика
  private totalTasksCountInCategory: number;
  private completedCountInCategory: number;
  private uncompletedCountInCategory: number;
  private uncompletedTotalTasksCount: number;

  // поиск
  private searchTaskText = ''; // текущее значение для поиска задач
  private searchCategoryText = ''; // текущее значение для поиска категорий
  private statusFilter: boolean; // фильтрация по статусу
  private priorityFilter: Priority; // фильтрация по приоритету

  constructor(private dataHandler: DataHandlerService) {
  }

  ngOnInit(): void {
    this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);
    this.dataHandler.getAllPriorities().subscribe(priorities => this.priorities = priorities);
    this.onSelectCategory(null);
  }

  // выбор категории
  private onSelectCategory(category: Category) {
    this.selectedCategory = category;
    this.updateTasksAndStat();
  }

  // // обновление задачи
  // private onUpdateTask(task: Task) {
  //   this.dataHandler.updateTask(task).subscribe(() => {
  //     this.dataHandler.searchTasks(
  //       this.selectedCategory,
  //       null,
  //       null,
  //       null
  //     ).subscribe(tasks => {
  //       this.tasks = tasks;
  //     });
  //   });
  // }

  // обновление задачи
  private onUpdateTask(task: Task) {
    this.dataHandler.updateTask(task).subscribe(cat => {
      this.updateTasksAndStat();
    });
  }

  // // удаление задачи
  // private onDeleteTask(task: Task) {
  //   this.dataHandler.deleteTask(task.id).subscribe(() => {
  //     this.dataHandler.searchTasks(
  //       this.selectedCategory,
  //       null,
  //       null,
  //       null
  //     ).subscribe(tasks => {
  //       this.tasks = tasks;
  //     });
  //   });
  // }

  // удаление задачи
  private onDeleteTask(task: Task) {
    this.dataHandler.deleteTask(task.id).subscribe(cat => {
      this.updateTasksAndStat();
    });
  }

  // удаление категории
  private onDeleteCategory(category: Category) {
    this.dataHandler.deleteCategory(category.id).subscribe(cat => {
      this.selectedCategory = null; // открываем категорию "Все"
      // this.onSelectCategory(null);
      this.onSearchCategory(this.searchCategoryText);
    });
  }

  // обновлении категории
  private onUpdateCategory(category: Category) {
    this.dataHandler.updateCategory(category).subscribe(() => {
      this.onSearchCategory(this.searchCategoryText);
    });
  }

  // поиск задач
  private onSearchTasks(searchString: string) {
    this.searchTaskText = searchString;
    this.updateTasks();
  }

  // фильтрация задач по статусу (все, решенные, нерешенные)
  private onFilterTasksByStatus(status: boolean) {
    this.statusFilter = status;
    this.updateTasks();
  }

  private onFilterTasksByPriority(priority: Priority) {
    this.priorityFilter = priority;
    this.updateTasks();
  }

  private updateTasks() {
    this.dataHandler.searchTasks(
      this.selectedCategory,
      this.searchTaskText,
      this.statusFilter,
      this.priorityFilter
    ).subscribe((tasks: Task[]) => {
      this.tasks = tasks;
    });
  }

  // добавление задачи
  private onAddTask(task: Task) {
    this.dataHandler.addTask(task).subscribe(result => {
      this.updateTasksAndStat();
    });
  }

  // добавление категории
  private onAddCategory(title: string) {
    this.dataHandler.addCategory(title).subscribe(() =>
      this.updateCategories());
  }

  private updateCategories() {
    this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);
  }

  // поиск категории
  private onSearchCategory(title: string) {
    this.searchCategoryText = title;
    this.dataHandler.searchCategories(title).subscribe(categories => {
      this.categories = categories;
    });
  }

  // показывает задачи с применением всех текущий условий (категория, поиск, фильтры и пр.)
  private updateTasksAndStat() {
    this.updateTasks(); // обновить список задач
    // обновить переменные для статистики
    this.updateStat();
  }

  // обновить статистику
  private updateStat() {
    zip(
      this.dataHandler.getTotalCountInCategory(this.selectedCategory),
      this.dataHandler.getCompletedCountInCategory(this.selectedCategory),
      this.dataHandler.getUncompletedCountInCategory(this.selectedCategory),
      this.dataHandler.getUncompletedTotalCount())

      .subscribe(array => {
        this.totalTasksCountInCategory = array[0];
        this.completedCountInCategory = array[1];
        this.uncompletedCountInCategory = array[2];
        this.uncompletedTotalTasksCount = array[3]; // нужно для категории Все
      });
  }

}

