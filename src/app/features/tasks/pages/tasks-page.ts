import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Gantt, GanttStatic } from 'dhtmlx-gantt';
import { TaskService } from '../data-access/task-service';
import { Task } from '../models/task';
import { errorMessage } from '../../../core/http/api-result';

@Component({
  selector: 'app-tasks-page',
  imports: [FormsModule],
  templateUrl: './tasks-page.html',
  styleUrl: './tasks-page.scss',
})
export class TasksPage implements AfterViewInit, OnDestroy {
  @ViewChild('ganttContainer') container!: ElementRef<HTMLDivElement>;
  private service = inject(TaskService);
  private destroyRef = inject(DestroyRef);
  private gantt: GanttStatic | null = null;

  term = '';
  loading = signal(false);
  error = signal('');
  success = signal('');
  count = signal(0);
  parentTasks = signal<Task[]>([]);
  formOpen = signal(false);
  saving = signal(false);
  formError = signal('');
  editingId: number | null = null;
  idparent: number | null = null;
  label = '';
  type = 'task';
  name = '';
  startDate = '';
  endDate = '';
  duration: number | null = null;
  progress = 0;
  isUnscheduled = false;
  private selectedEvent = '';

  ngAfterViewInit() {
    this.gantt = Gantt.getGanttInstance();
    this.gantt.config.readonly = true;
    this.gantt.config.show_unscheduled = true;
    this.gantt.config.duration_unit = 'day';
    this.gantt.config.grid_width = 430;
    this.gantt.config.scales = [
      { unit: 'month', step: 1, format: '%m/%Y' },
      { unit: 'day', step: 1, format: '%d' },
    ];
    this.gantt.config.columns = [
      {
        name: 'text',
        label: 'Công việc',
        tree: true,
        width: 220,
        template: (task) => this.escapeText(task.text),
      },
      { name: 'start_date', label: 'Bắt đầu', align: 'center', width: 110 },
      {
        name: 'progress',
        label: 'Tiến độ',
        align: 'center',
        width: 90,
        template: (task) => Math.round((task.progress ?? 0) * 100) + '%',
      },
    ];
    this.gantt.templates.task_text = (_start, _end, task) => this.escapeText(task.text);
    this.gantt.templates.task_unscheduled_time = () => 'Chưa lên lịch';
    this.gantt.init(this.container.nativeElement);
    this.selectedEvent = this.gantt.attachEvent('onTaskSelected', (id) =>
      this.selectTask(Number(id)),
    );
    this.loadTasks();
    this.loadParentTasks();
  }

  loadParentTasks() {
    this.service
      .getAll('')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tasks) => this.parentTasks.set(tasks),
        error: (error) => this.error.set(errorMessage(error)),
      });
  }

  openCreateForm() {
    this.editingId = null;
    this.idparent = null;
    this.label = '';
    this.type = 'task';
    this.name = '';
    this.startDate = '';
    this.endDate = '';
    this.duration = null;
    this.progress = 0;
    this.isUnscheduled = false;
    this.formError.set('');
    this.success.set('');
    this.formOpen.set(true);
  }

  selectTask(id: number) {
    if (this.saving()) return;
    this.formError.set('');
    this.success.set('');
    this.service
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => this.openEditForm(task),
        error: (error) => this.error.set(errorMessage(error)),
      });
  }

  private openEditForm(task: Task) {
    this.editingId = task.id;
    this.idparent = task.idparent;
    this.label = task.label;
    this.type = task.type;
    this.name = task.name;
    this.startDate = task.startDate?.slice(0, 10) ?? '';
    this.endDate = task.endDate?.slice(0, 10) ?? '';
    this.duration = task.duration;
    this.progress = task.progress;
    this.isUnscheduled = task.isUnscheduled;
    this.formOpen.set(true);
  }

  closeForm() {
    if (!this.saving()) this.formOpen.set(false);
  }

  save() {
    if (this.saving()) return;
    if (!this.label.trim() || !this.name.trim()) {
      this.formError.set('Vui lòng nhập label và tên task.');
      return;
    }
    if (this.progress < 0 || this.progress > 100) {
      this.formError.set('Tiến độ phải từ 0 đến 100.');
      return;
    }
    const task = {
      idparent: this.idparent || null,
      label: this.label.trim(),
      type: this.type,
      name: this.name.trim(),
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      duration: this.duration,
      progress: Number(this.progress),
      isUnscheduled: this.isUnscheduled,
    };
    this.saving.set(true);
    this.formError.set('');
    const request =
      this.editingId === null
        ? this.service.create(task)
        : this.service.update(this.editingId, task);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.success.set('Đã lưu task.');
        this.loadTasks();
        this.loadParentTasks();
      },
      error: (error) => {
        this.formError.set(errorMessage(error));
        this.saving.set(false);
      },
    });
  }

  deleteTask() {
    if (this.editingId === null || this.saving()) return;
    if (!window.confirm('Xóa task này?')) return;
    this.saving.set(true);
    this.error.set('');
    this.service
      .delete(this.editingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.formOpen.set(false);
          this.success.set('Đã xóa task.');
          this.loadTasks();
          this.loadParentTasks();
        },
        error: (error) => {
          this.error.set(errorMessage(error));
          this.saving.set(false);
        },
      });
  }

  loadTasks() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.service
      .getAll(this.term)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tasks) => {
          const ids = new Set(tasks.map((task) => task.id));
          const data = tasks.map((task) => ({
            id: task.id,
            text: task.name,
            parent:
              task.idparent && task.idparent !== task.id && ids.has(task.idparent)
                ? task.idparent
                : 0,
            type: ['task', 'project', 'milestone'].includes(task.type) ? task.type : 'task',
            start_date: task.startDate ? new Date(task.startDate) : undefined,
            end_date: task.endDate ? new Date(task.endDate) : undefined,
            duration: task.duration ?? undefined,
            progress: task.progress / 100,
            unscheduled:
              task.isUnscheduled || !task.startDate || (!task.endDate && task.duration === null),
            open: true,
          }));
          this.gantt?.clearAll();
          this.gantt?.parse({ data, links: [] });
          this.count.set(tasks.length);
          this.loading.set(false);
        },
        error: (error) => {
          this.gantt?.clearAll();
          this.count.set(0);
          this.error.set(errorMessage(error));
          this.loading.set(false);
        },
      });
  }

  private escapeText(text: string) {
    const element = document.createElement('span');
    element.textContent = text;
    return element.innerHTML;
  }

  ngOnDestroy() {
    if (this.selectedEvent) this.gantt?.detachEvent(this.selectedEvent);
    this.gantt?.destructor();
    this.gantt = null;
  }
}
