import {Component} from '@angular/core';
import {Task} from './model/Task';
import {DataHandlerService} from './service/data-handler.service';
import {Category} from './model/Category';
import {Priority} from './model/Priority';
import {zip} from 'rxjs';
import {concatMap, map} from 'rxjs/operators';
import {IntroService} from './service/intro.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

// компонент-контейнер (Smart, Container), который управляет другими  компонентами (Dumb, Presentational)
export class AppComponent {

  // коллекция категорий с кол-вом незавершенных задач для каждой из них
  private categoryMap = new Map<Category, number>();

  private tasks: Task[];          // все задачи
  private categories: Category[]; // все категории
  private priorities: Priority[]; // все приоритеты

  // выбранная категория
  private selectedCategory: Category = null; // null - значит будет выбрана категория "Все"

  // статистика
  private totalTasksCountInCategory: number;
  private completedCountInCategory: number;
  private uncompletedCountInCategory: number;
  private uncompletedTotalTasksCount: number;

  // показать/скрыть статистику
  private showStat = true;

  // поиск
  private searchTaskText = ''; // текущее значение для поиска задач
  private searchCategoryText = ''; // текущее значение для поиска категорий

  // фильтрация
  private priorityFilter: Priority;
  private statusFilter: boolean;

  // параметры бокового меню с категориями
  private menuOpened: boolean; // открыть-закрыть
  private menuMode: string; // тип выдвижения (поверх, с толканием и пр.)
  private menuPosition: string; // сторона
  private showBackdrop: boolean; // показывать фоновое затемнение или нет

  constructor(
    private dataHandler: DataHandlerService, // Фасад для работы с данными
    private introService: IntroService // вводная справоч. информация с выделением областей
  ) {
    this.setMenuValues(); // установить настройки меню
  }

  ngOnInit(): void {
    this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);
    this.dataHandler.getAllPriorities().subscribe(priorities => this.priorities = priorities);
    this.fillCategories();     // заполнить меню с категориями
    this.onSelectCategory(null);
    this.introService.startIntroJS(true);
  }

  // private fillCategories(): void {
  //     this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);
  // }

  // заполняет категории и кол-во невыполненных задач по каждой из них (нужно для отображения категорий)
  private fillCategories() {
    if (this.categoryMap) {
      this.categoryMap.clear();
    }
    this.categories = this.categories.sort((a, b) => a.title.localeCompare(b.title));
    // для каждой категории посчитать кол-во невыполненных задач
    this.categories.forEach(cat => {
      this.dataHandler.getUncompletedCountInCategory(cat).subscribe(count => this.categoryMap.set(cat, count));
    });
  }

  // добавление категории
  private onAddCategory(title: string): void {
    this.dataHandler.addCategory(title).subscribe(() => this.fillCategories());
  }

  // // удаление категории
  // private onDeleteCategory(category: Category) {
  //   this.dataHandler.deleteCategory(category.id).subscribe(cat => {
  //     this.selectedCategory = null; // открываем категорию "Все"
  //     this.onSearchCategory(this.searchCategoryText);
  //   });
  // }

  // удаление категории
  private onDeleteCategory(category: Category) {
    this.dataHandler.deleteCategory(category.id).subscribe(cat => {
      this.selectedCategory = null; // открываем категорию "Все"
      this.categoryMap.delete(cat); // не забыть удалить категорию из карты
      this.onSearchCategory(this.searchCategoryText);
      this.updateTasks();
    });
  }

  // обновлении категории
  private onUpdateCategory(category: Category) {
    this.dataHandler.updateCategory(category).subscribe(() => {
      this.onSearchCategory(this.searchCategoryText);
    });
  }

  // // обновление задачи
  // private onUpdateTask(task: Task) {
  //   this.dataHandler.updateTask(task).subscribe(cat => {
  //     this.updateTasksAndStat();
  //   });
  // }

  // обновление задачи
  private onUpdateTask(task: Task): void {
    this.dataHandler.updateTask(task).subscribe(() => {
      this.fillCategories();
      this.updateTasksAndStat();
    });
  }

  // // удаление задачи
  // private onDeleteTask(task: Task) {
  //   this.dataHandler.deleteTask(task.id).subscribe(cat => {
  //     this.updateTasksAndStat();
  //   });
  // }

  // удаление задачи
  private onDeleteTask(task: Task) {
    this.dataHandler.deleteTask(task.id).pipe(
      concatMap(task => {
          return this.dataHandler.getUncompletedCountInCategory(task.category)
            .pipe(map(count => {
              return ({t: task, count});
            }));
        }
      )).subscribe(result => {
      const t = result.t as Task;
      // если указана категория - обновляем счетчик для соотв. категории
      // чтобы не обновлять весь список - обновим точечно
      if (t.category) {
        this.categoryMap.set(t.category, result.count);
      }
      this.updateTasksAndStat();
    });
  }

  // // добавление задачи
  // private onAddTask(task: Task) {
  //   this.dataHandler.addTask(task).subscribe(result => {
  //     this.updateTasksAndStat();
  //   });
  // }

  // добавление задачи
  private onAddTask(task: Task) {
    this.dataHandler.addTask(task).pipe(// сначала добавляем задачу
      concatMap(task => { // используем добавленный task (concatMap - для последовательного выполнения)
          // .. и считаем кол-во задач в категории с учетом добавленной задачи
          return this.dataHandler.getUncompletedCountInCategory(task.category).pipe(map(count => {
            return ({t: task, count}); // в итоге получаем массив с добавленной задачей и кол-вом задач для категории
          }));
        }
      )).subscribe(result => {
      const t = result.t as Task;

      // если указана категория - обновляем счетчик для соотв. категории
      if (t.category) {
        this.categoryMap.set(t.category, result.count);
      }
      this.updateTasksAndStat();
    });
  }

  // выбор категории
  private onSelectCategory(category: Category) {
    this.selectedCategory = category;
    this.updateTasksAndStat();
  }

  // поиск категории
  private onSearchCategory(title: string) {
    this.searchCategoryText = title;
    this.dataHandler.searchCategories(title).subscribe(categories => {
      this.categories = categories;
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

  // фильтрация задач по приоритетам
  private onFilterTasksByPriority(priority: Priority) {
    this.priorityFilter = priority;
    this.updateTasks();
  }

  // изменение списка задач
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

  // показать-скрыть статистику
  private toggleStat(showStat: boolean) {
    this.showStat = showStat;
  }

  // если закрыли меню любым способом - ставим значение false
  private onClosedMenu() {
    this.menuOpened = false;
  }

  // параметры меню
  private setMenuValues() {
    this.menuPosition = 'left'; // расположение слева
    this.menuOpened = true; // меню сразу будет открыто по-умолчанию
    this.menuMode = 'push'; // будет "толкать" основной контент, а не закрывать его
    this.showBackdrop = false; // показывать темный фон или нет (нужно больше для мобильной версии)
  }

  // показать-скрыть меню
  private toggleMenu() {
    this.menuOpened = !this.menuOpened;
  }

}

