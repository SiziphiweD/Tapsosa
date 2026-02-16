import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-settings-users-page',
  imports: [CommonModule],
  templateUrl: './member-settings-users-page.html',
  styleUrl: './member-settings-users-page.css',
})
export class MemberSettingsUsersPage {
  users = [
    { name: 'Owner', role: 'Admin' },
  ];
}
