import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-settings-preferences-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './member-settings-preferences-page.html',
  styleUrl: './member-settings-preferences-page.css',
})
export class MemberSettingsPreferencesPage {
  language = 'English';
  timezone = 'GMT+2';
  emailPrefs = true;
  darkMode = false;
}
