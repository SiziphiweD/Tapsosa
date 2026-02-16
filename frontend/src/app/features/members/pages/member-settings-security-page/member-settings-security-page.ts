import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-settings-security-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './member-settings-security-page.html',
  styleUrl: './member-settings-security-page.css',
})
export class MemberSettingsSecurityPage {
  twoFactor = false;
}
