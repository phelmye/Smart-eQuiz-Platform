/**
 * Export Helpers
 * Utility functions for exporting data to various formats
 */

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
}

/**
 * Convert data to CSV format
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: string[]
): string {
  if (data.length === 0) return '';

  const keys = headers || Object.keys(data[0]);
  const csvHeaders = keys.join(',');
  
  const csvRows = data.map(row => {
    return keys.map(key => {
      const value = row[key];
      // Handle values that might contain commas, quotes, or newlines
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Export data to CSV file
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
): void {
  const { filename = 'export.csv' } = options;
  
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to JSON file
 */
export function exportToJSON<T>(
  data: T,
  options: ExportOptions = {}
): void {
  const { filename = 'export.json' } = options;
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for filenames
 */
export function getDateForFilename(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(base: string, extension: string): string {
  return `${base}-${getDateForFilename()}.${extension}`;
}
