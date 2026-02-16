import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-settings-profile-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './member-settings-profile-page.html',
  styleUrl: './member-settings-profile-page.css',
})
export class MemberSettingsProfilePage {
  company = '';
  contact = '';
  industry = '';
}
