import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {OperType} from '../../../../templates/material-dashboard-master/material-dashboard-master/examples/todo-add-task_h/src/app/dialog/OperType';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category-dialog.component.html',
  styleUrls: ['./edit-category-dialog.component.css']
})
export class EditCategoryDialogComponent implements OnInit {
  dialogTitle: string; // заголовок окна
  categoryTitle: string;
  operType: OperType; // тип операции

  constructor(
    private dialogRef: MatDialogRef<EditCategoryDialogComponent>, // для возможности работы с текущим диалог. окном
    @Inject(MAT_DIALOG_DATA) private data: [string, string, OperType], // данные, которые передали в диалоговое окно
    private dialog: MatDialog // для открытия нового диалогового окна (из текущего) - например, для подтверждения удаления
  ) {
  }

  ngOnInit(): void {
    // получаем переданные в диалоговое окно данные
    this.categoryTitle = this.data[0]; // название категории для редактирования
    this.dialogTitle = this.data[1]; // текст для диалогового окна
    this.operType = this.data[2]; // тип операции
  }

  // нажали ОК
  onConfirm(): void {
    this.dialogRef.close(this.categoryTitle);
  }

  // нажали отмену (ничего не сохраняем и закрываем окно)
  onCancel() {
    this.dialogRef.close(false);
  }

  // нажали Удалить
  delete() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: 'Подтвердите действие',
        message: `Вы действительно хотите удалить категорию: "${this.categoryTitle}"? (сами задачи не удаляются)`
      },
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogRef.close('delete'); // нажали удалить
      }
    });
  }

  canDelete(): boolean {
    return this.operType === OperType.EDIT;
  }

}
