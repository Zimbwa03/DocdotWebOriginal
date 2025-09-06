// Alternative PDF generation using HTML export (browser-printable)
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface LectureData {
  title: string;
  module: string;
  topic: string;
  lecturer: string;
  date: string;
  notes: string;
  summary: string;
  keyPoints: string[];
  medicalTerms: Array<{term: string; definition: string}>;
}

export class PDFGenerator {
  
  async initialize() {
    // No initialization needed for HTML-based approach
    return Promise.resolve();
  }

  async generateLectureNotesPDF(lectureData: LectureData): Promise<string> {
    await this.initialize();
    
    // Create a printable HTML file instead of PDF
    const htmlContent = this.generatePrintableHTML(lectureData);
    
    // Save as HTML file that can be printed to PDF by browser
    const fileName = this.generateFileName(lectureData.title, lectureData.module, lectureData.date);
    const htmlFileName = fileName.replace('.pdf', '.html');
    const filePath = this.saveHTML(htmlFileName, htmlContent);
    
    return filePath;
  }

  private generatePrintableHTML(data: LectureData): string {
    const formattedDate = new Date(data.date).toLocaleDateString();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lecture Notes - ${data.title}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #3399FF;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #3399FF;
            margin-bottom: 10px;
        }
        .meta {
            color: #666;
            font-size: 14px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #3399FF;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .notes-content {
            white-space: pre-wrap;
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #3399FF;
            margin-bottom: 20px;
        }
        .key-points {
            list-style: none;
            padding: 0;
        }
        .key-points li {
            background: #f0f8ff;
            margin: 8px 0;
            padding: 10px;
            border-left: 3px solid #3399FF;
        }
        .medical-terms {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .term {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            border-left: 3px solid #3399FF;
        }
        .term-name {
            font-weight: bold;
            color: #3399FF;
            margin-bottom: 5px;
        }
        .print-info {
            margin-top: 30px;
            padding: 15px;
            background: #e3f2fd;
            border-radius: 5px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${data.title}</div>
        <div class="meta">
            Module: ${data.module} | Topic: ${data.topic}<br>
            Lecturer: ${data.lecturer} | Date: ${formattedDate}
        </div>
    </div>

    <div class="section">
        <div class="section-title">📝 Lecture Notes</div>
        <div class="notes-content">${data.notes || 'No notes available'}</div>
    </div>

    ${data.summary ? `
    <div class="section">
        <div class="section-title">📚 Summary</div>
        <div style="text-align: justify; line-height: 1.8;">
            ${data.summary}
        </div>
    </div>
    ` : ''}

    ${data.keyPoints && data.keyPoints.length > 0 ? `
    <div class="section">
        <div class="section-title">🎯 Key Learning Points</div>
        <ul class="key-points">
            ${data.keyPoints.map((point, index) => `
                <li><strong>${index + 1}.</strong> ${point}</li>
            `).join('')}
        </ul>
    </div>
    ` : ''}

    ${data.medicalTerms && data.medicalTerms.length > 0 ? `
    <div class="section">
        <div class="section-title">🧠 Medical Terminology</div>
        <div class="medical-terms">
            ${data.medicalTerms.map(term => `
                <div class="term">
                    <div class="term-name">${term.term}</div>
                    <div>${term.definition}</div>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <div class="print-info no-print">
        <strong>To save as PDF:</strong> Use your browser's print function (Ctrl+P) and select "Save as PDF"
    </div>

    <script>
        // Auto-trigger print dialog
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>`;
  }

  private generateFileName(title: string, module: string, date?: string): string {
    const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const cleanModule = module.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const dateStr = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    return `${cleanModule}_${cleanTitle}_${dateStr}.pdf`;
  }

  private saveHTML(fileName: string, htmlContent: string): string {
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'lecture-notes');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = join(uploadsDir, fileName);
    writeFileSync(filePath, htmlContent);
    
    console.log(`📄 HTML file saved: ${filePath}`);
    return filePath;
  }

  async close() {
    // No cleanup needed for HTML-based approach
    return Promise.resolve();
  }
}

export const pdfGenerator = new PDFGenerator();