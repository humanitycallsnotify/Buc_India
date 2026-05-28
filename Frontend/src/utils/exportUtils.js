import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getRegistrationTypeLabel, resolveClubName } from '../constants/registrationConstants';

export const STANDARD_EXPORT_FIELDS = [
  { key: 'fullName', label: 'Name' },
  { key: 'registrationType', label: 'Type' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'resolvedClubName', label: 'Club Name' },
  { key: 'city', label: 'City' },
  { key: 'registeredAt', label: 'Registration Date' },
];

const formatExportValue = (reg, columnKey, getEventName) => {
  if (columnKey === 'eventName') {
    return getEventName ? getEventName(reg.eventId) : 'Unknown Event';
  }
  if (columnKey === 'registrationType') {
    return getRegistrationTypeLabel(reg.registrationType);
  }
  if (columnKey === 'resolvedClubName' || columnKey === 'clubDisplay') {
    return reg.resolvedClubName || resolveClubName(reg);
  }
  if (columnKey === 'clubName' && reg.clubName === 'Others' && reg.clubNameCustom) {
    return reg.clubNameCustom;
  }
  if (columnKey === 'requestRidingGears') {
    return reg.requestRidingGears === true ? 'Yes' : 'No';
  }
  if (columnKey === 'requestedGears') {
    const value = reg.requestedGears;
    if (!value || typeof value !== 'object') return '';
    const gears = [];
    if (value.helmet) gears.push('Helmet');
    if (value.gloves) gears.push('Gloves');
    if (value.jacket) gears.push('Jacket');
    if (value.boots) gears.push('Boots');
    if (value.kneeGuards) gears.push('Knee Guards');
    if (value.elbowGuards) gears.push('Elbow Guards');
    return gears.join(', ');
  }
  if (columnKey === 'acceptedTerms') {
    return reg.acceptedTerms === true ? 'Yes' : 'No';
  }
  const keyLower = columnKey.toLowerCase();
  const value = reg[columnKey];
  if (
    (keyLower.includes('license') && keyLower.includes('image')) ||
    keyLower === 'profileimage' ||
    (keyLower.includes('proof') && typeof value === 'string' && value.length > 100)
  ) {
    return value ? '[Image Attached]' : '';
  }
  if (columnKey === 'registeredAt' || columnKey === 'createdAt' || keyLower.includes('date')) {
    if (!value) return '';
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date.toLocaleString('en-IN');
    } catch {
      /* ignore */
    }
  }
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export const buildExportColumns = (registrations, selectedFields = null) => {
  const standardKeys = STANDARD_EXPORT_FIELDS.map((f) => f.key);
  if (selectedFields?.length) {
    const cols = [];
    selectedFields.forEach((key) => {
      const std = STANDARD_EXPORT_FIELDS.find((f) => f.key === key);
      if (std) cols.push(std);
      else cols.push({ key, label: formatColumnName(key) });
    });
    if (selectedFields.includes('eventName') && !cols.find((c) => c.key === 'eventName')) {
      cols.push({ key: 'eventName', label: 'Event Name' });
    }
    return cols;
  }
  const dynamic = getExportColumns(registrations);
  const hasClub = dynamic.some((c) => c.key === 'resolvedClubName' || c.key === 'clubName');
  if (!hasClub) {
    dynamic.splice(4, 0, { key: 'resolvedClubName', label: 'Club Name' });
  }
  return dynamic;
};

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
  
  const excludeFields = [
    '_id',
    'eventId',
    'licenseImagePublicId',
    'licenseImage',
    'profileImage',
    'profileImagePublicId',
    '__v',
    'createdAt',
    'updatedAt',
  ];
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

  const columns = buildExportColumns(registrations, selectedFields);

  const excelData = registrations.map((reg, index) => {
    const row = { 'S.No': index + 1 };
    columns.forEach((column) => {
      let cell = formatExportValue(reg, column.key, getEventName);
      if (cell.length > 32767) cell = cell.substring(0, 32764) + '...';
      row[column.label] = cell;
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

  const columns = buildExportColumns(registrations, selectedFields);

  const formatCellValue = (value, columnKey) => {
    // Handle license proof/images - show indicator instead of base64
    const keyLower = columnKey.toLowerCase();
    if ((keyLower.includes('license') || keyLower.includes('proof') || keyLower.includes('document') || keyLower === 'image') && value) {
      if (typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('blob:') || value.length > 200)) {
        return '[Image Attached]';
      }
      return value;
    }
    
    // Handle riding gears
    if (columnKey === 'requestRidingGears') {
      return value === true ? 'Yes' : 'No';
    }
    if (columnKey === 'requestedGears') {
      if (!value || typeof value !== 'object') {
        return '-';
      }
      const gears = [];
      if (value.helmet) gears.push('Helmet');
      if (value.gloves) gears.push('Gloves');
      if (value.jacket) gears.push('Jacket');
      if (value.boots) gears.push('Boots');
      if (value.kneeGuards) gears.push('Knee Guards');
      if (value.elbowGuards) gears.push('Elbow Guards');
      return gears.length > 0 ? gears.join(', ') : '-';
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
        const value = formatCellValue(formatExportValue(reg, col.key, getEventName), col.key);
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

  const tableData = registrations.map((reg, index) => [
    index + 1,
    ...columns.map((column) => {
      const raw = formatExportValue(reg, column.key, getEventName);
      return formatCellValue(raw, column.key);
    }),
  ]);

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

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const exportToDocx = (
  registrations,
  getEventName,
  selectedFields = null,
  options = {},
) => {
  if (!registrations || registrations.length === 0) {
    alert('No data to export');
    return;
  }

  let columns = selectedFields?.length
    ? STANDARD_EXPORT_FIELDS.filter((c) => selectedFields.includes(c.key))
    : STANDARD_EXPORT_FIELDS;

  if (columns.length === 0) {
    columns = STANDARD_EXPORT_FIELDS;
  }

  const headerRow = columns
    .map(
      (col) =>
        `<th style="background:#C19A6B;color:#fff;padding:8px;border:1px solid #ddd;">${escapeHtml(col.label)}</th>`,
    )
    .join('');

  const bodyRows = registrations
    .map((reg) => {
      const cells = columns
        .map((col) => {
          const text =
            col.key === 'fullName'
              ? String(reg.fullName || reg.name || '-')
              : formatExportValue(reg, col.key, getEventName);
          return `<td style="padding:8px;border:1px solid #ddd;">${escapeHtml(text || '-')}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8">
      <title>BUC India Registrations</title>
    </head>
    <body>
      <h1 style="color:#C19A6B;font-family:Segoe UI,sans-serif;">BUC India — Registrations</h1>
      <p style="font-family:Segoe UI,sans-serif;color:#555;">
        Generated: ${escapeHtml(new Date().toLocaleString('en-IN'))}
        ${options?.eventTitle ? ` | Event: ${escapeHtml(options.eventTitle)}` : ''}
      </p>
      <table style="border-collapse:collapse;width:100%;font-family:Segoe UI,sans-serif;font-size:12px;">
        <thead><tr>${headerRow}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `BUC_Registrations_${new Date().toISOString().split('T')[0]}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};