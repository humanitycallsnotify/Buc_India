import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Convert camelCase to readable format
const formatColumnName = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

// Dynamically get columns from registration data
const getExportColumns = (registrations) => {
  if (!registrations || registrations.length === 0) {
    return [];
  }
  
  const excludeFields = ['_id', 'eventId', 'licenseImagePublicId', 'licenseImage', '__v', 'createdAt', 'updatedAt'];
  const firstReg = registrations[0];
  const keys = Object.keys(firstReg).filter(key => !excludeFields.includes(key));
  
  return keys.map(key => ({
    key: key,
    label: formatColumnName(key)
  }));
};

export const exportToExcel = (registrations, getEventName, selectedFields = null) => {
  if (!registrations || registrations.length === 0) {
    alert('No data to export');
    return;
  }

  let columns = getExportColumns(registrations);
  
  // Filter columns based on selected fields if provided
  if (selectedFields && selectedFields.length > 0) {
    // Check if eventName is selected
    const includeEventName = selectedFields.includes('eventName');
    columns = columns.filter(col => selectedFields.includes(col.key));
    
    // Add eventName column if selected but not in regular columns
    if (includeEventName && !columns.find(col => col.key === 'eventName')) {
      columns.push({ key: 'eventName', label: 'Event Name' });
    }
  }
  
  // Prepare data for Excel dynamically
  const excelData = registrations.map((reg, index) => {
    const row = { 'S.No': index + 1 };
    columns.forEach(column => {
      // Handle special eventName field
      if (column.key === 'eventName') {
        row[column.label] = getEventName ? getEventName(reg.eventId) : 'Unknown Event';
        return;
      }
      
      const value = reg[column.key];
      const keyLower = column.key.toLowerCase();
      
      // Handle license proof/images - show indicator instead of base64
      if ((keyLower.includes('license') && keyLower.includes('proof')) || 
          keyLower.includes('licenseproof') ||
          keyLower === 'image' ||
          keyLower === 'licenseimage' ||
          (keyLower.includes('proof') && typeof value === 'string' && value.length > 100)) {
        if (value && typeof value === 'string' && 
            (value.startsWith('data:image') || value.startsWith('blob:') || value.length > 200)) {
          row[column.label] = '[Image File Attached]';
        } else {
          row[column.label] = value || '';
        }
      }
      // Handle date fields
      else if (keyLower.includes('date') || keyLower.includes('at')) {
        if (value) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              row[column.label] = date.toLocaleString();
            } else {
              row[column.label] = value || '';
            }
          } catch (e) {
            row[column.label] = value || '';
          }
        } else {
          row[column.label] = '';
        }
      } else if (value === null || value === undefined) {
        row[column.label] = '';
      } else if (typeof value === 'object') {
        row[column.label] = JSON.stringify(value);
      } else {
        // For very long text, truncate in Excel
        const stringValue = String(value);
        if (stringValue.length > 32767) { // Excel cell limit
          row[column.label] = stringValue.substring(0, 32764) + '...';
        } else {
          row[column.label] = stringValue;
        }
      }
    });
    return row;
  });

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registrations');

  // Auto-size columns dynamically (default width)
  ws['!cols'] = [{ wch: 5 }, ...columns.map(() => ({ wch: 20 }))];

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `BUC_Registrations_${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
};

export const exportToPDF = (registrations, getEventName, selectedFields = null, options = {}) => {
  if (!registrations || registrations.length === 0) {
    alert('No data to export');
    return;
  }

  let columns = getExportColumns(registrations);
  
  // Filter columns based on selected fields if provided
  if (selectedFields && selectedFields.length > 0) {
    // Check if eventName is selected
    const includeEventName = selectedFields.includes('eventName');
    columns = columns.filter(col => selectedFields.includes(col.key));
    
    // Add eventName column if selected but not in regular columns
    if (includeEventName && !columns.find(col => col.key === 'eventName')) {
      columns.push({ key: 'eventName', label: 'Event Name' });
    }
  }
  
  // Helper function to format cell value
  const formatCellValue = (value, columnKey) => {
    // Handle license proof/images - show indicator instead of base64
    const keyLower = columnKey.toLowerCase();
    if ((keyLower.includes('license') || keyLower.includes('proof') || keyLower.includes('document') || keyLower === 'image') && value) {
      if (typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('blob:') || value.length > 200)) {
        return '[Image Attached]';
      }
      return value;
    }
    
    // Handle date fields
    if (keyLower.includes('date') || keyLower.includes('at')) {
      if (value) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
          }
        } catch (e) {
          // Not a valid date
        }
      }
      return value || '-';
    }
    
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    // Handle long text - wrap instead of truncate for PDF
    const stringValue = String(value);
    
    // For very long text (like base64 images), show indicator
    if (stringValue.length > 200) {
      if (stringValue.startsWith('data:image') || stringValue.startsWith('blob:')) {
        return '[Image File - See License Proof Column]';
      }
      return stringValue.substring(0, 150) + '... (truncated)';
    }
    
    return stringValue;
  };

  // Calculate column widths based on content and data
  const calculateColumnWidths = () => {
    const pageWidth = 277; // A4 landscape width in mm (297 - 20mm margins)
    const minColWidth = 12;
    const maxColWidth = 60;
    
    const widths = [];
    
    // S.No column - fixed small width
    widths.push(10);
    
    // Calculate widths for each column based on both label and data
    columns.forEach(col => {
      const labelLength = col.label.length;
      
      // Find max data length in this column
      let maxDataLength = labelLength;
      registrations.forEach(reg => {
        const value = formatCellValue(reg[col.key], col.key);
        const valueLength = String(value).length;
        if (valueLength > maxDataLength) {
          maxDataLength = valueLength;
        }
      });
      
      // Calculate width based on content (roughly 1mm per 2 characters)
      let width = Math.max(minColWidth, Math.min(maxColWidth, Math.max(labelLength, maxDataLength) * 0.8 + 8));
      widths.push(width);
    });
    
    // Calculate total width
    const totalWidth = widths.reduce((sum, w) => sum + w, 0);
    
    // If total exceeds page width, scale down proportionally
    if (totalWidth > pageWidth) {
      const scale = (pageWidth - 10) / (totalWidth - 10); // Keep S.No at 10
      return widths.map((w, idx) => idx === 0 ? w : Math.max(minColWidth, w * scale));
    }
    
    return widths;
  };

  const columnWidths = calculateColumnWidths();

  // Prepare table data dynamically
  const tableData = registrations.map((reg, index) => {
    return [
      index + 1,
      ...columns.map(column => {
        // Handle special eventName field
        if (column.key === 'eventName') {
          return getEventName ? getEventName(reg.eventId) : 'Unknown Event';
        }
        return formatCellValue(reg[column.key], column.key);
      })
    ];
  });

  // Split data into pages if needed
  const rowsPerPage = 20; // Adjust based on font size
  let currentPage = 0;
  let startY = 35;

  const addPage = (pageNum) => {
    if (pageNum > 0) {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      doc.setFontSize(18);
      doc.setTextColor(255, 102, 0);
      doc.text('BUC India - Event Registrations', 14, 15);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
      doc.text(`Total Registrations: ${registrations.length}`, 14, 28);
      doc.text(`Page ${pageNum + 1}`, 250, 28);
      return doc;
    }
    return null;
  };

  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(255, 102, 0);
  doc.text('BUC India - Event Registrations', 14, 15);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
  doc.text(`Total Registrations: ${registrations.length}`, 14, 28);
  if (options?.eventTitle) {
    doc.text(`Event: ${options.eventTitle}`, 14, 33);
  }

  // Choose font size based on number of columns to help fit on page
  const baseFontSize = columns.length > 10 ? 5 : 6;
  const headFontSize = columns.length > 10 ? 6 : 7;
  const cellPadding = columns.length > 10 ? 1.5 : 2;

  // Add table with dynamic headers and proper column widths
  doc.autoTable({
    startY: options?.eventTitle ? 38 : startY,
    head: [['S.No', ...columns.map(col => col.label)]],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [255, 102, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: headFontSize
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    styles: {
      textColor: [0, 0, 0],
      fontSize: baseFontSize,
      cellPadding: cellPadding,
      overflow: 'linebreak',
      cellWidth: 'wrap',
      halign: 'left',
      valign: 'top'
    },
    didParseCell: function (data) {
      // Wrap text in cells
      if (data.cell.text && data.cell.text.length > 0) {
        const text = data.cell.text[0];
        if (text && text.length > 50) {
          // Split long text into multiple lines
          const words = text.split(' ');
          let lines = [];
          let currentLine = '';
          
          words.forEach(word => {
            if ((currentLine + word).length > 50) {
              if (currentLine) lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine += (currentLine ? ' ' : '') + word;
            }
          });
          if (currentLine) lines.push(currentLine);
          
          data.cell.text = lines;
        }
      }
    },
    columnStyles: {
      0: { cellWidth: columnWidths[0] }, // S.No
      ...columns.reduce((acc, col, idx) => {
        acc[idx + 1] = { cellWidth: columnWidths[idx + 1] };
        return acc;
      }, {})
    },
    margin: { left: 14, right: 14, top: options?.eventTitle ? 38 : 35 },
    tableWidth: 'auto',
    showHead: 'everyPage',
    didDrawPage: function (data) {
      // Add page number
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${data.pageNumber}`, 250, doc.internal.pageSize.height - 10);
    }
  });

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `BUC_Registrations_${timestamp}.pdf`;

  // Save file
  doc.save(filename);
};