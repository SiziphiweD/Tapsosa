import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

type SupplierCategory =
  | 'Uniforms & PPE'
  | 'SIM Cards & Connectivity'
  | 'Access Control Systems'
  | 'Patrol Monitoring Systems'
  | 'Two-Way Radios'
  | 'Financial Assistance & Asset Finance'
  | 'Insurance Solutions';

type SupplierProfile = {
  id: string;
  name: string;
  category: SupplierCategory;
  region: string;
  rating: number;
  verified: boolean;
  summary: string;
  services: string[];
  complianceSummary: string;
  performanceSummary: string;
};

const SUPPLIERS: SupplierProfile[] = [
  {
    id: 'uniforms-ppe-1',
    name: 'Protec Uniforms',
    category: 'Uniforms & PPE',
    region: 'National',
    rating: 4,
    verified: true,
    summary: 'National supplier of uniforms and PPE for guarding staff and control room teams.',
    services: ['Uniform sets', 'PPE for night and high-risk work'],
    complianceSummary: 'BEE-compliant supplier with valid tax clearance and liability cover.',
    performanceSummary: 'Strong delivery record on national rollouts.',
  },
  {
    id: 'uniforms-ppe-2',
    name: 'ShieldWear Supplies',
    category: 'Uniforms & PPE',
    region: 'Gauteng',
    rating: 5,
    verified: true,
    summary: 'Gauteng-based specialist in branded security uniforms and protective gear.',
    services: ['Custom-branded uniforms', 'Rapid replacement stock in Gauteng'],
    complianceSummary: 'Valid tax clearance and commercial liability cover on file.',
    performanceSummary: 'High on-time delivery and quality feedback from members.',
  },
  {
    id: 'sim-connectivity-1',
    name: 'BlueWave Connectivity',
    category: 'SIM Cards & Connectivity',
    region: 'National',
    rating: 3,
    verified: true,
    summary: 'Connectivity partner for SIM provisioning and pooled data bundles.',
    services: ['Pooled data SIMs', 'Usage reporting and alerts'],
    complianceSummary: 'Valid tax clearance and professional indemnity cover.',
    performanceSummary: 'Solid support for multi-site guarding operations.',
  },
  {
    id: 'sim-connectivity-2',
    name: 'SignalTech Networks',
    category: 'SIM Cards & Connectivity',
    region: 'Western Cape',
    rating: 5,
    verified: true,
    summary: 'Regional provider focused on secure links for alarms and CCTV.',
    services: ['SIMs for alarm devices', 'Failover connectivity for critical sites'],
    complianceSummary: 'Tax compliant with OEM-aligned technical teams.',
    performanceSummary: 'Quick response and high uptime on monitored sites.',
  },
  {
    id: 'access-control-1',
    name: 'AccessSecure Systems',
    category: 'Access Control Systems',
    region: 'Gauteng',
    rating: 4,
    verified: true,
    summary: 'Installer of access control and time-and-attendance systems.',
    services: ['Card and biometric access', 'Turnstiles and gate motors'],
    complianceSummary: 'Technical partner with valid tax clearance and liability cover.',
    performanceSummary: 'Consistent performance on multi-site deployments.',
  },
  {
    id: 'access-control-2',
    name: 'GateMaster Technologies',
    category: 'Access Control Systems',
    region: 'Western Cape',
    rating: 5,
    verified: true,
    summary: 'Turnkey access control projects from design to commissioning.',
    services: ['System design', 'Hardware supply and maintenance'],
    complianceSummary: 'Tax compliant with project and contract works cover.',
    performanceSummary: 'Strong track record on complex installations.',
  },
  {
    id: 'patrol-monitoring-1',
    name: 'PatrolTrack Solutions',
    category: 'Patrol Monitoring Systems',
    region: 'National',
    rating: 3,
    verified: true,
    summary: 'Patrol monitoring platform for guard tours and incident logging.',
    services: ['Mobile patrol app', 'Route and checkpoint reporting'],
    complianceSummary: 'Aligned to guarding operational requirements with tax clearance.',
    performanceSummary: 'Trusted for basic patrol monitoring at scale.',
  },
  {
    id: 'patrol-monitoring-2',
    name: 'SecureRoute Analytics',
    category: 'Patrol Monitoring Systems',
    region: 'KwaZulu-Natal',
    rating: 5,
    verified: true,
    summary: 'Analytics-focused patrol monitoring for high-risk deployments.',
    services: ['Heatmaps and trends', 'SLA compliance reporting'],
    complianceSummary: 'Tax compliant with strong data protection practices.',
    performanceSummary: 'Used on complex guarding portfolios with strict SLAs.',
  },
  {
    id: 'two-way-radios-1',
    name: 'RadioLink Communications',
    category: 'Two-Way Radios',
    region: 'Gauteng',
    rating: 4,
    verified: true,
    summary: 'Radio fleet rentals and maintenance for guarding and events.',
    services: ['Radio rentals', 'Repeater and coverage planning'],
    complianceSummary: 'Tax compliant with equipment and liability cover.',
    performanceSummary: 'Reliable support for large event operations.',
  },
  {
    id: 'two-way-radios-2',
    name: 'SignalWave Radios',
    category: 'Two-Way Radios',
    region: 'Western Cape',
    rating: 5,
    verified: true,
    summary: 'Digital radio solutions integrated into control rooms.',
    services: ['Digital radio rollouts', 'Control room integration'],
    complianceSummary: 'Tax compliant with professional indemnity cover.',
    performanceSummary: 'Strong feedback on audio quality and uptime.',
  },
  {
    id: 'finance-1',
    name: 'AssetFin Capital',
    category: 'Financial Assistance & Asset Finance',
    region: 'National',
    rating: 4,
    verified: true,
    summary: 'Asset finance for vehicles, equipment and technology.',
    services: ['Vehicle and fleet finance', 'Equipment funding'],
    complianceSummary: 'Registered credit provider with valid tax clearance.',
    performanceSummary: 'Supports phased rollouts linked to contracts.',
  },
  {
    id: 'finance-2',
    name: 'GuardSure Finance',
    category: 'Financial Assistance & Asset Finance',
    region: 'Gauteng',
    rating: 5,
    verified: true,
    summary: 'Working capital and asset finance tailored to security firms.',
    services: ['Working capital lines', 'Equipment and vehicle finance'],
    complianceSummary: 'Registered credit provider with compliant documentation.',
    performanceSummary: 'Known for fast approvals on qualifying deals.',
  },
  {
    id: 'insurance-1',
    name: 'SecureCover Insurance',
    category: 'Insurance Solutions',
    region: 'National',
    rating: 4,
    verified: true,
    summary: 'Insurance solutions for guarding liability and assets.',
    services: ['Guarding liability cover', 'Equipment and vehicle insurance'],
    complianceSummary: 'FSCA-licensed provider with valid tax clearance.',
    performanceSummary: 'Widely used by members for core risk cover.',
  },
  {
    id: 'insurance-2',
    name: 'ShieldRisk Underwriters',
    category: 'Insurance Solutions',
    region: 'Western Cape',
    rating: 5,
    verified: true,
    summary: 'Underwriting partner for complex and high-value risks.',
    services: ['Custom liability programmes', 'Contract-specific cover design'],
    complianceSummary: 'FSCA-licensed underwriting manager.',
    performanceSummary: 'Specialist support on complex claims.',
  },
];

@Component({
  selector: 'app-supplier-profile-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './supplier-profile-page.html',
  styleUrl: './supplier-profile-page.css',
})
export class SupplierProfilePage {
  supplier?: SupplierProfile;
  stars = [1, 2, 3, 4, 5];

  constructor(private route: ActivatedRoute) {
    const id = this.route.snapshot.paramMap.get('supplierId');
    if (id) {
      this.supplier = SUPPLIERS.find((s) => s.id === id);
    }
  }
}
