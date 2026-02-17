import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './pricing-page.html',
  styleUrl: './pricing-page.css',
})
export class PricingPage {}
