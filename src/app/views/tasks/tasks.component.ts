import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DataHandlerService} from '../../service/data-handler.service';
import {Task} from '../../model/Task';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  displayedColumns: string[] = ['color', 'id', 'title', 'date', 'priority', 'category'];
  dataSource: MatTableDataSource<Task>;
  tasks: Task[];
  @Output() updateTask = new EventEmitter<Task>();

  @Input('tasks')
  private set setTasks(tasks: Task[]) {
    this.tasks = tasks;
    this.fillTable();
  }

  @ViewChild(MatPaginator, {static: false}) private paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) private sort: MatSort;

  constructor(private dataHandler: DataHandlerService) {
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

  toggleTaskCompleted(task: Task) {
    task.completed = !task.completed;
  }

  // ngAfterViewInit(): void {
  //   this.addTableObjects();
  // }

  private fillTable() {
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

  private addTableObjects() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private onClickTask(task: Task) {
    this.updateTask.emit(task);
  }


}
