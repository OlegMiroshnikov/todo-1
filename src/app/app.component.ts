import {Component, OnInit} from '@angular/core';
import {Category} from './model/Category';
import {DeviceDetectorService} from 'ngx-device-detector';
import {IntroService} from './service/intro.service';
import {CategoryService} from './data/dao/impl/CategoryService';
import {TaskService} from './data/dao/impl/TaskService';
import {CategorySearchValues, TaskSearchValues} from './data/dao/search/SearchObjects';
import {Task} from '../../lessons/9-frontend-springboot/src/app/model/Task';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})

// компонент-контейнер (Smart, Container), который управляет другими  компонентами (Dumb, Presentational)
export class AppComponent implements OnInit {

  tasks: Task[]; // текущие задачи для отображения на странице
  categories: Category[]; // все категории для отображения на странице

  // статистика
  uncompletedCountForCategoryAll: number;

  // показать/скрыть статистику
  showStat = true;

  // выбранная категория
  selectedCategory: Category = null; // null - значит будет выбрана категория "Все"


  // параметры бокового меню с категориями
  menuOpened: boolean; // открыть-закрыть
  menuMode: string; // тип выдвижения (поверх, с толканием и пр.)
  menuPosition: string; // сторона
  showBackdrop: boolean; // показывать фоновое затемнение или нет

  // тип устройства
  isMobile: boolean;
  isTablet: boolean;

  // параметры поисков
  // экземпляр можно создать тут же, т.к. не загружаем из cookies
  categorySearchValues = new CategorySearchValues();
  taskSearchValues = new TaskSearchValues();

  constructor(
    private categoryService: CategoryService,
    private taskService: TaskService,
    private introService: IntroService, // вводная справоч. информация с выделением областей
    private deviceService: DeviceDetectorService // для определения типа устройства (моб., десктоп, планшет)
  ) {

    // определяем тип запроса
    this.isMobile = deviceService.isMobile();
    this.isTablet = deviceService.isTablet();

    this.showStat = true ? !this.isMobile : false; // если моб. устройство, то по-умолчанию не показывать статистику

    this.setMenuValues(); // установить настройки меню


  }

  ngOnInit() {
    // this.dataHandler.getAllPriorities().subscribe(priorities => this.priorities = priorities);
    // this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);

    // заполнить меню с категориями
    this.fillAllCategories();

    // по-умолчанию показать все задачи (будет выбрана категория Все)
    this.selectCategory(null);

    // для мобильных и планшетов - не показывать интро
    if (!this.isMobile && !this.isTablet) {
      // пробуем показать приветственные справочные материалы
      this.introService.startIntroJS(true);
    }

  }

  // заполняет категории и кол-во невыполненных задач по каждой из них (нужно для отображения категорий)
  fillAllCategories() {
    this.categoryService.findAll().subscribe(result => {
      this.categories = result;
    });
  }

  // добавление категории
  addCategory(category: Category) {
    this.categoryService.add(category).subscribe(result => {
        // если вызов сервиса завершился успешно - добавляем новую категорию в локальный массив
        this.searchCategory(this.categorySearchValues); // обновляем список категорий
      }
    );
  }

  // удаление категории
  deleteCategory(category: Category) {
    this.categoryService.delete(category.id).subscribe(cat => {
      this.searchCategory(this.categorySearchValues); // обновляем список категорий
    });
  }

  // обновлении категории
  updateCategory(category: Category) {
    this.categoryService.update(category).subscribe(() => {
      this.searchCategory(this.categorySearchValues); // обновляем список категорий
    });
  }

  // поиск категории
  searchCategory(categorySearchValues: CategorySearchValues) {
    this.categoryService.findCategories(categorySearchValues).subscribe(result => {
      this.categories = result;
    });
  }

  // выбрали/изменили категорию
  selectCategory(category: Category) {
    this.selectedCategory = category; // запоминаем выбранную категорию
    // для поиска задач по данной категории
    this.taskSearchValues.categoryId = category ? category.id : null;
    // обновить список задач согласно выбранной категории и другим параметрам поиска из taskSearchValues
    this.searchTasks(this.taskSearchValues);
    if (this.isMobile) {
      this.menuOpened = false; // для мобильных - автоматически закрываем боковое меню
    }
  }

  // поиск задач
  searchTasks(searchTaskValues: TaskSearchValues) {
    this.taskSearchValues = searchTaskValues;
    this.taskService.findTasks(this.taskSearchValues).subscribe(result => {
      this.tasks = result.content; // массив задач
      console.log(result);
    });
  }

  // если закрыли меню любым способом - ставим значение false
  onClosedMenu() {
    this.menuOpened = false;
  }

  // параметры меню
  setMenuValues() {
    this.menuPosition = 'left'; // меню слева
    // настройки бокового меню для моб. и десктоп вариантов
    if (this.isMobile) {
      this.menuOpened = false; // на моб. версии по-умолчанию меню будет закрыто
      this.menuMode = 'over'; // поверх всего контента
      this.showBackdrop = true; // показывать темный фон или нет (нужно для мобильной версии)
    } else {
      this.menuOpened = true; // НЕ в моб. версии  по-умолчанию меню будет открыто (т.к. хватает места)
      this.menuMode = 'push'; // будет "толкать" основной контент, а не закрывать его
      this.showBackdrop = false; // показывать темный фон или нет
    }
  }

  // показать-скрыть меню
  toggleMenu() {
    this.menuOpened = !this.menuOpened;
  }

}
