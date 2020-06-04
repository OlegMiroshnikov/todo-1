import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Task} from '../../model/Task';
import {Category} from '../../model/Category';
import {Priority} from '../../model/Priority';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {DeviceDetectorService} from 'ngx-device-detector';
import {DialogAction, DialogResult} from '../../object/DialogResult';

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.css']
})

// редактирование/создание задачи
export class EditTaskDialogComponent implements OnInit {

  // коллекции получаем из главной страницы (через параметры диалог. окна), чтобы здесь заново не делать запрос в БД
  categories: Category[];
  // мобильное ли устройство
  isMobile = this.deviceService.isMobile();
  priorities: Priority[];
  // чтобы изменения не сказывались на самой задаче и можно было отменить изменения
  newTitle: string;

  dialogTitle: string; // заголовок окна
  task: Task; // задача для редактирования/создания

  // сохраняем все значения в отдельные переменные,
  newPriorityId: number;
  newCategoryId: number;
  newDate: Date;
  // какая была до этого категория (нужно для правильного обновления счетчиков)
  oldCategoryId: number;

  // старый id категории тоже сохраняем, чтобы иметь возможность знать,
  canDelete = false; // можно ли удалять объект (активна ли кнопка удаления)
  canComplete = false; // можно ли завершить задачу (зависит от текущего статуса)
  today = new Date(); // сегодняшняя дата

  constructor(
    private dialogRef: MatDialogRef<EditTaskDialogComponent>, // // для возможности работы с текущим диалог. окном
    @Inject(MAT_DIALOG_DATA) private data: [Task, string, Category[], Priority[]], // данные, которые передаем в текущее диалоговое окно
    private dialog: MatDialog, // для открытия нового диалогового окна (из текущего) - например для подтверждения удаления
    private deviceService: DeviceDetectorService // определение устройства пользователя
  ) {
  }

  ngOnInit() {
    this.task = this.data[0]; // задача для редактирования/создания
    this.dialogTitle = this.data[1]; // текст для диалогового окна
    this.categories = this.data[2]; // категории для выпадающего списка
    this.priorities = this.data[3]; // приоритеты для выпадающего списка

    // если было передано значение, значит это редактирование (не создание новой задачи),
    // поэтому делаем удаление возможным (иначе скрываем иконку)
    if (this.task && this.task.id > 0) {
      this.canDelete = true;
      this.canComplete = true;
    }

    // инициализация начальных значений (записывам в отдельные переменные
    // чтобы можно было отменить изменения, а то будут сразу записываться в задачу)

    this.newTitle = this.task.title;

    // чтобы в html странице корректно работали выпадающие списки - лучше работать не с объектами, а с их id
    if (this.task.priority) {
      this.newPriorityId = this.task.priority.id;
    }

    if (this.task.category) {
      this.newCategoryId = this.task.category.id;
      this.oldCategoryId = this.task.category.id; // старое значение категории всегда будет храниться тут
    }

    if (this.task.date) {

      // создаем new Date, чтобы переданная дата из задачи автоматически сконвертировалась в текущий timezone
      // (иначе будет показывать время UTC)
      this.newDate = new Date(this.task.date);
    }


  }

  // нажали ОК
  confirm(): void {

    // считываем все значения для сохранения в поля задачи
    this.task.title = this.newTitle;
    this.task.priority = this.findPriorityById(this.newPriorityId);
    this.task.category = this.findCategoryById(this.newCategoryId);
    this.task.oldCategory = this.findCategoryById(this.oldCategoryId);

    if (!this.newDate) {
      this.task.date = null;
    } else {
      // в поле дата хранится в текущей timezone, в БД дата автоматически сохранится в формате UTC
      this.task.date = this.newDate;
    }


    // передаем добавленную/измененную задачу в обработчик
    // что с ним будут делать - уже на задача этого компонента
    this.dialogRef.close(new DialogResult(DialogAction.SAVE, this.task));

  }

  // нажали отмену (ничего не сохраняем и закрываем окно)
  cancel(): void {
    this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
  }

  // нажали Удалить
  delete() {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: 'Подтвердите действие',
        message: `Вы действительно хотите удалить задачу: "${this.task.title}"?`
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }


      if (result.action === DialogAction.OK) {
        this.dialogRef.close(new DialogResult(DialogAction.DELETE)); // нажали удалить
      }
    });
  }

  // нажали Выполнить (завершить) задачу
  complete() {
    this.dialogRef.close(new DialogResult(DialogAction.COMPLETE));

  }

  // делаем статус задачи "незавершенным" (активируем)
  activate() {
    this.dialogRef.close(new DialogResult(DialogAction.ACTIVATE));
  }

  // установка даты + кол-во дней
  addDays(days: number) {
    this.newDate = new Date();
    this.newDate.setDate(this.today.getDate() + days);
  }

  // установка даты "сегодня"
  setToday() {
    this.newDate = this.today;
  }

  // поиск приоритета по id
  private findPriorityById(tmpPriorityId: number): Priority {
    return this.priorities.find(t => t.id === tmpPriorityId);
  }

  // поиск категории по id
  private findCategoryById(tmpCategoryId: number): Category {
    return this.categories.find(t => t.id === tmpCategoryId);
  }

}
