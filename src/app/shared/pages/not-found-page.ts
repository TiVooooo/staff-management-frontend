import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Không tìm thấy trang</h1>
    <a routerLink="/staff">Về trang nhân viên</a>
  `,
})
export class NotFoundPage {}
