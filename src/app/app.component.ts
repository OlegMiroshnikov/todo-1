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

  constructor(private dataHandler: DataHandlerService) {
  }

  ngOnInit(): void {
    this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);
    this.onSelectCategory(null);
  }

  // выбор категории
  private onSelectCategory(category: Category) {
    this.selectedCategory = category;
    this.dataHandler
      .searchTasks(this.selectedCategory, null, null, null)
      .subscribe(tasks => {
        this.tasks = tasks;
      });
  }

  // обновление задачи
  private onUpdateTask(task: Task) {
    this.dataHandler.updateTask(task).subscribe(() => {
      this.dataHandler.searchTasks(
        this.selectedCategory,
        null,
        null,
        null
      ).subscribe(tasks => {
        this.tasks = tasks;
      });
    });

  }

}

