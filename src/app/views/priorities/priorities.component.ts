import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {OperType} from '../../dialog/OpenType';
import {EditPriorityDialogComponent} from '../../dialog/edit-priority-dialog/edit-priority-dialog.component';
import {Priority} from '../../model/Priority';
import {ConfirmDialogComponent} from '../../dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-priorities',
  templateUrl: './priorities.component.html',
  styleUrls: ['./priorities.component.css']
})
export class PrioritiesComponent implements OnInit {

  static defaultColor = '#fff';

  // ----------------------- входящие параметры ----------------------------
  // удалили
  @Output()
  deletePriority = new EventEmitter<Priority>();


  // ----------------------- исходящие действия----------------------------
  // изменили
  @Output()
  updatePriority = new EventEmitter<Priority>();
  // добавили
  @Output()
  addPriority = new EventEmitter<Priority>();
  @Input()
  private priorities: [Priority];

  // -------------------------------------------------------------------------

  constructor(private dialog: MatDialog // для открытия нового диалогового окна (из текущего))
  ) {
  }

  ngOnInit() {
  }

  delete(priority: Priority): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: 'Подтвердите действие',
        message: `Вы действительно хотите удалить приоритет: "${priority.title}"? (задачам проставится значение 'Без приоритета')`
      },
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletePriority.emit(priority);
      }
    });
  }

  private onEditPriority(priority: Priority) {
    const dialogRef = this.dialog.open(EditPriorityDialogComponent, {
      data:
        [priority.title, 'Редактирование приоритета', OperType.EDIT],
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deletePriority.emit(priority);
        return;
      }
      if (typeof (result) === 'string') { // нажали сохранить
        priority.title = result;
        this.updatePriority.emit(priority); //вызываем внешний обработчик
        return;
      }
    });
  }

  private onAddPriority() {
    const dialogRef = this.dialog.open(EditPriorityDialogComponent, {
      data: ['', 'Добавление приоритета', OperType.ADD],
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newPriority = new Priority(null, result as string, PrioritiesComponent.defaultColor);
        this.addPriority.emit(newPriority);
      }
    });
  }


}
