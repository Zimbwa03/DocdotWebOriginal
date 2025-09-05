import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export class PDFGenerator {
  private browser: any = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async generateLectureNotesPDF(
    title: string,
    module: string,
    topic: string,
    transcript: string,
    notes: string,
    lecturer?: string,
    date?: string
  ): Promise<string> {
    await this.initialize();
    
    const page = await this.browser.newPage();
    
    // Create HTML content for the PDF
    const htmlContent = this.generateHTMLContent(title, module, topic, transcript, notes, lecturer, date);
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    await page.close();
    
    // Save PDF to file
    const fileName = this.generateFileName(title, module, date);
    const filePath = this.savePDF(fileName, pdfBuffer);
    
    return filePath;
  }

  private generateHTMLContent(
    title: string,
    module: string,
    topic: string,
    transcript: string,
    notes: string,
    lecturer?: string,
    date?: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Lecture Notes</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #3399FF;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #3399FF;
            font-size: 2.2em;
            margin: 0 0 10px 0;
            font-weight: 700;
        }
        
        .header .subtitle {
            color: #666;
            font-size: 1.1em;
            margin: 5px 0;
        }
        
        .lecture-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #3399FF;
        }
        
        .lecture-info h3 {
            margin: 0 0 10px 0;
            color: #3399FF;
            font-size: 1.2em;
        }
        
        .lecture-info p {
            margin: 5px 0;
            color: #555;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section h2 {
            color: #3399FF;
            font-size: 1.5em;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e9ecef;
        }
        
        .section h3 {
            color: #495057;
            font-size: 1.2em;
            margin: 20px 0 10px 0;
        }
        
        .transcript {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            line-height: 1.5;
        }
        
        .notes {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        
        .notes h1, .notes h2, .notes h3, .notes h4, .notes h5, .notes h6 {
            color: #3399FF;
            margin-top: 25px;
            margin-bottom: 15px;
        }
        
        .notes h1:first-child {
            margin-top: 0;
        }
        
        .notes ul, .notes ol {
            margin: 10px 0;
            padding-left: 25px;
        }
        
        .notes li {
            margin: 5px 0;
        }
        
        .notes strong {
            color: #3399FF;
            font-weight: 600;
        }
        
        .notes table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .notes table th,
        .notes table td {
            border: 1px solid #dee2e6;
            padding: 8px 12px;
            text-align: left;
        }
        
        .notes table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #3399FF;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 15px;
            }
            
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <div class="subtitle">${module}</div>
        ${topic ? `<div class="subtitle">Topic: ${topic}</div>` : ''}
        ${lecturer ? `<div class="subtitle">Lecturer: ${lecturer}</div>` : ''}
        ${date ? `<div class="subtitle">Date: ${new Date(date).toLocaleDateString()}</div>` : ''}
    </div>
    
    <div class="lecture-info">
        <h3>📚 Lecture Information</h3>
        <p><strong>Module:</strong> ${module}</p>
        ${topic ? `<p><strong>Topic:</strong> ${topic}</p>` : ''}
        ${lecturer ? `<p><strong>Lecturer:</strong> ${lecturer}</p>` : ''}
        ${date ? `<p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>` : ''}
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="section">
        <h2>📝 Complete Lecture Transcript</h2>
        <div class="transcript">${transcript}</div>
    </div>
    
    <div class="page-break"></div>
    
    <div class="section">
        <h2>🎓 AI-Generated Lecture Notes</h2>
        <div class="notes">${this.formatNotesForHTML(notes)}</div>
    </div>
    
    <div class="footer">
        <p>Generated by Docdot Lecture Assistant</p>
        <p>University of Zimbabwe Medical Education Platform</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
    `;
  }

  private formatNotesForHTML(notes: string): string {
    // Convert markdown-like formatting to HTML
    return notes
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
      .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[h|l])/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<[h|l])/g, '$1')
      .replace(/(<\/[h|l]>)<\/p>/g, '$1');
  }

  private generateFileName(title: string, module: string, date?: string): string {
    const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const cleanModule = module.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const dateStr = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    return `${cleanModule}_${cleanTitle}_${dateStr}.pdf`;
  }

  private savePDF(fileName: string, pdfBuffer: Buffer): string {
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'lecture-notes');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = join(uploadsDir, fileName);
    writeFileSync(filePath, pdfBuffer);
    
    console.log(`📄 PDF saved: ${filePath}`);
    return filePath;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const pdfGenerator = new PDFGenerator();
