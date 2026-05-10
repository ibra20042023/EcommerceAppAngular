import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  public isLoading = new BehaviorSubject<boolean>(false);

  setIsloading(value: boolean) {
    this.isLoading.next(value);
  }
}
