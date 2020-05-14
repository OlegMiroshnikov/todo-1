import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DataHandlerService} from '../../service/data-handler.service';
import {Task} from '../../model/Task';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {EditTaskDialogComponent} from '../../dialog/edit-task-dialog/edit-task-dialog.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  displayedColumns: string[] = ['color', 'id', 'title', 'date', 'priority', 'category'];
  dataSource: MatTableDataSource<Task>;
  tasks: Task[];

  @Input('tasks')
  private set setTasks(tasks: Task[]) {
    this.tasks = tasks;
    this.fillTable();
  }

  @Output() updateTask = new EventEmitter<Task>();
  @ViewChild(MatPaginator, {static: false}) private paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) private sort: MatSort;

  constructor(
    private dataHandler: DataHandlerService,
    private dialog: MatDialog) {
  }

  ngOnInit(): void {
    // this.dataHandler.tasksSubject.subscribe(tasks => this.tasks = tasks);
    // this.dataHandler.getAllTasks().subscribe(tasks => this.tasks = tasks);
    this.dataSource = new MatTableDataSource();
    this.fillTable();
  }

  getPriorityColor(task: Task): string {
    if (task.completed) {
      return '#F8F9FA'; // TODO put colors on a separate list
    }
    if (task.priority && task.priority.color) {
      return task.priority.color;
    }
    return '#fff';  // TODO put colors on a separate list
  }

  toggleTaskCompleted(task: Task): void {
    task.completed = !task.completed;
  }

  // ngAfterViewInit(): void {
  //   this.addTableObjects();
  // }

  // диалоговое редактирования для добавления задачи
  openEditTaskDialog(task: Task): void {
    // открытие диалогового окна
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {data: [task, 'Редактирование задачи'], autoFocus: false});
    dialogRef.afterClosed().subscribe(result => {
      // обработка результатов
    });
  }

  private fillTable(): void {
    if (!this.dataSource) {
      return;
    }
    this.dataSource.data = this.tasks;
    this.addTableObjects();
    // @ts-ignore
    this.dataSource.sortingDataAccessor = (task, colName) => {
      switch (colName) {
        case 'priority': {
          return task.priority ? task.priority.id : null;
        }
        case 'category': {
          return task.category ? task.category.title : null;
        }
        case 'date': {
          return task.date ? task.date : null;
        }
        case 'title': {
          return task.title;
        }
      }
    };
  }

  private addTableObjects(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

}
