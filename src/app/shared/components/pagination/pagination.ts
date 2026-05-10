import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
})
export class PaginationComponent {
  currentPage = input<number>(0);
  totalPages = input<number>(0);
  hasNextPage = input<boolean>(false);
  hasPreviousPage = input<boolean>(false);

  onGotToPage = output<number>();

  goToPage(page: number) {
    this.onGotToPage.emit(page);
  }
}
