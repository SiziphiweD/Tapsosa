import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-admin-finance-revenue-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-finance-revenue-page.html',
  styleUrl: './admin-finance-revenue-page.css',
})
export class AdminFinanceRevenuePage implements OnDestroy {
  private api = inject(MockApiService);

  totalGross = 0;
  totalFee = 0;
  totalNet = 0;
  fundedGross = 0;
  releasedNet = 0;
  rows: Array<{ title: string; status: string; gross: number; fee: number; net: number }> = [];
  private charts: any[] = [];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.api.listJobs().subscribe((jobs: Job[]) => {
      const esc = jobs.filter((j) => j.escrow);
      this.rows = esc.map((j) => ({
        title: j.title,
        status: j.escrow!.status,
        gross: j.escrow!.gross,
        fee: j.escrow!.fee,
        net: j.escrow!.net,
      }));
      this.totalGross = esc.reduce((s, j) => s + j.escrow!.gross, 0);
      this.totalFee = esc.reduce((s, j) => s + j.escrow!.fee, 0);
      this.totalNet = esc.reduce((s, j) => s + j.escrow!.net, 0);
      this.fundedGross = esc.filter((j) => j.escrow!.status === 'funded').reduce((s, j) => s + j.escrow!.gross, 0);
      this.releasedNet = esc.filter((j) => j.escrow!.status === 'released').reduce((s, j) => s + j.escrow!.net, 0);
      setTimeout(() => this.buildCharts(), 0);
    });
  }

  exportCsv() {
    const header = ['Job', 'Status', 'Gross', 'Fee', 'Net'];
    const rows = this.rows.map((r) => [r.title, r.status, r.gross, r.fee, r.net]);
    const csv = [header, ...rows]
      .map((r) =>
        r
          .map((v) => {
            const s = String(v ?? '');
            if (/[\",\\n]/.test(s)) return `"${s.replace(/\"/g, '\"\"')}"`;
            return s;
          })
          .join(',')
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revenue.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  private buildCharts() {
    const totalsEl = document.getElementById('revenueTotalsChart') as HTMLCanvasElement | null;
    const distEl = document.getElementById('revenueStatusChart') as HTMLCanvasElement | null;
    if (!totalsEl || !distEl) return;
    const pending = this.rows.filter((r) => r.status === 'pending').length;
    const funded = this.rows.filter((r) => r.status === 'funded').length;
    const released = this.rows.filter((r) => r.status === 'released').length;

    import('chart.js/auto').then(({ default: Chart }) => {
      this.destroyCharts();
      const totals = new Chart(totalsEl, {
        type: 'bar',
        data: {
          labels: ['Gross', 'Fee', 'Net'],
          datasets: [
            {
              label: 'Totals (R)',
              backgroundColor: ['#0ea5e9', '#f59e0b', '#10b981'],
              data: [this.totalGross, this.totalFee, this.totalNet],
            },
          ],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });

      const dist = new Chart(distEl, {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'Funded', 'Released'],
          datasets: [
            {
              data: [pending, funded, released],
              backgroundColor: ['#f59e0b', '#0ea5e9', '#10b981'],
            },
          ],
        },
        options: { plugins: { legend: { position: 'bottom' } } },
      });
      this.charts.push(totals, dist);
    });
  }

  private destroyCharts() {
    this.charts.forEach((c) => c && c.destroy && c.destroy());
    this.charts = [];
  }

  ngOnDestroy() {
    this.destroyCharts();
  }
}
