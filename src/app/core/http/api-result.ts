import { HttpErrorResponse } from '@angular/common/http';

export interface ApiResult<T> {
  status: number;
  message: string | null;
  data: T;
}

export function readResult<T>(result: ApiResult<T>): T {
  if (result.status !== 1) {
    throw new Error(result.message || 'Thao tác không thành công.');
  }
  return result.data;
}

export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    return error.status === 0
      ? 'Không kết nối được API. Vui lòng kiểm tra backend.'
      : 'Không thể xử lý yêu cầu. Vui lòng thử lại.';
  }
  return error instanceof Error ? error.message : 'Đã có lỗi xảy ra.';
}
