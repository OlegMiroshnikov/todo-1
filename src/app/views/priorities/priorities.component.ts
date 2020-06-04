import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {EditPriorityDialogComponent} from '../../dialog/edit-priority-dialog/edit-priority-dialog.component';
import {Priority} from '../../model/Priority';
import {ConfirmDialogComponent} from '../../dialog/confirm-dialog/confirm-dialog.component';
import {DialogAction} from '../../object/DialogResult';

@Component({
  selector: 'app-priorities',
  templateUrl: './priorities.component.html',
  styleUrls: ['./priorities.component.css']
})
export class PrioritiesComponent implements OnInit {

  static defaultColor = '#fcfcfc';

  // ----------------------- входящие параметры ----------------------------


  @Input()
  priorities: [Priority];


  // ----------------------- исходящие действия----------------------------

  // удалили
  @Output()
  deletePriority = new EventEmitter<Priority>();

  // изменили
  @Output()
  updatePriority = new EventEmitter<Priority>();

  // добавили
  @Output()
  addPriority = new EventEmitter<Priority>();

  // -------------------------------------------------------------------------


  constructor(private dialog: MatDialog // для открытия нового диалогового окна (из текущего))
  ) {
  }


  ngOnInit() {
  }


  // диалоговое окно для добавления
  openAddDialog() {

    const dialogRef = this.dialog.open(EditPriorityDialogComponent,
      {
        data:
        // передаем новый пустой объект для заполнения
          [new Priority(null, '', PrioritiesComponent.defaultColor),
            'Добавление приоритета'], width: '400px'
      });

    dialogRef.afterClosed().subscribe(result => {

      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }


      if (result.action === DialogAction.SAVE) {
        const newPriority = result.obj as Priority;
        this.addPriority.emit(newPriority);
      }
    });


  }

  // редактирование
  openEditDialog(priority: Priority) {

    const dialogRef = this.dialog.open(EditPriorityDialogComponent, {
      // передаем копию объекта, чтобы все изменения не касались оригинала (чтобы их можно было отменить)
      data: [new Priority(priority.id, priority.title, priority.color), 'Редактирование приоритета']
    });

    dialogRef.afterClosed().subscribe(result => {


      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }

      if (result.action === DialogAction.DELETE) {
        this.deletePriority.emit(priority);
        return;
      }


      if (result.action === DialogAction.SAVE) {
        priority = result.obj as Priority; // получить отредактированный объект
        this.updatePriority.emit(priority);
        return;
      }
    });


  }

  // иконка удаления в общем списке
  openDeleteDialog(priority: Priority) {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: 'Подтвердите действие',
        message: `Вы действительно хотите удалить приоритет: "${priority.title}"? (задачам проставится значение 'Без приоритета')`
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }

      if (result.action === DialogAction.OK) {
        this.deletePriority.emit(priority);
      }
    });
  }
}
