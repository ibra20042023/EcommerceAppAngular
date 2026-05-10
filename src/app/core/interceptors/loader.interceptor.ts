import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';

let countRequest: number = 0;

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  if (!countRequest) {
    loaderService.setIsloading(true);
  }
  countRequest++;

  return next(req).pipe(
    finalize(() => {
      countRequest--;
      if (!countRequest) {
        loaderService.setIsloading(false);
      }
    })
  );
};
