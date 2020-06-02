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
export class CategoriesComponent implements OnInit {

  @Input() selectedCategory: Category;

  @Input('categories')
  set setCategories(categories: Category[]) {
    this.categories = categories;
  }

  @Output() addCategory = new EventEmitter<Category>(); // передаем только название новой категории
  @Output() searchCategory = new EventEmitter<CategorySearchValues>(); // передаем строку для поиска

  @Output() selectCategory = new EventEmitter<Category>();
  @Output() updateCategory = new EventEmitter<Category>();
  @Output() deleteCategory = new EventEmitter<Category>();
  categories: Category[];
  showEditIconCategory: boolean;
  uncompletedCountForCategoryAll: number;
  searchCategoryTitle: string;
  categorySearchValues: CategorySearchValues;
  filterTitle: string;
  filterChanged: boolean;
  indexMouseMove: number; // для отображения иконки редактирования при наведении на категорию

  @Input('categorySearchValues')
  set setCategorySearchValues(categorySearchValues: CategorySearchValues) {
    this.categorySearchValues = categorySearchValues;
  }

  @Input('uncompletedCountForCategoryAll')
  set uncompletedCount(uncompletedCountForCategoryAll: number) {
    this.uncompletedCountForCategoryAll = uncompletedCountForCategoryAll;
  }

  isMobile: boolean;
  isTablet: boolean;

  constructor(
    private dialog: MatDialog, // внедряем MatDialog, чтобы работать с диалоговыми окнами
    private deviceService: DeviceDetectorService // для определения типа устройства
  ) {
    this.isMobile = deviceService.isMobile();
    this.isTablet = deviceService.isTablet();
  }

  ngOnInit(): void {
  }

  showTasksByCategory(category: Category): void {
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

  // сохраняет индекс записи категории, над который в данный момент проходит мышка
  //                 (и там отображается иконка редактирования)
  showEditIcon(show: boolean, index: number) {
    this.indexMouseMove = index;
    this.showEditIconCategory = show;
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

}
