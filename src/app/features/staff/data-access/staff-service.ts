import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../../core/http/api-base-url';
import { ApiResult, readResult } from '../../../core/http/api-result';
import { Staff } from '../models/staff';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private http = inject(HttpClient);
  private url = inject(API_BASE_URL) + '/Staff';

  getAll(term: string) {
    return this.http
      .get<ApiResult<Staff[]>>(this.url, { params: { term: term.trim() } })
      .pipe(map(readResult));
  }

  create(staff: Omit<Staff, 'id'>) {
    return this.http.post<ApiResult<Staff>>(this.url, staff).pipe(map(readResult));
  }

  update(id: number, staff: Omit<Staff, 'id'>) {
    return this.http.put<ApiResult<Staff>>(this.url + '/' + id, staff).pipe(map(readResult));
  }

  delete(id: number) {
    return this.http.delete<ApiResult<null>>(this.url + '/' + id).pipe(map(readResult));
  }
}
