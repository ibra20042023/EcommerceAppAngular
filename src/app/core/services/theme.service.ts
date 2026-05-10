import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  theme = signal<'light' | 'dark'>('light');

  constructor() {
    this.initializeTheme();

    // Effect to update the DOM and localStorage whenever the theme signal changes
    effect(() => {
      const currentTheme = this.theme();
      localStorage.setItem('theme', currentTheme);

      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  private initializeTheme() {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      this.theme.set(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.theme.set('dark');
    } else {
      this.theme.set('light');
    }
  }

  toggleTheme() {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  setTheme(theme: 'light' | 'dark') {
    this.theme.set(theme);
  }
}
