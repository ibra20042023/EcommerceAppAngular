import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { BackgroundLoaderComponent } from './shared/components/background-loader/background-loader.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterOutlet, NotificationComponent, BackgroundLoaderComponent],
})
export class App {}
