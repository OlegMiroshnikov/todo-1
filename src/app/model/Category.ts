export class Category {
  id: number;
  title: string;
  completedCount: number;
  uncompletedCount: number;

  // ? означает необязательный для передачи параметр
  constructor(id: number, title: string, completedCount?: number, uncompletedCount?: number) {
    this.id = id;
    this.title = title;
    this.completedCount = completedCount;
    this.uncompletedCount = uncompletedCount;
  }
}
