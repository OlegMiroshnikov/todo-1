import {CommonDAO} from './CommonDAO';
import {Category} from '../../../model/Category';
import {Observable} from 'rxjs';
import {CategorySearchValues} from '../search/SearchObjects';


// специфичные методы для работы с категориями (которые не входят в обычный CRUD)
export interface CategoryDAO extends CommonDAO<Category> {

  // поиск категорий по любым параметрам, указанных в CategorySearchValues
  findCategories(categorySearchValues: CategorySearchValues): Observable<any>;

}
