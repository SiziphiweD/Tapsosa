import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Document {
  name: string;
  size: string;
  status: 'Uploaded' | 'Pending';
  uploadedAt: Date;
}

@Component({
  selector: 'app-member-settings-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-settings-profile-page.html',
  styleUrl: './member-settings-profile-page.css',
})
export class MemberSettingsProfilePage {
  // Company Information
  company = 'ABC Security Services';
  industry = 'Security Services';
  registrationNumber = '2023/123456/07';
  
  // Contact Details
  contact = '+27 11 123 4567';
  businessEmail = 'info@abcsecurity.co.za';
  address = '123 Business Park, Johannesburg, 2000';
  website = 'https://www.abcsecurity.co.za';
  
  // File uploads
  logoFile: File | null = null;
  
  // Documents
  documents: Document[] = [
    {
      name: 'CIPC Registration Certificate.pdf',
      size: '245 KB',
      status: 'Uploaded',
      uploadedAt: new Date('2024-01-15')
    },
    {
      name: 'Tax Clearance Certificate.pdf',
      size: '180 KB',
      status: 'Uploaded',
      uploadedAt: new Date('2024-01-15')
    },
    {
      name: 'B-BBEE Certificate.pdf',
      size: '320 KB',
      status: 'Pending',
      uploadedAt: new Date('2024-02-01')
    }
  ];
  
  saved = false;

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (PNG, JPG, or SVG)');
        return;
      }
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      
      this.logoFile = file;
    }
  }

  onDocumentsSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      Array.from(files).forEach((file: any) => {
        // Validate file type
        const validTypes = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
          alert(`File ${file.name} is not a valid document format (PDF, DOC, DOCX only)`);
          return;
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} must be less than 5MB`);
          return;
        }
        
        // Add to documents list
        this.documents.push({
          name: file.name,
          size: (file.size / 1024).toFixed(0) + ' KB',
          status: 'Pending',
          uploadedAt: new Date()
        });
      });
    }
  }

  saveProfile() {
    // Here you would typically save to a backend
    console.log('Saving profile:', {
      company: this.company,
      industry: this.industry,
      registrationNumber: this.registrationNumber,
      contact: this.contact,
      businessEmail: this.businessEmail,
      address: this.address,
      website: this.website,
      logo: this.logoFile?.name,
      documents: this.documents
    });
    
    this.saved = true;
    setTimeout(() => {
      this.saved = false;
    }, 3000);
  }

  resetForm() {
    if (confirm('Are you sure you want to reset all changes?')) {
      // Reset to original values
      this.company = 'ABC Security Services';
      this.industry = 'Security Services';
      this.registrationNumber = '2023/123456/07';
      this.contact = '+27 11 123 4567';
      this.businessEmail = 'info@abcsecurity.co.za';
      this.address = '123 Business Park, Johannesburg, 2000';
      this.website = 'https://www.abcsecurity.co.za';
      this.logoFile = null;
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input: any) => { input.value = ''; });
    }
  }
}