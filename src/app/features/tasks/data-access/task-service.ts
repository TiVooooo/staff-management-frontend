import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../../core/http/api-base-url';
import { ApiResult, readResult } from '../../../core/http/api-result';
import { Task } from '../models/task';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private url = inject(API_BASE_URL) + '/Task';

  getAll(term: string) {
    return this.http
      .get<ApiResult<Task[]>>(this.url, { params: { term: term.trim() } })
      .pipe(map(readResult));
  }

  getById(id: number) {
    return this.http.get<ApiResult<Task>>(this.url + '/' + id).pipe(map(readResult));
  }

  create(task: Omit<Task, 'id'>) {
    return this.http.post<ApiResult<Task>>(this.url, task).pipe(map(readResult));
  }

  update(id: number, task: Omit<Task, 'id'>) {
    return this.http.put<ApiResult<Task>>(this.url + '/' + id, task).pipe(map(readResult));
  }

  delete(id: number) {
    return this.http.delete<ApiResult<null>>(this.url + '/' + id).pipe(map(readResult));
  }
}
