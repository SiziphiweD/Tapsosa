import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-job-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-job-categories-page.html',
  styleUrl: './admin-job-categories-page.css',
})
export class AdminJobCategoriesPage {
  categories: string[] = [];
  input = '';

  constructor() {
    this.load();
  }

  add() {
    const v = this.input.trim();
    if (!v) return;
    if (!this.categories.includes(v)) {
      this.categories.push(v);
      this.save();
    }
    this.input = '';
  }

  remove(idx: number) {
    this.categories.splice(idx, 1);
    this.save();
  }

  private load() {
    try {
      const raw = localStorage.getItem('tapsosa.job-categories');
      this.categories = raw ? JSON.parse(raw) : ['Guarding Services', 'Technology', 'Uniforms', 'Vehicles', 'Training'];
    } catch {
      this.categories = ['Guarding Services', 'Technology', 'Uniforms', 'Vehicles', 'Training'];
    }
  }

  private save() {
    localStorage.setItem('tapsosa.job-categories', JSON.stringify(this.categories));
  }
}
