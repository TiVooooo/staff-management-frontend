import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StaffService } from '../data-access/staff-service';
import { Staff } from '../models/staff';
import { errorMessage } from '../../../core/http/api-result';

@Component({
  selector: 'app-staff-page',
  imports: [FormsModule],
  templateUrl: './staff-page.html',
})
export class StaffPage implements OnInit {
  private service = inject(StaffService);
  private destroyRef = inject(DestroyRef);

  staff = signal<Staff[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  formError = signal('');
  success = signal('');
  formOpen = signal(false);
  term = '';
  editingId: number | null = null;
  fullName = '';
  shortName = '';

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.service
      .getAll(this.term)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (staff) => {
          this.staff.set(staff);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(errorMessage(error));
          this.loading.set(false);
        },
      });
  }

  openForm(staff?: Staff) {
    this.editingId = staff?.id ?? null;
    this.fullName = staff?.fullName ?? '';
    this.shortName = staff?.shortName ?? '';
    this.formError.set('');
    this.success.set('');
    this.formOpen.set(true);
  }

  closeForm() {
    if (!this.saving()) this.formOpen.set(false);
  }

  save() {
    if (this.saving()) return;
    const staff = { fullName: this.fullName.trim(), shortName: this.shortName.trim() };
    if (!staff.fullName || !staff.shortName) {
      this.formError.set('Vui lòng nhập đầy đủ họ tên và tên ngắn.');
      return;
    }
    if (staff.fullName.length > 100 || staff.shortName.length > 50) {
      this.formError.set('Họ tên tối đa 100 ký tự, tên ngắn tối đa 50 ký tự.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    const request =
      this.editingId === null
        ? this.service.create(staff)
        : this.service.update(this.editingId, staff);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.success.set('Đã lưu nhân viên.');
        this.loadStaff();
      },
      error: (error) => {
        this.formError.set(errorMessage(error));
        this.saving.set(false);
      },
    });
  }

  deleteStaff(staff: Staff) {
    if (this.saving() || !window.confirm('Xóa nhân viên "' + staff.fullName + '"?')) return;
    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    this.service
      .delete(staff.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.success.set('Đã xóa nhân viên.');
          this.loadStaff();
        },
        error: (error) => {
          this.error.set(errorMessage(error));
          this.saving.set(false);
        },
      });
  }
}
