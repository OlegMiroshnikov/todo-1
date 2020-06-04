import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Category} from '../../model/Category';
import {MatDialog} from '@angular/material/dialog';
import {DeviceDetectorService} from 'ngx-device-detector';
import {CategorySearchValues} from '../../data/dao/search/SearchObjects';
import {EditCategoryDialogComponent} from '../../dialog/edit-category-dialog/edit-category-dialog.component';
import {DialogAction} from '../../object/DialogResult';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})

// "presentational component": отображает полученные данные и отправляет какие-либо действия обработчику
// назначение - работа с категориями
// класс не видит dataHandler, т.к. напрямую с ним не должен работать
export class CategoriesComponent implements OnInit {

  // компонент взаимодействует с "внешним миром" только через @Input() и @Output !!!

  // принцип инкпсуляции и "слабой связи"
  // (Low Coupling) из GRASP —
  // General Responsibility Assignment Software Patterns (основные шаблоны распределения обязанностей в программном обеспечении)
  // с помощью @Output() сигнализируем о том, что произошло событие выбора категории (кто будет это обрабатывать - компонент не знает)


  // ----------------------- входящие параметры ----------------------------

  // сеттеры используются для доп. функционала - чтобы при изменении значения вызывать нужные методы
  // а так можно использовать и обычные переменныые

  // выбранная категория для отображения

  // выбрали категорию из списка
  @Output()
  selectCategory = new EventEmitter<Category>();
  // удалили категорию
  @Output()
  deleteCategory = new EventEmitter<Category>();

  @Input('categorySearchValues')
  set setCategorySearchValues(categorySearchValues: CategorySearchValues) {
    this.categorySearchValues = categorySearchValues;
  }

  // изменили категорию
  @Output()
  updateCategory = new EventEmitter<Category>();


  // ----------------------- исходящие действия----------------------------
  // добавили категорию
  @Output()
  addCategory = new EventEmitter<Category>(); // передаем только название новой категории
  // поиск категории
  @Output()
  searchCategory = new EventEmitter<CategorySearchValues>(); // передаем строку для поиска
  selectedCategory; // если равно null - по-умолчанию будет выбираться категория 'Все' - задачи любой категории (и пустой в т.ч.)
  // для отображения иконки редактирования при наведении на категорию
  indexMouseMove: number;
  showEditIconCategory: boolean; // показывать ли иконку редактирования категории

  // -------------------------------------------------------------------------
  isMobile: boolean; // мобильное ли устройство
  categories: Category[]; // категории для отображения
  // параметры поиска категорий
  categorySearchValues: CategorySearchValues;
  // кол-во незавершенных задач для категории Все (для остальных категорий статис-ка подгружаются вместе с самой категорией)
  uncompletedCountForCategoryAll: number;
  filterTitle: string;
  filterChanged: boolean; // были ли изменения в параметре поиска

  constructor(
    private dialog: MatDialog, // внедряем MatDialog, чтобы работать с диалоговыми окнами
    private deviceService: DeviceDetectorService
  ) {
    this.isMobile = deviceService.isMobile();
  }

  @Input('selectedCategory')
  set setCategory(selectedCategory: Category) {
    this.selectedCategory = selectedCategory;
  }

  @Input('categories')
  set setCategories(categories: Category[]) {
    this.categories = categories; // категории для отображения
  }

  // используется для категории Все
  @Input('uncompletedCountForCategoryAll')
  set uncompletedCount(uncompletedCountForCategoryAll: number) {
    this.uncompletedCountForCategoryAll = uncompletedCountForCategoryAll;
  }

  ngOnInit() {
  }


  // поиск категории
  search() {

    this.filterChanged = false; // сбросить

    if (!this.categorySearchValues) { // если объект с параметрами поиска непустой
      return;
    }

    this.categorySearchValues.title = this.filterTitle;
    this.searchCategory.emit(this.categorySearchValues);

  }


  // выбираем категорию для отображения соотв. задач
  showCategory(category: Category) {

    // если не изменилось значение, ничего не делать (чтобы лишний раз не делать запрос данных)
    if (this.selectedCategory === category) {
      return;
    }

    this.selectedCategory = category; // сохраняем выбранную категорию
    this.selectCategory.emit(this.selectedCategory); // вызываем внешний обработчик
  }


  // сохраняет индекс записи категории, над который в данный момент проходит мышка (и там отображается иконка редактирования)
  showEditIcon(show: boolean, index: number) {
    this.indexMouseMove = index;
    this.showEditIconCategory = show;
  }


  clearAndSearch() {
    this.filterTitle = null;
    this.search();
  }

  // проверяет, были ли изменены какие-либо параметры поиска (по сравнению со старым значением)
  checkFilterChanged() {

    this.filterChanged = false;

    if (this.filterTitle !== this.categorySearchValues.title) {
      this.filterChanged = true;
    }

    return this.filterChanged;

  }

  // диалоговое окно для добавления категории
  openAddDialog() {

    const dialogRef = this.dialog.open(EditCategoryDialogComponent, {
      // передаем новый пустой объект для заполнения
      data: [new Category(null, ''), 'Добавление категории'],
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }

      if (result.action === DialogAction.SAVE) {
        this.addCategory.emit(result.obj as Category); // вызываем внешний обработчик
      }
    });
  }


  // диалоговое окно для редактирования категории
  openEditDialog(category: Category) {
    const dialogRef = this.dialog.open(EditCategoryDialogComponent, {
      // передаем копию объекта, чтобы все изменения не касались оригинала (чтобы их можно было отменить)
      data: [new Category(category.id, category.title), 'Редактирование категории'], width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }

      if (result.action === DialogAction.DELETE) { // нажали удалить
        this.deleteCategory.emit(category); // вызываем внешний обработчик
        return;
      }

      if (result.action === DialogAction.SAVE) { // нажали сохранить (обрабатывает как добавление, так и удаление)

        this.updateCategory.emit(result.obj as Category); // вызываем внешний обработчик
        return;
      }
    });
  }
}
