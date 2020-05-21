import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {OperType} from '../OpenType';

@Component({
  selector: 'app-edit-priority-dialog',
  templateUrl: './edit-priority-dialog.component.html',
  styleUrls: ['./edit-priority-dialog.component.css']
})
export class EditPriorityDialogComponent implements OnInit {
  private dialogTitle: string; // заголовок окна
  private priorityTitle: string;
  private operType: OperType; // тип операции

  constructor(
    private dialogRef: MatDialogRef<EditPriorityDialogComponent>, // для возможности работы с текущим диалог. окном
    @Inject(MAT_DIALOG_DATA) private data: [string, string, OperType], // данные, которые передали в диалоговое окно
    private dialog: MatDialog // для открытия нового диалогового окна (из текущего) - например, для подтверждения удаления
  ) {
  }

  ngOnInit(): void {
    // получаем переданные в диалоговое окно данные
    this.priorityTitle = this.data[0]; // название приоритета для редактирования
    this.dialogTitle = this.data[1]; // текст для диалогового окна
    this.operType = this.data[2]; // тип операции
  }

  // нажали ОК
  private onConfirm(): void {
    this.dialogRef.close(this.priorityTitle);
  }

  // нажали отмену (ничего не сохраняем и закрываем окно)
  private onCancel() {
    this.dialogRef.close(false);
  }

  // нажали Удалить
  private delete() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: 'Подтвердите действие',
        message: `Вы действительно хотите удалить приоритет: "${this.priorityTitle}"? (сами задачи не удаляются)`
      },
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogRef.close('delete'); // нажали удалить
      }
    });
  }

  private canDelete(): boolean {
    return this.operType === OperType.EDIT;
  }

}
