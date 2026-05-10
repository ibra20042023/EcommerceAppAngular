import { AfterViewInit, Component, computed, inject, signal } from '@angular/core';
import { LoaderService } from '../../../core/services/loader.service';
import { startWith, delay } from 'rxjs';

@Component({
  selector: 'app-background-loader',
  templateUrl: './background-loader.component.html',
})
export class BackgroundLoaderComponent implements AfterViewInit {
  loading = signal(false);
  private readonly loaderService = inject(LoaderService);

  isLoading = computed(() => this.loading());

  ngAfterViewInit(): void {
    this.loaderService.isLoading.pipe(startWith(false), delay(0)).subscribe((res) => {
      this.loading.set(res);
    });
  }
}
