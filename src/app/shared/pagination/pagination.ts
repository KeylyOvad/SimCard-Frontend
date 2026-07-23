import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css']
})
export class Pagination implements OnChanges {
  @Input() totalRecords: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() currentPage: number = 1;

  @Output() pageChanged = new EventEmitter<number>();

  totalPages: number = 1;

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateTotalPages();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage) || 1;
  }

  getStartRecord(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndRecord(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalRecords ? this.totalRecords : end;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.pageChanged.emit(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.pageChanged.emit(this.currentPage - 1);
    }
  }

  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.pageChanged.emit(page);
    }
  }

  getVisiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 4) {
        pages.push('...');
      }

      const start = Math.max(2, current - 2);
      const end = Math.min(total - 1, current + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 3) {
        pages.push('...');
      }

      pages.push(total);
    }

    return pages;
  }
}