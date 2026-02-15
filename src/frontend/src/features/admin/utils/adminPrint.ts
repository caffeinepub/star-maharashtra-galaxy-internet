import type { Registration } from '../../../backend';
import { formatTimestamp } from './registrationDetails';

/**
 * Generate print-friendly HTML for a registration
 */
function generatePrintHTML(
  registration: Registration,
  customerName: string,
  customerPhone: string
): string {
  const { personalInfo, category, paymentMethod, router, termsAcceptedAt } = registration;

  // Document presence checklist
  const hasAadhaar = registration.documents && registration.documents.length > 0;
  const hasPAN = registration.documents && registration.documents.length > 1;
  const hasReceipt = !!registration.receipt;
  const hasApplicantPhoto = !!registration.applicantPhoto;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Customer Registration - ${customerName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          line-height: 1.6;
          color: #000;
          background: #fff;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 10px;
          color: #1a1a1a;
          border-bottom: 3px solid #000;
          padding-bottom: 10px;
        }
        h2 {
          font-size: 18px;
          margin-top: 30px;
          margin-bottom: 15px;
          color: #333;
          border-bottom: 2px solid #666;
          padding-bottom: 5px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 10px 20px;
          margin-bottom: 20px;
        }
        .label {
          font-weight: bold;
          color: #333;
        }
        .value {
          color: #000;
        }
        .document-checklist {
          margin-top: 10px;
        }
        .document-item {
          padding: 8px 0;
          border-bottom: 1px solid #ddd;
        }
        .document-item:last-child {
          border-bottom: none;
        }
        .status-present {
          color: #22c55e;
          font-weight: bold;
        }
        .status-missing {
          color: #ef4444;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #000;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <h1>Galaxy Internet - Customer Registration</h1>
      
      <h2>Personal Information</h2>
      <div class="info-grid">
        <div class="label">Full Name:</div>
        <div class="value">${customerName}</div>
        
        <div class="label">First Name:</div>
        <div class="value">${personalInfo.firstName || 'N/A'}</div>
        
        <div class="label">Middle Name:</div>
        <div class="value">${personalInfo.middleName || 'N/A'}</div>
        
        <div class="label">Surname:</div>
        <div class="value">${personalInfo.surname || 'N/A'}</div>
        
        <div class="label">Date of Birth:</div>
        <div class="value">${personalInfo.dateOfBirth || 'N/A'}</div>
        
        <div class="label">Email:</div>
        <div class="value">${personalInfo.emailId || 'N/A'}</div>
        
        <div class="label">Phone:</div>
        <div class="value">${customerPhone}</div>
        
        <div class="label">Address:</div>
        <div class="value">${personalInfo.address || 'N/A'}</div>
      </div>
      
      <h2>Service Details</h2>
      <div class="info-grid">
        <div class="label">Category:</div>
        <div class="value">${category}</div>
        
        <div class="label">Payment Method:</div>
        <div class="value">${paymentMethod}</div>
        
        <div class="label">Router:</div>
        <div class="value">${router}</div>
      </div>
      
      <h2>Terms & Conditions</h2>
      <div class="info-grid">
        <div class="label">Accepted At:</div>
        <div class="value">${formatTimestamp(termsAcceptedAt)}</div>
      </div>
      
      <h2>Document Checklist</h2>
      <div class="document-checklist">
        <div class="document-item">
          <span class="label">Aadhaar Card:</span>
          <span class="${hasAadhaar ? 'status-present' : 'status-missing'}">
            ${hasAadhaar ? '✓ Present' : '✗ Missing'}
          </span>
        </div>
        <div class="document-item">
          <span class="label">PAN Card:</span>
          <span class="${hasPAN ? 'status-present' : 'status-missing'}">
            ${hasPAN ? '✓ Present' : '✗ Missing'}
          </span>
        </div>
        <div class="document-item">
          <span class="label">Payment Receipt:</span>
          <span class="${hasReceipt ? 'status-present' : 'status-missing'}">
            ${hasReceipt ? '✓ Present' : '✗ Not Required / Missing'}
          </span>
        </div>
        <div class="document-item">
          <span class="label">Applicant Photo:</span>
          <span class="${hasApplicantPhoto ? 'status-present' : 'status-missing'}">
            ${hasApplicantPhoto ? '✓ Present' : '✗ Not Provided'}
          </span>
        </div>
      </div>
      
      <div class="footer">
        <p>Generated on: ${new Date().toLocaleString('en-US')}</p>
        <p>Galaxy Internet - Connect to the Future with Internet at Light Speed</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Open print dialog with registration details
 */
export function printRegistrationForm(
  registration: Registration,
  customerName: string,
  customerPhone: string
): void {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow pop-ups to print the registration form.');
    return;
  }

  const html = generatePrintHTML(registration, customerName, customerPhone);
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}
