import {Component, OnInit} from '@angular/core';
import {Category} from './model/Category';
import {DeviceDetectorService} from 'ngx-device-detector';
import {IntroService} from './service/intro.service';
import {CategoryService} from './data/dao/impl/CategoryService';
import {TaskService} from './data/dao/impl/TaskService';
import {CategorySearchValues, TaskSearchValues} from './data/dao/search/SearchObjects';
import {PageEvent} from '@angular/material/paginator';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {Task} from './model/Task';
import {Priority} from './model/Priority';
import {PriorityService} from './data/dao/impl/PriorityService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

// контейнер, который управляет другими presentational компонентами
export class AppComponent implements OnInit {


  // если равно null - по-умолчанию будет выбираться категория 'Все'
  selectedCategory: Category = null;


  // тип устройства
  isMobile: boolean;
  isTablet: boolean;


  showSearch: boolean;  // показать/скрыть поиск


  tasks: Task[]; // текущие задачи для отображения на странице
  categories: Category[]; // категории для отображения
  priorities: Priority[]; // приоритеты для отображения и фильтрации


  // параметры бокового меню с категориями
  menuOpened: boolean; // открыть-закрыть
  menuMode: string; // тип выдвижения (поверх, с толканием и пр.)
  menuPosition: string;
  showBackdrop: boolean;

  readonly defaultPageSize = 5;
  readonly defaultPageNumber = 0;

  uncompletedCountForCategoryAll: number; // для категории Все


  totalTasksFounded: number; // сколько всего задач найдено

  // параметры поисков
  taskSearchValues = new TaskSearchValues();
  categorySearchValues = new CategorySearchValues();


  constructor(
    // сервисы для работы с данными (фасад)
    private taskService: TaskService,
    private categoryService: CategoryService,
    private priorityService: PriorityService,
    private dialog: MatDialog, // работа с диалог. окнами
    private introService: IntroService, // вводная справоч. информация с выделением областей
    private deviceService: DeviceDetectorService // для определения типа устройства (моб., десктоп, планшет)
  ) {


    // определяем тип устройства
    this.isMobile = deviceService.isMobile();
    this.isTablet = deviceService.isTablet();


    this.setMenuDisplayParams(); // параметры отображения меню (зависит от устройства пользователя)

  }


  ngOnInit(): void {


    // для мобильных и планшетов - не показывать интро
    if (!this.isMobile && !this.isTablet) {
      // this.introService.startIntroJS(true); // при первом запуске приложения - показать интро
    }

    // заполнить категории
    this.fillAllCategories().subscribe(res => {
      this.categories = res;

      // первоначальное отображение задач при загрузке приложения
      // запускаем толко после выполнения статистики (т.к. понадобятся ее данные) и загруженных категорий
      this.selectCategory(this.selectedCategory);


    });

    // заполнить приоритеты
    this.fillAllPriorities();


  }

  // заполняет массив приоритетов
  fillAllPriorities() {
    this.priorityService.findAll().subscribe(result => {
      this.priorities = result;
    });
  }


  // заполняет массив категорий
  fillAllCategories(): Observable<Category[]> {
    return this.categoryService.findAll();
  }


  // выбрали/изменили категорию
  selectCategory(category: Category) {


    // сбрасываем, чтобы показывать результат с первой страницы
    this.taskSearchValues.pageNumber = 0;

    this.selectedCategory = category; // запоминаем выбранную категорию

    // для поиска задач по данной категории
    this.taskSearchValues.categoryId = category ? category.id : null;

    // обновить список задач согласно выбранной категории и другим параметрам поиска из taskSearchValues
    this.searchTasks(this.taskSearchValues);

    if (this.isMobile) {
      this.menuOpened = false; // для мобильных - автоматически закрываем боковое меню
    }
  }

  // добавление категории
  addCategory(category: Category) {
    this.categoryService.add(category).subscribe(result => {
        // если вызов сервиса завершился успешно - добавляем новую категорию в локальный массив

        this.searchCategory(this.categorySearchValues);
      }
    );
  }

  // удаление категории
  deleteCategory(category: Category) {
    this.categoryService.delete(category.id).subscribe(cat => {
      this.selectedCategory = null; // выбираем категорию "Все"

      this.searchCategory(this.categorySearchValues);
      this.selectCategory(this.selectedCategory);

    });
  }

  // обновлении категории
  updateCategory(category: Category) {
    this.categoryService.update(category).subscribe(() => {

      this.searchCategory(this.categorySearchValues); // обновляем список категорий
      this.searchTasks(this.taskSearchValues); // обновляем список задач

    });
  }

  // поиск категории
  searchCategory(categorySearchValues: CategorySearchValues) {

    this.categoryService.findCategories(categorySearchValues).subscribe(result => {
      this.categories = result;
    });

  }


  // поиск задач
  searchTasks(searchTaskValues: TaskSearchValues) {
    this.taskSearchValues = searchTaskValues;
    this.taskService.findTasks(this.taskSearchValues).subscribe(result => {

      // Если выбранная страница для отображения больше, чем всего страниц - заново делаем поиск и показываем 1ю страницу.
      // Если пользователь был например на 2й странице общего списка и выполнил новый поиск, в результате которого доступна только 1 страница,
      // то нужно вызвать поиск заново с показом 1й страницы (индекс 0)
      if (result.totalPages > 0 && this.taskSearchValues.pageNumber >= result.totalPages) {
        this.taskSearchValues.pageNumber = 0;
        this.searchTasks(this.taskSearchValues);
      }
      this.totalTasksFounded = result.totalElements; // сколько данных показывать на странице
      this.tasks = result.content; // массив задач
    });
  }


  // добавление задачи
  addTask(task: Task) {


  }


  // удаление задачи
  deleteTask(task: Task) {


  }


  // обновление задачи
  updateTask(task: Task) {


  }

  // показать-скрыть меню
  toggleMenu() {
    this.menuOpened = !this.menuOpened;
  }


  // если закрыли меню любым способом - ставим значение false
  onClosedMenu() {
    this.menuOpened = false;
  }

  // параметры отображения меню (зависит от устройства пользователя)
  setMenuDisplayParams() {
    this.menuPosition = 'left'; // меню слева

    // настройки бокового меню для моб. и десктоп вариантов
    if (this.isMobile) {
      this.menuOpened = false; // на моб. версии по-умолчанию меню будет закрыто
      this.menuMode = 'over'; // поверх всего контента
      this.showBackdrop = true; // если нажали на область вне меню - закрыть его
    } else {
      this.menuOpened = true; // НЕ в моб. версии по-умолчанию меню будет открыто (т.к. хватает места)
      this.menuMode = 'push'; // будет "толкать" основной контент, а не закрывать его
      this.showBackdrop = false;
    }

  }


  // изменили кол-во элементов на странице или перешли на другую страницу
  // с помощью paginator
  paging(pageEvent: PageEvent) {

    // если изменили настройку "кол-во на странице" - заново делаем запрос и показываем с 1й страницы
    if (this.taskSearchValues.pageSize !== pageEvent.pageSize) {
      this.taskSearchValues.pageNumber = 0; // новые данные будем показывать с 1-й страницы (индекс 0)
    } else {
      // если просто перешли на другую страницу
      this.taskSearchValues.pageNumber = pageEvent.pageIndex;
    }

    this.taskSearchValues.pageSize = pageEvent.pageSize;
    this.taskSearchValues.pageNumber = pageEvent.pageIndex;

    this.searchTasks(this.taskSearchValues); // показываем новые данные
  }


  // показать-скрыть поиск

  toggleSearch(showSearch: boolean) {
    this.showSearch = showSearch;

  }


}
