import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-member-settings-billing-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './member-settings-billing-page.html',
  styleUrl: './member-settings-billing-page.css',
})
export class MemberSettingsBillingPage {}
