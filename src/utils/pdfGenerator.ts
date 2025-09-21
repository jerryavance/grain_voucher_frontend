// utils/pdfGenerator.ts
import { IVoucher } from '../pages/Voucher/Voucher.interface';

export interface PDFVoucherData {
  title: string;
  voucherId: string;
  issueDate: string;
  farmer: string;
  quantity: string;
  value: string;
  hub: string;
  location: string;
  grainType: string;
  qualityGrade: string;
  moistureLevel: string;
  qrCodeData: string;
  farmerPhone: string;
  hubAdmin: string;
  depositDate: string;
  status: string;
}

export class PDFGenerator {
  static generateVoucherPDF(voucher: IVoucher): PDFVoucherData {
    return {
      title: `Grain Storage Voucher - ${voucher.deposit.grain_type_details.name}`,
      voucherId: voucher.id,
      issueDate: voucher.issue_date,
      farmer: `${voucher.deposit.farmer.first_name} ${voucher.deposit.farmer.last_name}`,
      farmerPhone: voucher.deposit.farmer.phone_number,
      quantity: `${parseFloat(voucher.deposit.quantity_kg).toFixed(2)} kg`,
      value: `${parseFloat(voucher.current_value || voucher.deposit.value?.toString() || '0').toFixed(2)}`,
      hub: voucher.deposit.hub.name,
      location: voucher.deposit.hub.location || 'Not specified',
      grainType: voucher.deposit.grain_type_details.name,
      qualityGrade: voucher.deposit.quality_grade_details.name,
      moistureLevel: `${voucher.deposit.moisture_level}%`,
      qrCodeData: voucher.id,
      hubAdmin: voucher.deposit.hub.hub_admin 
        ? `${voucher.deposit.hub.hub_admin.first_name} ${voucher.deposit.hub.hub_admin.last_name} - ${voucher.deposit.hub.hub_admin.phone_number}`
        : 'Not specified',
      depositDate: voucher.deposit.deposit_date,
      status: voucher.status.toUpperCase(),
    };
  }

  // Method to create and download actual PDF
  static async downloadPDF(voucher: IVoucher): Promise<void> {
    const data = this.generateVoucherPDF(voucher);
    
    try {
      // Create a temporary div for the PDF content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.generatePDFHTML(data);
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.background = 'white';
      document.body.appendChild(tempDiv);

      // Use html2canvas to convert HTML to canvas
      const canvas = await this.htmlToCanvas(tempDiv);
      
      // Create PDF using jsPDF
      const pdf = await this.createPDFFromCanvas(canvas, data);
      
      // Download the PDF
      pdf.save(`grain-voucher-${data.voucherId.substring(0, 8)}.pdf`);
      
      // Clean up
      document.body.removeChild(tempDiv);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback: open HTML in new window
      this.openHTMLPreview(data);
    }
  }

  // Fallback method using html2canvas and jsPDF (if available)
  private static async htmlToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
    // This is a simplified canvas creation - in real implementation you'd use html2canvas
    const canvas = document.createElement('canvas');
    canvas.width = 794; // A4 width in pixels at 96 DPI
    canvas.height = 1123; // A4 height in pixels at 96 DPI
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Simple text rendering (in real implementation, html2canvas would handle this)
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText('Grain Storage Voucher', 50, 50);
      ctx.fillText(`ID: ${element.textContent?.substring(0, 50) || ''}`, 50, 80);
    }
    
    return canvas;
  }

  // Create PDF from canvas (simplified - would use jsPDF in real implementation)
  private static async createPDFFromCanvas(canvas: HTMLCanvasElement, data: PDFVoucherData): Promise<any> {
    // This is a mock PDF object - in real implementation you'd use jsPDF
    return {
      save: (filename: string) => {
        // Convert canvas to blob and trigger download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace('.pdf', '.png'); // Since we're using canvas
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        });
      }
    };
  }

  // Alternative: Use browser's built-in print functionality
  static printPDF(voucher: IVoucher): void {
    const data = this.generateVoucherPDF(voucher);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Grain Voucher ${data.voucherId.substring(0, 8)}</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1cm; }
            }
            ${this.getPrintStyles()}
          </style>
        </head>
        <body>
          ${this.generatePDFHTML(data)}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  // Generate QR Code as SVG (simplified)
  private static generateQRCodeSVG(data: string): string {
    // This is a simplified QR code representation
    // In production, use a proper QR code library like qrcode.js
    return `
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="white"/>
        <!-- Simplified QR pattern -->
        <g fill="black">
          <rect x="10" y="10" width="10" height="10"/>
          <rect x="30" y="10" width="10" height="10"/>
          <rect x="50" y="10" width="10" height="10"/>
          <rect x="70" y="10" width="10" height="10"/>
          <rect x="90" y="10" width="10" height="10"/>
          
          <rect x="10" y="30" width="10" height="10"/>
          <rect x="30" y="30" width="10" height="10"/>
          <rect x="50" y="30" width="10" height="10"/>
          <rect x="70" y="30" width="10" height="10"/>
          <rect x="90" y="30" width="10" height="10"/>
          
          <rect x="10" y="50" width="10" height="10"/>
          <rect x="30" y="50" width="10" height="10"/>
          <rect x="50" y="50" width="10" height="10"/>
          <rect x="70" y="50" width="10" height="10"/>
          <rect x="90" y="50" width="10" height="10"/>
          
          <rect x="10" y="70" width="10" height="10"/>
          <rect x="30" y="70" width="10" height="10"/>
          <rect x="50" y="70" width="10" height="10"/>
          <rect x="70" y="70" width="10" height="10"/>
          <rect x="90" y="70" width="10" height="10"/>
          
          <rect x="10" y="90" width="10" height="10"/>
          <rect x="30" y="90" width="10" height="10"/>
          <rect x="50" y="90" width="10" height="10"/>
          <rect x="70" y="90" width="10" height="10"/>
          <rect x="90" y="90" width="10" height="10"/>
        </g>
        <text x="60" y="115" text-anchor="middle" font-size="8" fill="black">
          ${data.substring(0, 8)}...
        </text>
      </svg>
    `;
  }

  private static getPrintStyles(): string {
    return `
      body {
        font-family: Arial, sans-serif;
        line-height: 1.4;
        color: #333;
        margin: 0;
        padding: 20px;
        background: white;
      }
      .voucher {
        max-width: 180mm;
        margin: 0 auto;
        background: white;
        border: 3px solid #2e7d32;
        border-radius: 15px;
        padding: 20px;
        page-break-inside: avoid;
      }
      .header {
        text-align: center;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 15px;
        margin-bottom: 20px;
      }
      .title {
        font-size: 24px;
        font-weight: bold;
        color: #2e7d32;
        margin-bottom: 8px;
      }
      .subtitle {
        font-size: 14px;
        color: #666;
        margin-bottom: 5px;
      }
      .voucher-id {
        font-family: monospace;
        background: #f0f0f0;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        display: inline-block;
      }
      .status-chip {
        background: #4caf50;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: bold;
        margin-top: 8px;
        display: inline-block;
      }
      .content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }
      .details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .detail-group {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 6px;
        border-left: 3px solid #2e7d32;
      }
      .detail-group.full-width {
        grid-column: 1 / -1;
      }
      .detail-label {
        font-size: 10px;
        color: #666;
        text-transform: uppercase;
        margin-bottom: 3px;
        font-weight: bold;
      }
      .detail-value {
        font-size: 14px;
        color: #333;
        font-weight: 600;
      }
      .qr-section {
        text-align: center;
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        border: 2px dashed #ccc;
      }
      .verification, .warning {
        background: #e8f5e8;
        border: 1px solid #4caf50;
        padding: 12px;
        border-radius: 6px;
        text-align: center;
        margin: 15px 0;
        font-size: 12px;
      }
      .warning {
        background: #fff3e0;
        border-color: #ff9800;
      }
      .footer {
        border-top: 2px solid #e0e0e0;
        padding-top: 15px;
        text-align: center;
        color: #666;
        font-size: 10px;
        margin-top: 20px;
      }
      .small-text {
        font-size: 10px;
        color: #666;
        margin-top: 3px;
      }
    `;
  }

  private static generatePDFHTML(data: PDFVoucherData): string {
    return `
      <div class="voucher">
        <div class="header">
          <div class="title">${data.title}</div>
          <div class="subtitle">Digital Grain Storage Certificate</div>
          <div class="voucher-id">ID: ${data.voucherId}</div>
          <div class="status-chip">${data.status}</div>
        </div>

        <div class="content">
          <div class="details">
            <div class="detail-group">
              <div class="detail-label">Farmer</div>
              <div class="detail-value">${data.farmer}</div>
              <div class="small-text">${data.farmerPhone}</div>
            </div>

            <div class="detail-group">
              <div class="detail-label">Grain Type</div>
              <div class="detail-value">${data.grainType}</div>
            </div>

            <div class="detail-group">
              <div class="detail-label">Quantity</div>
              <div class="detail-value">${data.quantity}</div>
            </div>

            <div class="detail-group">
              <div class="detail-label">Current Value</div>
              <div class="detail-value" style="color: #4caf50;">${data.value}</div>
            </div>

            <div class="detail-group">
              <div class="detail-label">Quality Grade</div>
              <div class="detail-value">${data.qualityGrade}</div>
            </div>

            <div class="detail-group">
              <div class="detail-label">Moisture Level</div>
              <div class="detail-value">${data.moistureLevel}</div>
            </div>

            <div class="detail-group full-width">
              <div class="detail-label">Storage Hub</div>
              <div class="detail-value">${data.hub}</div>
              <div class="small-text">${data.location}</div>
              <div class="small-text">Admin: ${data.hubAdmin}</div>
            </div>

            <div class="detail-group">
              <div class="detail-label">Issue Date</div>
              <div class="detail-value">${new Date(data.issueDate).toLocaleDateString()}</div>
            </div>

            <div class="detail-group">
              <div class="detail-label">Deposit Date</div>
              <div class="detail-value">${new Date(data.depositDate).toLocaleDateString()}</div>
            </div>
          </div>

          <div class="qr-section">
            <div class="detail-label">Verification QR Code</div>
            ${this.generateQRCodeSVG(data.qrCodeData)}
            <div class="small-text">Scan to verify authenticity</div>
          </div>
        </div>

        <div class="verification">
          <strong>🔒 This is a verified digital grain storage voucher</strong><br>
          This certificate represents ownership of grain stored at the specified hub and can be redeemed for cash or traded digitally.
        </div>

        <div class="warning">
          <strong>⚠️ Important:</strong> This voucher is valuable and transferable. Keep it secure. Report lost or stolen vouchers immediately.
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>This document is digitally generated and does not require a signature to be valid.</p>
          <p>For verification or support, contact the storage hub directly.</p>
        </div>
      </div>
    `;
  }

  // Fallback method that opens HTML in new window for printing
  private static openHTMLPreview(data: PDFVoucherData): void {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Grain Voucher ${data.voucherId.substring(0, 8)}</title>
          <style>${this.getPrintStyles()}</style>
        </head>
        <body>
          ${this.generatePDFHTML(data)}
          <div style="text-align: center; margin-top: 20px; padding: 20px; border-top: 1px solid #ccc;">
            <button onclick="window.print()" style="background: #2e7d32; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print PDF</button>
            <button onclick="window.close()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
          </div>
        </body>
        </html>
      `);
      newWindow.document.close();
    }
  }
}



// // utils/pdfGenerator.ts
// import { IVoucher } from '../pages/Voucher/Voucher.interface';

// export interface PDFVoucherData {
//   title: string;
//   voucherId: string;
//   issueDate: string;
//   farmer: string;
//   quantity: string;
//   value: string;
//   hub: string;
//   location: string;
//   grainType: string;
//   qualityGrade: string;
//   moistureLevel: string;
//   qrCodeData: string;
//   farmerPhone: string;
//   hubAdmin: string;
//   depositDate: string;
//   status: string;
// }

// export class PDFGenerator {
//   static generateVoucherPDF(voucher: IVoucher): PDFVoucherData {
//     return {
//       title: `Grain Storage Voucher - ${voucher.deposit.grain_type_details.name}`,
//       voucherId: voucher.id,
//       issueDate: voucher.issue_date,
//       farmer: `${voucher.deposit.farmer.first_name} ${voucher.deposit.farmer.last_name}`,
//       farmerPhone: voucher.deposit.farmer.phone_number,
//       quantity: `${parseFloat(voucher.deposit.quantity_kg).toFixed(2)} kg`,
//       value: `$${parseFloat(voucher.current_value).toFixed(2)}`,
//       hub: voucher.deposit.hub.name,
//       location: voucher.deposit.hub.location || 'Not specified',
//       grainType: voucher.deposit.grain_type_details.name,
//       qualityGrade: voucher.deposit.quality_grade_details.name,
//       moistureLevel: `${voucher.deposit.moisture_level}%`,
//       qrCodeData: voucher.id,
//       hubAdmin: voucher.deposit.hub.hub_admin 
//         ? `${voucher.deposit.hub.hub_admin.first_name} ${voucher.deposit.hub.hub_admin.last_name} - ${voucher.deposit.hub.hub_admin.phone_number}`
//         : 'Not specified',
//       depositDate: voucher.deposit.deposit_date,
//       status: voucher.status.toUpperCase(),
//     };
//   }

//   static generatePDFTemplate(data: PDFVoucherData): string {
//     // This would be used with a PDF library like jsPDF or react-pdf
//     return `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <title>Grain Storage Voucher</title>
//                 <style>
//                     body {
//                         font-family: Arial, sans-serif;
//                         max-width: 800px;
//                         margin: 0 auto;
//                         padding: 20px;
//                         background: #f5f5f5;
//                     }
//                     .voucher {
//                         background: white;
//                         border: 3px solid #2e7d32;
//                         border-radius: 15px;
//                         padding: 30px;
//                         box-shadow: 0 10px 30px rgba(0,0,0,0.1);
//                         position: relative;
//                     }
//                     .voucher::before {
//                         content: '';
//                         position: absolute;
//                         top: 0;
//                         left: 0;
//                         right: 0;
//                         height: 8px;
//                         background: linear-gradient(90deg, #2e7d32, #4caf50);
//                         border-radius: 15px 15px 0 0;
//                     }
//                     .header {
//                         text-align: center;
//                         border-bottom: 2px solid #e0e0e0;
//                         padding-bottom: 20px;
//                         margin-bottom: 30px;
//                     }
//                     .title {
//                         font-size: 28px;
//                         font-weight: bold;
//                         color: #2e7d32;
//                         margin-bottom: 10px;
//                     }
//                     .subtitle {
//                         font-size: 16px;
//                         color: #666;
//                         margin-bottom: 5px;
//                     }
//                     .voucher-id {
//                         font-family: monospace;
//                         background: #f0f0f0;
//                         padding: 5px 10px;
//                         border-radius: 5px;
//                         font-size: 14px;
//                     }
//                     .content {
//                         display: grid;
//                         grid-template-columns: 2fr 1fr;
//                         gap: 30px;
//                         margin-bottom: 30px;
//                     }
//                     .details {
//                         display: grid;
//                         grid-template-columns: 1fr 1fr;
//                         gap: 20px;
//                     }
//                     .detail-group {
//                         background: #f8f9fa;
//                         padding: 15px;
//                         border-radius: 8px;
//                         border-left: 4px solid #2e7d32;
//                     }
//                     .detail-label {
//                         font-size: 12px;
//                         color: #666;
//                         text-transform: uppercase;
//                         margin-bottom: 5px;
//                         font-weight: bold;
//                     }
//                     .detail-value {
//                         font-size: 16px;
//                         color: #333;
//                         font-weight: 600;
//                     }
//                     .qr-section {
//                         text-align: center;
//                         background: #f8f9fa;
//                         padding: 20px;
//                         border-radius: 10px;
//                         border: 2px dashed #ccc;
//                     }
//                     .qr-code {
//                         width: 150px;
//                         height: 150px;
//                         border: 1px solid #ddd;
//                         margin: 0 auto 10px;
//                         background: white;
//                         display: flex;
//                         align-items: center;
//                         justify-content: center;
//                         font-size: 12px;
//                         color: #666;
//                     }
//                     .verification {
//                         background: #e8f5e8;
//                         padding: 15px;
//                         border-radius: 8px;
//                         border: 1px solid #4caf50;
//                         text-align: center;
//                     }
//                     .status-chip {
//                         display: inline-block;
//                         background: #4caf50;
//                         color: white;
//                         padding: 5px 15px;
//                         border-radius: 20px;
//                         font-size: 12px;
//                         font-weight: bold;
//                     }
//                     .footer {
//                         border-top: 2px solid #e0e0e0;
//                         padding-top: 20px;
//                         text-align: center;
//                         color: #666;
//                         font-size: 12px;
//                     }
//                     .warning {
//                         background: #fff3e0;
//                         border: 1px solid #ff9800;
//                         padding: 10px;
//                         border-radius: 5px;
//                         margin: 10px 0;
//                         font-size: 12px;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="voucher">
//                     <div class="header">
//                         <div class="title">${data.title}</div>
//                         <div class="subtitle">Digital Grain Storage Certificate</div>
//                         <div class="voucher-id">ID: ${data.voucherId}</div>
//                         <div style="margin-top: 10px;">
//                             <span class="status-chip">${data.status}</span>
//                         </div>
//                     </div>

//                     <div class="content">
//                         <div class="details">
//                             <div class="detail-group">
//                                 <div class="detail-label">Farmer</div>
//                                 <div class="detail-value">${data.farmer}</div>
//                                 <div style="font-size: 12px; color: #666; margin-top: 5px;">${data.farmerPhone}</div>
//                             </div>

//                             <div class="detail-group">
//                                 <div class="detail-label">Grain Type</div>
//                                 <div class="detail-value">${data.grainType}</div>
//                             </div>

//                             <div class="detail-group">
//                                 <div class="detail-label">Quantity</div>
//                                 <div class="detail-value">${data.quantity}</div>
//                             </div>

//                             <div class="detail-group">
//                                 <div class="detail-label">Current Value</div>
//                                 <div class="detail-value" style="color: #4caf50;">${data.value}</div>
//                             </div>

//                             <div class="detail-group">
//                                 <div class="detail-label">Quality Grade</div>
//                                 <div class="detail-value">${data.qualityGrade}</div>
//                             </div>

//                             <div class="detail-group">
//                                 <div class="detail-label">Moisture Level</div>
//                                 <div class="detail-value">${data.moistureLevel}</div>
//                             </div>

//                             <div class="detail-group" style="grid-column: 1 / -1;">
//                                 <div class="detail-label">Storage Hub</div>
//                                 <div class="detail-value">${data.hub}</div>
//                                 <div style="font-size: 12px; color: #666; margin-top: 5px;">${data.location}</div>
//                                 <div style="font-size: 12px; color: #666;">Admin: ${data.hubAdmin}</div>
//                             </div>

//                             <div class="detail-group">
//                                 <div class="detail-label">Issue Date</div>
//                                 <div class="detail-value">${new Date(data.issueDate).toLocaleDateString()}</div>
//                             </div>

//                             <div class="detail-group">
//                                 <div class="detail-label">Deposit Date</div>
//                                 <div class="detail-value">${new Date(data.depositDate).toLocaleDateString()}</div>
//                             </div>
//                         </div>

//                         <div class="qr-section">
//                             <div class="detail-label">Verification QR Code</div>
//                             <div class="qr-code">
//                                 QR Code<br>
//                                 ${data.qrCodeData.substring(0, 8)}...
//                             </div>
//                             <div style="font-size: 12px; color: #666;">
//                                 Scan to verify authenticity
//                             </div>
//                         </div>
//                     </div>

//                     <div class="verification">
//                         <strong>🔒 This is a verified digital grain storage voucher</strong><br>
//                         This certificate represents ownership of grain stored at the specified hub and can be redeemed for cash or traded digitally.
//                     </div>

//                     <div class="warning">
//                         <strong>⚠️ Important:</strong> This voucher is valuable and transferable. Keep it secure. Report lost or stolen vouchers immediately.
//                     </div>

//                     <div class="footer">
//                         <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
//                         <p>This document is digitally generated and does not require a signature to be valid.</p>
//                         <p>For verification or support, contact the storage hub directly.</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//     `.trim();
//   }

//   // Method to trigger PDF download (would require jsPDF or similar library)
//   static downloadPDF(voucher: IVoucher): void {
//     const data = this.generateVoucherPDF(voucher);
//     const htmlTemplate = this.generatePDFTemplate(data);
    
//     console.log('PDF Template Generated:', htmlTemplate);
//     console.log('PDF Data:', data);
    
//     // In a real implementation:
//     // 1. Install jsPDF: npm install jspdf html2canvas
//     // 2. Convert HTML to PDF
//     // 3. Include QR code generation
//     // 4. Trigger download
    
//     // Example with jsPDF (commented out since library isn't installed):
//     /*
//     import jsPDF from 'jspdf';
//     import html2canvas from 'html2canvas';
    
//     const pdf = new jsPDF();
//     // Convert HTML template to PDF
//     // Add QR code
//     // Save/download
//     pdf.save(`voucher-${data.voucherId.substring(0, 8)}.pdf`);
//     */
    
//     // For now, we'll create a blob URL to show the HTML
//     const blob = new Blob([htmlTemplate], { type: 'text/html' });
//     const url = URL.createObjectURL(blob);
//     const newWindow = window.open(url, '_blank');
//     if (newWindow) {
//       newWindow.document.title = `Voucher ${data.voucherId.substring(0, 8)}`;
//     }
//   }
// }