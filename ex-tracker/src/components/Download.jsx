import React, { useState } from 'react';
import './Download.css';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

function Download() {
  const [isExporting, setIsExporting] = useState(false);
  const [lastError, setLastError] = useState(null);
  
  // Get data from localStorage with robust error handling
  const getLocalStorageData = (key, defaultValue = []) => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error parsing ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  // Get data with safeguards
  const transactions = getLocalStorageData('transactions', []);
  const loans = getLocalStorageData('loans', []);

  // Improved date formatter that handles different date formats
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const tryDate = new Date(dateValue);
    if (!isNaN(tryDate)) return tryDate.toLocaleDateString();
  
    // Manual parse fallback
    if (typeof dateValue === 'string') {
      const parts = dateValue.split(/[-/.]/);
      if (parts.length === 3) {
        const [a, b, c] = parts.map(Number);
        const candidates = [
          new Date(c, b - 1, a), // dd/mm/yyyy
          new Date(c, a - 1, b), // mm/dd/yyyy
          new Date(a, b - 1, c), // yyyy/mm/dd
        ];
        for (const d of candidates) {
          if (!isNaN(d)) return d.toLocaleDateString();
        }
      }
    }
  
    return dateValue.toString(); // fallback
  };
  
  


  const exportExcel = (data, filename) => {
    try {
      // Handle empty data case
      if (!data || data.length === 0) {
        alert('No data available to export.');
        return false;
      }
      
      // Add formatting and handle special fields
      const processedData = data.map(item => {
        const processed = { ...item };
        
        // Properly format the date field
        if (item.date) processed.date = formatDate(item.date);
        
       
        return processed;
      });

      // Add generation date to the first row
      const currentDate = new Date().toLocaleDateString();
      const dataWithDate = [
        { 'Report Generated On': currentDate },
        {}, // Empty row for spacing
        ...processedData
      ];

      const worksheet = utils.json_to_sheet(dataWithDate);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Report");
      
      // Adjust column widths for better presentation
      const defaultColWidth = 15;
      const cols = [];
      
      // Set column widths based on content
      if (processedData[0]) {
        Object.keys(processedData[0]).forEach(() => {
          cols.push({ wch: defaultColWidth });
        });
        worksheet['!cols'] = cols;
      }
      
      writeFile(workbook, `${filename}.xlsx`);
      return true;
    } catch (error) {
      console.error('Excel Export Error:', error);
      setLastError(error.message);
      return false;
    }
  };

  const exportPDF = (data, title, type) => {
    try {
      // Handle empty data case
      if (!data || data.length === 0) {
        alert('No data available to export.');
        return false;
      }
      
      // Create a new document (A4 size)
      const doc = new jsPDF();
      
      // Add title with better styling
      doc.setFontSize(18);
      doc.setTextColor(0, 51, 102); // Dark blue color for title
      doc.text(title, 14, 20);
      
      // Add generation date
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102); // Gray color for date
      doc.text(`Report Generated On: ${currentDate}`, 14, 30);
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Set table styles and columns based on report type
      let columns = [];
      
      if (type === 'loan') {
        // For loan reports, use autoTable in a different layout
        const rows = [];
        
        data.forEach((loan, index) => {
          // Add a separator row between loans
          if (index > 0) {
            rows.push([{ content: '', colSpan: 2 }]);
          }
          
          // Add loan name as a header
          rows.push([
            {
              content: `Loan ${index + 1}: ${loan.name || 'Unnamed Loan'} (${formatDate(loan.date)})`,
              colSpan: 2,
              styles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
            }
          ]);
                    
          // Add loan details with improved date formatting
          rows.push(['Date', formatDate(loan.startDate)]);
          rows.push(['Amount', `₹${Number(loan.amount).toFixed(2)}`]);
          rows.push(['Interest Rate', loan.interestRate ? `${loan.interestRate}%` : '-']);
          rows.push(['Installments', loan.installments || '-']);
          rows.push(['Paid Installments', loan.paidInstallments || '-']);
          rows.push(['Monthly Payment', formatCurrency(loan.monthlyPayment)]);
        });
        
        // Generate table for loans
        autoTable(doc, {
          startY: 40,
          head: [], // No header for loan report
          body: rows,
          theme: 'grid',
          styles: {
            fontSize: 10,
            cellPadding: 5
          },
          columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 100 }
          },
          didDrawPage: function(data) {
            // Add page number
            doc.setFontSize(8);
            doc.text(`Page ${doc.internal.getNumberOfPages()}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
          }
        });
      } else {
        // For transaction reports
        if (type === 'all') {
          columns = [
            { header: 'Date', dataKey: 'date' },
            { header: 'Description', dataKey: 'description' },
            { header: 'Amount', dataKey: 'amount' },
            { header: 'Type', dataKey: 'type' },
            
          ];
        } else {
          columns = [
            { header: 'Date', dataKey: 'date' },
            { header: 'Description', dataKey: 'description' },
            { header: 'Amount', dataKey: 'amount' },
            
          ];
        }
        
        // Process data for display with improved date handling
        const tableRows = data.map(item => {
            const row = {};
            columns.forEach(col => {
              let value = item[col.dataKey];
              if (col.dataKey === 'date') {
                row[col.dataKey] = formatDate(value); // ✅ Ensure this returns a valid date string
              } else if (col.dataKey === 'amount') {
                row[col.dataKey] = formatCurrency(value);
              } else {
                row[col.dataKey] = value || '';
              }
            });
            return row;
          });
          
        
        // Generate table for transactions
        autoTable(doc, {
          startY: 40,
          columns: columns,
          body: tableRows,
          theme: 'striped', // Use striped theme for better readability
          headStyles: {
            fillColor: [66, 133, 244],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240]
          },
          margin: { top: 40 },
          styles: {
            fontSize: 10,
            cellPadding: 5
          },
          columnStyles: {
            description: { cellWidth: 'auto' }
          },
          didDrawPage: function(data) {
            // Add page number at the bottom
            doc.setFontSize(8);
            doc.text(`Page ${doc.internal.getNumberOfPages()}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
          }
        });
      }
      
      // Save the document
      doc.save(`${title}.pdf`);
      console.log(`PDF Export successful: ${title}.pdf`);
      return true;
    } catch (error) {
      console.error('PDF Export Error:', error);
      setLastError(error.message);
      alert(`PDF Export failed: ${error.message}`);
      return false;
    }
  };

  const handleDownload = async (type, format) => {
    try {
      setIsExporting(true);
      setLastError(null);
      
      let data = [];
      let filename = '';
      let title = '';

      switch (type) {
        case 'expense':
          data = transactions.filter(t => t.type === 'expense');
          filename = 'Expense_Report';
          title = 'Expense Report';
          break;
        case 'income':
          data = transactions.filter(t => t.type === 'income');
          filename = 'Income_Report';
          title = 'Income Report';
          break;
        case 'loan':
          data = loans;
          filename = 'Loan_Summary';
          title = 'Loan Summary';
          break;
        case 'all':
          data = transactions;
          filename = 'All_Transactions';
          title = 'All Transactions';
          break;
        default:
          alert('Invalid report type');
          setIsExporting(false);
          return;
      }
      
      // Check if data exists
      if (!data || data.length === 0) {
        alert(`No ${type} data available to export.`);
        setIsExporting(false);
        return;
      }

      // Add timestamp to filename
      const timestamp = new Date().toISOString().slice(0, 10);
      filename = `${filename}_${timestamp}`;

      let success = false;
      if (format === 'excel') {
        success = exportExcel(data, filename);
      } else if (format === 'pdf') {
        // Use improved PDF generator with autoTable
        success = exportPDF(data, title, type);
      }
      
      if (success) {
        console.log(`${format.toUpperCase()} export successful`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      setLastError(error.message);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="download-container">
      <h2>Download Reports</h2>
      
      {lastError && (
        <div className="error-message">
          <p>Error: {lastError}</p>
          <p>Please try again or use a different format.</p>
        </div>
      )}
      
      <div className="report-section">
        <h3>All Transactions</h3>
        <div className="button-group">
          <button 
            onClick={() => handleDownload('all', 'pdf')} 
            disabled={isExporting}
            className="download-btn pdf-btn"
          >
            {isExporting ? 'Exporting...' : 'PDF'}
          </button>
          <button 
            onClick={() => handleDownload('all', 'excel')} 
            disabled={isExporting}
            className="download-btn excel-btn"
          >
            {isExporting ? 'Exporting...' : 'Excel'}
          </button>
        </div>
      </div>
      
      <div className="report-section">
        <h3>Expenses</h3>
        <div className="button-group">
          <button 
            onClick={() => handleDownload('expense', 'pdf')} 
            disabled={isExporting}
            className="download-btn pdf-btn"
          >
            {isExporting ? 'Exporting...' : 'PDF'}
          </button>
          <button 
            onClick={() => handleDownload('expense', 'excel')} 
            disabled={isExporting}
            className="download-btn excel-btn"
          >
            {isExporting ? 'Exporting...' : 'Excel'}
          </button>
        </div>
      </div>
      
      <div className="report-section">
        <h3>Income</h3>
        <div className="button-group">
          <button 
            onClick={() => handleDownload('income', 'pdf')} 
            disabled={isExporting}
            className="download-btn pdf-btn"
          >
            {isExporting ? 'Exporting...' : 'PDF'}
          </button>
          <button 
            onClick={() => handleDownload('income', 'excel')} 
            disabled={isExporting}
            className="download-btn excel-btn"
          >
            {isExporting ? 'Exporting...' : 'Excel'}
          </button>
        </div>
      </div>
      
      <div className="report-section">
        <h3>Loan Summary</h3>
        <div className="button-group">
          <button 
            onClick={() => handleDownload('loan', 'pdf')} 
            disabled={isExporting}
            className="download-btn pdf-btn"
          >
            {isExporting ? 'Exporting...' : 'PDF'}
          </button>
          <button 
            onClick={() => handleDownload('loan', 'excel')} 
            disabled={isExporting}
            className="download-btn excel-btn"
          >
            {isExporting ? 'Exporting...' : 'Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Download;