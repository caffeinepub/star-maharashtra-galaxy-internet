import type { Registration, ExternalBlob } from '../../../backend';

/**
 * Download a single document from ExternalBlob
 */
async function downloadDocument(
  blob: ExternalBlob,
  filename: string
): Promise<void> {
  try {
    const bytes = await blob.getBytes();
    const file = new Blob([bytes], { type: 'image/jpeg' });
    const url = URL.createObjectURL(file);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error(`Failed to download ${filename}:`, error);
    throw new Error(`Failed to download ${filename}`);
  }
}

/**
 * Download all available documents for a registration
 */
export async function downloadAllDocuments(
  registration: Registration,
  customerName: string
): Promise<void> {
  const downloads: Promise<void>[] = [];
  const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_');

  // Download Aadhaar (index 0)
  if (registration.documents && registration.documents.length > 0) {
    downloads.push(
      downloadDocument(
        registration.documents[0],
        `${sanitizedName}_Aadhaar.jpg`
      )
    );
  }

  // Download PAN (index 1)
  if (registration.documents && registration.documents.length > 1) {
    downloads.push(
      downloadDocument(
        registration.documents[1],
        `${sanitizedName}_PAN.jpg`
      )
    );
  }

  // Download Payment Receipt (optional)
  if (registration.receipt) {
    downloads.push(
      downloadDocument(
        registration.receipt,
        `${sanitizedName}_PaymentReceipt.jpg`
      )
    );
  }

  // Download Applicant Photo (optional)
  if (registration.applicantPhoto) {
    downloads.push(
      downloadDocument(
        registration.applicantPhoto,
        `${sanitizedName}_ApplicantPhoto.jpg`
      )
    );
  }

  // Execute all downloads
  try {
    await Promise.all(downloads);
  } catch (error) {
    console.error('Error downloading documents:', error);
    throw error;
  }
}
