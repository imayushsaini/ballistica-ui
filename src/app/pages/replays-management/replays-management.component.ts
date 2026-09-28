import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from 'src/app/services/admin.service';

export interface ReplayItem {
  filename: string;
  size_bytes: number;
  size_formatted: string;
  modified_at: string;
  timestamp: number;
}

@Component({
  selector: 'app-replays-management',
  templateUrl: './replays-management.component.html',
  styleUrls: ['./replays-management.component.scss'],
  standalone: false,
})
export class ReplaysManagementComponent implements OnInit {
  replays: ReplayItem[] = [];
  totalReplays = 0;
  totalPages = 1;
  currentPage = 1;
  perPage = 50;
  searchQuery = '';
  sortBy: 'modified' | 'name' | 'size' = 'modified';
  sortOrder: 'asc' | 'desc' = 'desc';
  directory = '';

  isLoading = false;
  selectedReplays = new Set<string>();
  isBatchDeleting = false;
  downloadingFiles: { [filename: string]: boolean } = {};
  deletingFiles: { [filename: string]: boolean } = {};

  searchControl = new FormControl('');

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReplays();
  }

  loadReplays(): void {
    this.isLoading = true;
    this.adminService
      .getReplays(
        this.currentPage,
        this.perPage,
        this.searchQuery,
        this.sortBy,
        this.sortOrder
      )
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.replays = data?.replays || [];
          this.totalReplays = data?.total || 0;
          this.totalPages = data?.total_pages || 1;
          this.directory = data?.directory || '';
          this.selectedReplays.clear();
        },
        error: (err) => {
          this.isLoading = false;
          this.replays = [];
          this.totalReplays = 0;
          this.snackBar.open(
            'Failed to load replays: ' +
              (err?.error?.message || err?.message || 'Server error'),
            'OK',
            { duration: 4000 }
          );
        },
      });
  }

  onSearch(): void {
    this.searchQuery = this.searchControl.value?.trim() || '';
    this.currentPage = 1;
    this.loadReplays();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadReplays();
  }

  onSort(field: 'modified' | 'name' | 'size'): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = field === 'name' ? 'asc' : 'desc';
    }
    this.currentPage = 1;
    this.loadReplays();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.loadReplays();
    }
  }

  onPerPageChange(newPerPage: number): void {
    this.perPage = newPerPage;
    this.currentPage = 1;
    this.loadReplays();
  }

  // ==================== Selection ====================

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.replays.forEach((r) => this.selectedReplays.add(r.filename));
    } else {
      this.selectedReplays.clear();
    }
  }

  toggleSelect(filename: string): void {
    if (this.selectedReplays.has(filename)) {
      this.selectedReplays.delete(filename);
    } else {
      this.selectedReplays.add(filename);
    }
  }

  isSelected(filename: string): boolean {
    return this.selectedReplays.has(filename);
  }

  isAllSelected(): boolean {
    return (
      this.replays.length > 0 &&
      this.replays.every((r) => this.selectedReplays.has(r.filename))
    );
  }

  // ==================== File Actions ====================

  downloadReplay(replay: ReplayItem): void {
    const filename = replay.filename;
    this.downloadingFiles[filename] = true;

    this.adminService.downloadReplay(filename).subscribe({
      next: (blob: Blob) => {
        delete this.downloadingFiles[filename];
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.snackBar.open(`Downloaded "${filename}"`, 'OK', {
          duration: 3000,
        });
      },
      error: (err) => {
        delete this.downloadingFiles[filename];
        this.snackBar.open(
          `Failed to download "${filename}": ` +
            (err?.error?.message || err?.message || 'Download error'),
          'OK',
          { duration: 4000 }
        );
      },
    });
  }

  deleteSingleReplay(replay: ReplayItem): void {
    const filename = replay.filename;
    if (
      !confirm(
        `Are you sure you want to permanently delete recording "${filename}"?`
      )
    ) {
      return;
    }

    this.deletingFiles[filename] = true;
    this.adminService.deleteReplay(filename).subscribe({
      next: () => {
        delete this.deletingFiles[filename];
        this.snackBar.open(`Replay "${filename}" deleted successfully`, 'OK', {
          duration: 3000,
        });
        this.loadReplays();
      },
      error: (err) => {
        delete this.deletingFiles[filename];
        this.snackBar.open(
          `Failed to delete replay: ` +
            (err?.error?.message || err?.message || 'Server error'),
          'OK',
          { duration: 4000 }
        );
      },
    });
  }

  deleteBatch(): void {
    const filenames = Array.from(this.selectedReplays);
    if (filenames.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to permanently delete ${filenames.length} recording(s)?`
      )
    ) {
      return;
    }

    this.isBatchDeleting = true;
    this.adminService.deleteReplaysBatch(filenames).subscribe({
      next: (res) => {
        this.isBatchDeleting = false;
        const count = res?.deleted?.length || filenames.length;
        this.snackBar.open(
          `Successfully deleted ${count} recording(s)`,
          'OK',
          { duration: 3000 }
        );
        this.loadReplays();
      },
      error: (err) => {
        this.isBatchDeleting = false;
        this.snackBar.open(
          'Failed to batch delete replays: ' +
            (err?.error?.message || err?.message || 'Server error'),
          'OK',
          { duration: 4000 }
        );
      },
    });
  }

  getTotalDiskSize(): string {
    const totalBytes = this.replays.reduce(
      (sum, r) => sum + (r.size_bytes || 0),
      0
    );
    if (totalBytes < 1024) return `${totalBytes} B`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    if (totalBytes < 1024 * 1024 * 1024)
      return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}
