import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DataHandlerService} from '../../service/data-handler.service';
import {Category} from '../../model/Category';
import {EditCategoryDialogComponent} from '../../dialog/edit-category-dialog/edit-category-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {OperType} from '../../dialog/OpenType';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  @Input() categories: Category[];
  @Input() selectedCategory: Category;

  @Input() uncompletedTotal: number;  // кол-во невыполненных задач всего
  private selectedCategoryMap: Map<Category, number>; // список всех категорий и кол-во активных задач

  @Output() selectCategory = new EventEmitter<Category>();
  @Output() updateCategory = new EventEmitter<Category>();
  @Output() deleteCategory = new EventEmitter<Category>();
  @Output() addCategory = new EventEmitter<string>(); // передаем только название новой категории
  @Output() searchCategory = new EventEmitter<string>(); // передаем строку для поиска

  // для отображения иконки редактирования при наведении на категорию
  private indexMouseMove: number;
  private searchCategoryTitle: string; // текущее значение для поиска категорий

  @Input('categoryMap') // категории с кол-вом активных задач для каждой из них
  set setCategoryMap(categoryMap: Map<Category, number>) {
    this.selectedCategoryMap = categoryMap;
  }

  constructor(
    private dataHandler: DataHandlerService,
    private dialog: MatDialog // внедряем MatDialog, чтобы работать с диалоговыми окнами
  ) {
  }

  ngOnInit(): void {
  }

  private showTasksByCategory(category: Category): void {
    // если не изменилось значение, ничего не делать (чтобы лишний раз не делать запрос данных)
    if (this.selectedCategory === category) {
      return;
    }
    this.selectedCategory = category; // сохраняем выбранную категорию
    // вызываем внешний обработчик и передаем туда выбранную категорию
    this.selectCategory.emit(this.selectedCategory);
  }

  // сохраняет индекс записи категории, над который в данный момент проходит мышка (и там отображается иконка редактирования)
  private showEditIcon(index: number) {
    this.indexMouseMove = index;

  }

  // диалоговое окно для редактирования категории
  private openEditDialog(category: Category) {
    // открытие диалогового окна
    const dialogRef = this.dialog.open(EditCategoryDialogComponent, {
      data:
        [category.title, 'Редактирование категории', OperType.EDIT],
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') { // нажали удалить
        this.deleteCategory.emit(category); //вызываем внешний обработчик
        return;
      }
      if (typeof (result) === 'string') { // нажали сохранить
        category.title = result;
        this.updateCategory.emit(category); //вызываем внешний обработчик
        return;
      }
    });
  }

  // диалоговое окно для добавления категории
  private openAddCategoryDialog() {
    const dialogRef = this.dialog.open(EditCategoryDialogComponent, {
      data: ['', 'Добавление категории', OperType.ADD],
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addCategory.emit(result as string); // вызываем внешний обработчик
      }
    });
  }

  // поиск категории
  private search() {
    if (this.searchCategoryTitle == null) {
      return;
    }
    this.searchCategory.emit(this.searchCategoryTitle);
  }

}
