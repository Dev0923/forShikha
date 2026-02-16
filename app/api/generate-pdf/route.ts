import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const {
      mediaName,
      screenName,
      startDate,
      endDate,
      duration,
      gap,
    } = body;

    // Validate inputs
    if (!mediaName || !screenName || !startDate || !endDate || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdf = new PDFDocument({
      margin: 36,
      size: 'A4',
    });

    // Header
    pdf.fontSize(20).font('Helvetica-Bold').text('Daily Advertisement Log', { align: 'center' });
    pdf.moveDown(1);

    // Table header
    const tableTop = pdf.y;
    const colWidths = { media: 100, screen: 90, startDate: 110, endDate: 110, duration: 70 };
    const rowHeight = 25;

    // Draw header row background
    pdf.rect(36, tableTop, 36 + colWidths.media + colWidths.screen + colWidths.startDate + colWidths.endDate + colWidths.duration, rowHeight).fillAndStroke('lightgray', 'black');

    // Header text
    pdf.fontSize(10).font('Helvetica-Bold').fillColor('black');
    let xPos = 40;
    pdf.text('Media Name', xPos, tableTop + 5, { width: colWidths.media, align: 'left' });
    xPos += colWidths.media;
    pdf.text('Screen Name', xPos, tableTop + 5, { width: colWidths.screen, align: 'left' });
    xPos += colWidths.screen;
    pdf.text('Start Date', xPos, tableTop + 5, { width: colWidths.startDate, align: 'left' });
    xPos += colWidths.startDate;
    pdf.text('End Date', xPos, tableTop + 5, { width: colWidths.endDate, align: 'left' });
    xPos += colWidths.endDate;
    pdf.text('Duration (s)', xPos, tableTop + 5, { width: colWidths.duration, align: 'left' });

    pdf.moveDown(2.5);

    // Generate rows
    pdf.fontSize(9).font('Helvetica').fillColor('black');
    const durationNum = parseInt(duration);
    const gapNum = parseInt(gap || '0');
    let current = new Date(start);

    while (current <= end) {
      const adEnd = new Date(current.getTime() + durationNum * 1000);

      if (adEnd > end) break;

      const currentY = pdf.y;

      // Draw row grid
      pdf.rect(36, currentY, 36 + colWidths.media + colWidths.screen + colWidths.startDate + colWidths.endDate + colWidths.duration, rowHeight).stroke('black');

      xPos = 40;
      pdf.text(mediaName, xPos, currentY + 5, { width: colWidths.media, align: 'left' });
      xPos += colWidths.media;
      pdf.text(screenName, xPos, currentY + 5, { width: colWidths.screen, align: 'left' });
      xPos += colWidths.screen;
      pdf.text(current.toISOString().slice(0, 19).replace('T', ' '), xPos, currentY + 5, {
        width: colWidths.startDate,
        align: 'left',
      });
      xPos += colWidths.startDate;
      pdf.text(adEnd.toISOString().slice(0, 19).replace('T', ' '), xPos, currentY + 5, {
        width: colWidths.endDate,
        align: 'left',
      });
      xPos += colWidths.endDate;
      pdf.text(durationNum.toString(), xPos, currentY + 5, { width: colWidths.duration, align: 'left' });

      pdf.moveDown(2.5);

      // Move to next slot
      current = new Date(current.getTime() + (durationNum + gapNum) * 1000);
    }

    // Convert PDF to buffer
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      
      pdf.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      pdf.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const response = new NextResponse(buffer);
        response.headers.set('Content-Type', 'application/pdf');
        response.headers.set('Content-Disposition', 'attachment; filename="daily_log.pdf"');
        resolve(response);
      });

      pdf.end();
    }) as Promise<Response>;
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
