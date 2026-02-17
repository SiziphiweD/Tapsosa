import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type SupplierCategory =
  | 'Uniforms & PPE'
  | 'SIM Cards & Connectivity'
  | 'Access Control Systems'
  | 'Patrol Monitoring Systems'
  | 'Two-Way Radios'
  | 'Financial Assistance & Asset Finance'
  | 'Insurance Solutions';

type Supplier = {
  id: string;
  name: string;
  category: SupplierCategory;
  region: string;
  rating: number;
  verified: boolean;
};

@Component({
  selector: 'app-supplier-directory-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './supplier-directory-page.html',
  styleUrl: './supplier-directory-page.css',
})
export class SupplierDirectoryPage {
  categories: SupplierCategory[] = [
    'Uniforms & PPE',
    'SIM Cards & Connectivity',
    'Access Control Systems',
    'Patrol Monitoring Systems',
    'Two-Way Radios',
    'Financial Assistance & Asset Finance',
    'Insurance Solutions',
  ];

  suppliers: Supplier[] = [
    { id: 'uniforms-ppe-1', name: 'Protec Uniforms', category: 'Uniforms & PPE', region: 'National', rating: 4, verified: true },
    { id: 'uniforms-ppe-2', name: 'ShieldWear Supplies', category: 'Uniforms & PPE', region: 'Gauteng', rating: 5, verified: true },
    { id: 'sim-connectivity-1', name: 'BlueWave Connectivity', category: 'SIM Cards & Connectivity', region: 'National', rating: 3, verified: true },
    { id: 'sim-connectivity-2', name: 'SignalTech Networks', category: 'SIM Cards & Connectivity', region: 'Western Cape', rating: 5, verified: true },
    { id: 'access-control-1', name: 'AccessSecure Systems', category: 'Access Control Systems', region: 'Gauteng', rating: 4, verified: true },
    { id: 'access-control-2', name: 'GateMaster Technologies', category: 'Access Control Systems', region: 'Western Cape', rating: 5, verified: true },
    { id: 'patrol-monitoring-1', name: 'PatrolTrack Solutions', category: 'Patrol Monitoring Systems', region: 'National', rating: 3, verified: true },
    { id: 'patrol-monitoring-2', name: 'SecureRoute Analytics', category: 'Patrol Monitoring Systems', region: 'KwaZulu-Natal', rating: 5, verified: true },
    { id: 'two-way-radios-1', name: 'RadioLink Communications', category: 'Two-Way Radios', region: 'Gauteng', rating: 4, verified: true },
    { id: 'two-way-radios-2', name: 'SignalWave Radios', category: 'Two-Way Radios', region: 'Western Cape', rating: 5, verified: true },
    { id: 'finance-1', name: 'AssetFin Capital', category: 'Financial Assistance & Asset Finance', region: 'National', rating: 4, verified: true },
    { id: 'finance-2', name: 'GuardSure Finance', category: 'Financial Assistance & Asset Finance', region: 'Gauteng', rating: 5, verified: true },
    { id: 'insurance-1', name: 'SecureCover Insurance', category: 'Insurance Solutions', region: 'National', rating: 4, verified: true },
    { id: 'insurance-2', name: 'ShieldRisk Underwriters', category: 'Insurance Solutions', region: 'Western Cape', rating: 5, verified: true },
  ];

  draftCategory: 'All' | SupplierCategory = 'All';
  draftLocation = '';

  filters: { category: 'All' | SupplierCategory; location: string } = {
    category: 'All',
    location: '',
  };

  stars = [1, 2, 3, 4, 5];

  applyFilters() {
    this.filters = {
      category: this.draftCategory,
      location: this.draftLocation,
    };
  }

  get filteredSuppliers(): Supplier[] {
    const category = this.filters.category;
    const location = this.filters.location.trim().toLowerCase();
    return this.suppliers.filter((s) => {
      const byCategory = category === 'All' || s.category === category;
      const byLocation =
        !location ||
        s.region.toLowerCase().includes(location) ||
        s.name.toLowerCase().includes(location);
      return byCategory && byLocation;
    });
  }
}
