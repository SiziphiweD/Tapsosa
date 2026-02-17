import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
})
export class ContactPage {}
