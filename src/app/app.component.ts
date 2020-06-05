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
import {Stat} from './model/Stat';
import {DashboardData} from './object/DashboardData';
import {StatService} from './data/dao/impl/StatService';
import {CookiesUtils} from './utils/CookiesUtils';
import {SpinnerService} from './service/spinner.service';

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


  showStat = true;   // показать/скрыть статистику
  showSearch = true;  // показать/скрыть поиск


  tasks: Task[]; // текущие задачи для отображения на странице
  priorities: Priority[]; // приоритеты для отображения
  categories: Category[]; // категории для отображения и фильтрации

  stat: Stat; // данные общей статистики
  dash: DashboardData = new DashboardData(); // данные для дашбоарда


  // параметры бокового меню с категориями
  menuOpened: boolean; // открыть-закрыть
  menuMode: string; // тип выдвижения (поверх, с толканием и пр.)
  menuPosition: string;
  showBackdrop: boolean;

  readonly defaultPageSize = 5;
  readonly defaultPageNumber = 0;

  uncompletedCountForCategoryAll: number; // для категории Все


  totalTasksFounded: number; // сколько всего найдено данных

  // параметры поисков
  taskSearchValues: TaskSearchValues; // экземпляр создаем позже, когда подгрузим данные из cookies
  categorySearchValues = new CategorySearchValues(); // экземпляр можно создать тут же, т.к. не загружаем из cookies

  cookiesUtils = new CookiesUtils(); // утилита для работы с cookies

  spinner: SpinnerService; // индикатор загрузки


  // названия cookies
  readonly cookieTaskSeachValues = 'todo:searchValues'; // для сохранения параметров поиска в формате JSON
  readonly cookieShowStat = 'todo:showStat'; // показывать или нет статистику
  readonly cookieShowSearch = 'todo:showSearch'; // показывать или нет инструменты поиска


  constructor(
    // сервисы для работы с данными (фасад)
    private taskService: TaskService,
    private categoryService: CategoryService,
    private priorityService: PriorityService,
    private statService: StatService,
    private dialog: MatDialog, // работа с диалог. окнами
    private introService: IntroService, // вводная справоч. информация с выделением областей
    private deviceService: DeviceDetectorService, // для определения типа устройства (моб., десктоп, планшет)
    private spinnerService: SpinnerService // индикатор загрузки в центре экрана (при каждом HTTP запросе)
  ) {

    this.spinner = spinnerService;


    // не рекомендуется вкладывать subscribe друг в друга,
    // но чтобы не усложнять код цепочками rxjs - сделал попроще (можете переделать)

    this.statService.getOverallStat().subscribe((result => {     // сначала получаем данные статистики
      this.stat = result;
      this.uncompletedCountForCategoryAll = this.stat.uncompletedTotal;

      // заполнить категории
      this.fillAllCategories().subscribe(res => {
        this.categories = res;


        if (!this.initSearchCookie()) { // загружаем все куки, чтоыб восстановить состояние приложения

          // устанавливаем значения по-умолчанию для этих 2-х обяз. параметров, чтобы запрос в БД отбработал корректно (иначе будет ошибка)
          // остальные параметры могут быть null
          this.taskSearchValues = new TaskSearchValues();
          this.taskSearchValues.pageSize = this.defaultPageSize; // обязательный параметр, не должен быть пустым
          this.taskSearchValues.pageNumber = this.defaultPageNumber; // обязательный параметр, не должен быть пустым
        }

        if (this.isMobile) { // ��� ��������� ������ ������� �� ���������� ����������
          this.showStat = false;
        } else {
          this.initShowStatCookie(); // ��� - ���������� ��� ��� ����� ���������� ������
        }

        this.initShowSearchCookie(); // кук - показывать или нет инструменты поиска

        // первоначальное отображение задач при загрузке приложения
        // запускаем толко после выполнения статистики (т.к. понадобятся ее данные) и загруженных категорий
        this.selectCategory(this.selectedCategory);

      });


    }));


    // определяем тип устройства
    this.isMobile = deviceService.isMobile();
    this.isTablet = deviceService.isTablet();


    this.setMenuDisplayParams(); // параметры отображения меню (зависит от устройства пользователя)

  }


  ngOnInit(): void {


    // заполнить приоритеты
    this.fillAllPriorities();


    // для мобильных и планшетов - не показывать интро
    if (!this.isMobile && !this.isTablet) {
      // this.introService.startIntroJS(true); // при первом запуске приложения - показать интро
    }


  }


  // кук - показать поиск или нет
  initShowSearchCookie() {
    const val = this.cookiesUtils.getCookie(this.cookieShowSearch);
    if (val) { // если кук найден
      this.showSearch = (val === 'true'); // конвертация из string в boolean
    }

  }

  // кук - показать статистику или нет
  initShowStatCookie() {
    if (!this.isMobile) { // если моб. устройство, то не показывать статистику
      const val = this.cookiesUtils.getCookie(this.cookieShowStat);
      if (val) { // если кук найден
        this.showStat = (val === 'true'); // конвертация из string в boolean
      }
    }
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

  // заполнить дэш конкретными значниями
  fillDashData(completedCount: number, uncompletedCount: number) {
    this.dash.completedTotal = completedCount;
    this.dash.uncompletedTotal = uncompletedCount;
  }


  // выбрали/изменили категорию
  selectCategory(category: Category) {

    if (category) { // если это не категория Все - то заполняем дэш данными выбранной категории
      this.fillDashData(category.completedCount, category.uncompletedCount);
    } else {
      this.fillDashData(this.stat.completedTotal, this.stat.uncompletedTotal); // заполняем дэш данными для категории Все
    }

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

  // показать-скрыть статистику

  toggleStat(showStat: boolean) {
    this.showStat = showStat;

    // сохраняем в cookies текущее значение
    this.cookiesUtils.setCookie(this.cookieShowStat, String(showStat));
  }


  // показать-скрыть поиск

  toggleSearch(showSearch: boolean) {
    this.showSearch = showSearch;

    // сохраняем в cookies текущее значение
    this.cookiesUtils.setCookie(this.cookieShowSearch, String(showSearch));
  }

  // поиск задач
  searchTasks(searchTaskValues: TaskSearchValues) {

    this.taskSearchValues = searchTaskValues;

    // сохраняем в cookies текущее значение
    this.cookiesUtils.setCookie(this.cookieTaskSeachValues, JSON.stringify(this.taskSearchValues));

    this.taskService.findTasks(this.taskSearchValues).subscribe(result => {

      // Если выбранная страница для отображения больше, чем всего страниц - заново делаем поиск и показываем 1ю страницу.
      // Если пользователь был например на 2й странице общего списка и выполнил новый поиск, в результате которого доступна только 1 страница,
      // то нужно показать 1ю страницу (индекс 0)
      if (result.totalPages > 0 && this.taskSearchValues.pageNumber >= result.totalPages) {
        this.taskSearchValues.pageNumber = 0;
        this.searchTasks(this.taskSearchValues);
      }

      this.totalTasksFounded = result.totalElements; // сколько данных показывать на странице
      this.tasks = result.content; // массив задач
    });


  }


  // обновить общую статистику и счетчик для категории Все (и показать эти данные в дашборде, если выбрана категория "Все")
  updateOverallCounter() {

    this.statService.getOverallStat().subscribe((res => { // получить из БД актуальные данные
      this.stat = res; // получили данные из БД
      this.uncompletedCountForCategoryAll = this.stat.uncompletedTotal; // для счетчика категории "Все"

      if (!this.selectedCategory) { // если выбрана категория "Все" (selectedCategory === null)
        this.fillDashData(this.stat.completedTotal, this.stat.uncompletedTotal); // заполнить дашборд данными общей статистики
      }

    }));

  }


  // обновить счетчик конкретной категории (и показать эти данные в дашборде, если выбрана эта категория)
  updateCategoryCounter(category: Category) {

    this.categoryService.findById(category.id).subscribe(cat => { // получить из БД актуальные данные

      this.categories[this.getCategoryIndex(category)] = cat; // заменить в локальном массиве

      this.showCategoryDashboard(cat);  // показать дашборд со статистикой категории

    });
  }

  // показать дэшборд с данными статистики из категроии
  showCategoryDashboard(cat: Category) {
    if (this.selectedCategory && this.selectedCategory.id === cat.id) { // если выбрана та категория, где сейчас работаем
      this.fillDashData(cat.completedCount, cat.uncompletedCount); // заполнить дашборд данными статистики из категории
    }
  }


  // добавление задачи
  addTask(task: Task) {

    // более правильно - реализовать код ниже с помощью цепочки rxjs (чтобы выполнялось последовательно и с условиями),
    // но решил сильно не усложнять

    this.taskService.add(task).subscribe(result => {

      if (task.category) { // если в новой задаче была указана категория
        this.updateCategoryCounter(task.category); // обновляем счетчик для указанной категории
      }

      this.updateOverallCounter(); // обновляем всю статистику (в том числе счетчик для категории "Все")

      this.searchTasks(this.taskSearchValues); // обновляем список задач

    });


  }


  // удаление задачи
  deleteTask(task: Task) {

    // более правильно - реализовать код ниже с помощью цепочки rxjs (чтобы выполнялось последовательно и с условиями),
    // но решил сильно не усложнять

    this.taskService.delete(task.id).subscribe(result => {

      if (task.category) { // если в удаленной задаче была указана категория
        this.updateCategoryCounter(task.category); // обновляем счетчик для указанной категории
      }

      this.updateOverallCounter(); // обновляем всю статистику (в том числе счетчик для категории "Все")

      this.searchTasks(this.taskSearchValues); // обновляем список задач

    });


  }


  // обновление задачи
  updateTask(task: Task) {

    // более правильно - реализовать код ниже с помощью цепочки rxjs (чтобы выполнялось последовательно и с условиями),
    // но решил сильно не усложнять

    this.taskService.update(task).subscribe(result => {

      if (task.oldCategory) { // если в изменной задаче старая категория была указана
        this.updateCategoryCounter(task.oldCategory); // обновляем счетчик для старой категории
      }

      if (task.category) { // если в изменной задаче новая категория была указана
        this.updateCategoryCounter(task.category); // обновляем счетчик для новой категории
      }

      this.updateOverallCounter(); // обновляем всю статистику (в том числе счетчик для категории "Все")

      this.searchTasks(this.taskSearchValues); // обновляем список задач

    });


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


  // были ли изменены настройки приложения
  settingsChanged(priorities: Priority[]) {
    // this.fillAllPriorities(); // заново загрузить все категории из БД (чтобы их можно было сразу использовать в задачах)
    this.priorities = priorities; // получаем измененные массив с приоритетами
    this.searchTasks(this.taskSearchValues); // обновить текущие задачи и категории для отображения
  }


  // найти из cookies все параметры поиска, чтобы восстановить все окно
  initSearchCookie(): boolean {

    const cookie = this.cookiesUtils.getCookie(this.cookieTaskSeachValues);


    if (!cookie) {
      return false; // кук не был найден
    }

    const cookieJSON = JSON.parse(cookie);

    if (!cookieJSON) {
      return false; // кук был сохранен не в формате JSON
    }

    // важно тут создавать новый экземпляр, чтобы Change Detector в tasks.component увидел, что ссылка изменилась,
    // и обновил свои данные.
    // сделано для упрощения


    if (!this.taskSearchValues) {
      this.taskSearchValues = new TaskSearchValues();
    }

    // размер страницы
    const tmpPageSize = cookieJSON.pageSize;
    if (tmpPageSize) {
      this.taskSearchValues.pageSize = Number(tmpPageSize); // конвертируем строку в число
    }


    // выбранная категория
    const tmpCategoryId = cookieJSON.categoryId;
    if (tmpCategoryId) {
      this.taskSearchValues.categoryId = Number(tmpCategoryId);
      this.selectedCategory = this.getCategoryFromArray(tmpCategoryId);
    }

    // выбранный приоритет
    const tmpPriorityId = cookieJSON.priorityId;
    if (tmpPriorityId) {
      this.taskSearchValues.priorityId = Number(tmpPriorityId);
    }

    // текст поиска
    const tmpTitle = cookieJSON.title;
    if (tmpTitle) {
      this.taskSearchValues.title = tmpTitle;
    }


    // статус задачи
    const tmpCompleted = cookieJSON.completed;
    if (tmpCompleted) {
      this.taskSearchValues.completed = tmpCompleted;
    }

    // столбец сортировки
    const tmpSortColumn = cookieJSON.sortColumn;
    if (tmpSortColumn) {
      this.taskSearchValues.sortColumn = tmpSortColumn;
    }

    // направление сортировки
    const tmpSortDirection = cookieJSON.sortDirection;
    if (tmpSortDirection) {
      this.taskSearchValues.sortDirection = tmpSortDirection;
    }


    // номер страницы можно не сохранять/восстанавливать
    // также можно не сохранять параметры поиска категорий, чтобы при восстановлении приложения показывались все категории

    return true; // кук был найден и загружен
  }


  // находит индекс элемента (по id) в локальном массиве

  getCategoryFromArray(id: number): Category {
    const tmpCategory = this.categories.find(t => t.id === id);
    return tmpCategory;
  }

  getCategoryIndex(category: Category): number {
    const tmpCategory = this.categories.find(t => t.id === category.id);
    return this.categories.indexOf(tmpCategory);
  }

  getCategoryIndexById(id: number): number {
    const tmpCategory = this.categories.find(t => t.id === id);
    return this.categories.indexOf(tmpCategory);
  }


}


