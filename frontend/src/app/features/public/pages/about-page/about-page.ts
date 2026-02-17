import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './about-page.html',
  styleUrl: './about-page.css',
})
export class AboutPage {}
