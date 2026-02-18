import { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Download, Calendar, FileText, BarChart3, TrendingUp, DollarSign, AlertTriangle, Clock, Activity } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ReportsPage() {
  const [startDate, setStartDate] = useState('2026-02-01');
  const [endDate, setEndDate] = useState('2026-02-16');
  const [reportType, setReportType] = useState('occupancy');
  const [loading, setLoading] = useState(false);

  const generateReportData = () => {
    const reportTitle = reportType === 'occupancy' ? 'Occupancy Report' :
                       reportType === 'revenue' ? 'Revenue Report' :
                       reportType === 'violations' ? 'Violations Report' :
                       reportType === 'vehicles' ? 'Vehicle Activity Report' :
                       'Staff Performance Report';

    // Generate sample data based on report type
    let data: any[] = [];
    
    if (reportType === 'occupancy') {
      data = [
        ['Zone A', '75', '100', '75%', '18 hrs avg'],
        ['Zone B', '82', '100', '82%', '20 hrs avg'],
        ['Zone C', '68', '100', '68%', '15 hrs avg'],
        ['Zone D', '91', '100', '91%', '22 hrs avg'],
        ['Zone E', '79', '100', '79%', '19 hrs avg'],
        ['Zone F', '63', '100', '63%', '14 hrs avg'],
      ];
    } else if (reportType === 'revenue') {
      data = [
        ['Feb 01', 'Parking', '₱12,450', '498 transactions'],
        ['Feb 02', 'Parking', '₱13,200', '528 transactions'],
        ['Feb 03', 'Violations', '₱8,500', '17 violations'],
        ['Feb 04', 'Parking', '₱14,100', '564 transactions'],
      ];
    } else if (reportType === 'violations') {
      data = [
        ['ABC123', 'Overtime Parking', '₱500', 'Feb 05', 'Unpaid'],
        ['XYZ789', 'Wrong Slot', '₱300', 'Feb 07', 'Paid'],
        ['DEF456', 'No Payment', '₱750', 'Feb 10', 'Unpaid'],
        ['GHI012', 'Overtime Parking', '₱500', 'Feb 12', 'Paid'],
      ];
    } else if (reportType === 'vehicles') {
      data = [
        ['ABC123', 'John Doe', '45 entries', '2 violations', '95'],
        ['XYZ789', 'Jane Smith', '38 entries', '0 violations', '100'],
        ['DEF456', 'Bob Wilson', '52 entries', '1 violation', '98'],
        ['GHI012', 'Alice Brown', '29 entries', '0 violations', '100'],
      ];
    } else {
      data = [
        ['John Guard', 'Toll Personnel', '180 entries', '42 violations', '95%'],
        ['Maria Santos', 'Toll Personnel', '165 entries', '38 violations', '93%'],
        ['Pedro Cruz', 'Admin', '0 entries', '120 actions', '98%'],
      ];
    }

    return { reportTitle, data };
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      toast.info('Generating PDF report...');
      
      const { reportTitle, data } = generateReportData();
      
      // Create PDF
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(30, 64, 175); // Blue-800
      doc.text('SM TarPark', 14, 20);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(reportTitle, 14, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 38);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 44);
      
      // Add table based on report type
      let headers: string[] = [];
      
      if (reportType === 'occupancy') {
        headers = ['Zone', 'Occupied', 'Total', 'Occupancy %', 'Avg Duration'];
      } else if (reportType === 'revenue') {
        headers = ['Date', 'Type', 'Amount', 'Details'];
      } else if (reportType === 'violations') {
        headers = ['Plate Number', 'Type', 'Fine', 'Date', 'Status'];
      } else if (reportType === 'vehicles') {
        headers = ['Plate Number', 'Owner', 'Entries', 'Violations', 'Credit Score'];
      } else {
        headers = ['Staff Name', 'Role', 'Vehicle Entries', 'Actions', 'Performance'];
      }
      
      autoTable(doc, {
        startY: 52,
        head: [headers],
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [30, 64, 175] }, // Blue-800
        styles: { fontSize: 9 },
      });
      
      // Save PDF
      doc.save(`SM-TarPark-${reportType}-report-${Date.now()}.pdf`);
      
      toast.success(`${reportTitle} PDF generated successfully`);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      toast.info('Generating CSV report...');
      
      const { reportTitle, data } = generateReportData();
      
      // Create CSV content
      let csvContent = `SM TarPark - ${reportTitle}\n`;
      csvContent += `Date Range: ${startDate} to ${endDate}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      // Add headers
      if (reportType === 'occupancy') {
        csvContent += 'Zone,Occupied,Total,Occupancy %,Avg Duration\n';
      } else if (reportType === 'revenue') {
        csvContent += 'Date,Type,Amount,Details\n';
      } else if (reportType === 'violations') {
        csvContent += 'Plate Number,Type,Fine,Date,Status\n';
      } else if (reportType === 'vehicles') {
        csvContent += 'Plate Number,Owner,Entries,Violations,Credit Score\n';
      } else {
        csvContent += 'Staff Name,Role,Vehicle Entries,Actions,Performance\n';
      }
      
      // Add data rows
      data.forEach(row => {
        csvContent += row.join(',') + '\n';
      });
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `SM-TarPark-${reportType}-report-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${reportTitle} CSV exported successfully`);
    } catch (error) {
      console.error('CSV generation error:', error);
      toast.error('Failed to export CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReport = async (reportTitle: string) => {
    setLoading(true);
    try {
      toast.info(`Generating ${reportTitle}...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${reportTitle} ready`);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Generate and export system reports</p>
      </div>

      {/* Report Generator */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Report</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="occupancy">Occupancy Report</option>
              <option value="revenue">Revenue Report</option>
              <option value="violations">Violations Report</option>
              <option value="vehicles">Vehicle Activity Report</option>
              <option value="performance">Staff Performance Report</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleExportPDF} disabled={loading}>
              <Download className="w-4 h-4" />
              Export as PDF
            </Button>
            <Button variant="secondary" className="flex-1" onClick={handleExportCSV} disabled={loading}>
              <Download className="w-4 h-4" />
              Export as CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Reports */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Today\'s Summary', desc: 'Current day statistics', Icon: BarChart3, color: 'text-blue-600' },
            { title: 'Weekly Overview', desc: 'Last 7 days analysis', Icon: TrendingUp, color: 'text-green-600' },
            { title: 'Monthly Report', desc: 'Full month breakdown', Icon: Calendar, color: 'text-purple-600' },
            { title: 'Revenue Summary', desc: 'Financial overview', Icon: DollarSign, color: 'text-emerald-600' },
            { title: 'Violation Trends', desc: 'Violation patterns', Icon: AlertTriangle, color: 'text-red-600' },
            { title: 'Peak Hours', desc: 'Traffic analysis', Icon: Clock, color: 'text-orange-600' }
          ].map((report) => {
            const IconComponent = report.Icon;
            return (
              <button
                key={report.title}
                className="text-left border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                onClick={() => handleQuickReport(report.title)}
                disabled={loading}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <IconComponent className={`w-6 h-6 ${report.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}