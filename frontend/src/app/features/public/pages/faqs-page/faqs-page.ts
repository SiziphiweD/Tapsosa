import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-faqs-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './faqs-page.html',
  styleUrl: './faqs-page.css',
})
export class FaqsPage {}
