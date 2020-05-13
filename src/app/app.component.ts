import {Component} from '@angular/core';
import {Task} from './model/Task';
import {DataHandlerService} from './service/data-handler.service';
import {Category} from './model/Category';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Todo';
  tasks: Task[];
  categories: Category[];
  private selectedCategory: Category;
  private selectedTask: Task;

  constructor(private dataHandler: DataHandlerService) {
  }

  ngOnInit(): void {
    // this.dataHandler.getAllTasks().subscribe(tasks => this.tasks = tasks);
    this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);
    this.onSelectCategory(null);
  }

  private onSelectCategory(category: Category) {
    this.selectedCategory = category;
    this.dataHandler
      .searchTasks(this.selectedCategory, null, null, null)
      .subscribe(tasks => {
        this.tasks = tasks;
      });
  }

  private onSelectTask(task: Task) {
    this.selectedTask = task;

  }

  private onUpdateTask(task: Task) {
    console.log(task);
  }
}

