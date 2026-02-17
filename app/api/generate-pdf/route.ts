import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, PDFPage, StandardFonts } from 'pdf-lib';

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

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const headerFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    const margin = 36;
    const colWidths = { media: 120, screen: 100, startDate: 140, endDate: 170, duration: 70 };
    const rowHeight = 20;

    let yPosition = height - margin - 30;

    // Draw column headers
    const headerColumnNames = ['Media Name', 'Screen Name', 'Start Date', 'End Date', 'Duration  (s)'];
    const headerColumns = [
      { width: colWidths.media, name: headerColumnNames[0] },
      { width: colWidths.screen, name: headerColumnNames[1] },
      { width: colWidths.startDate, name: headerColumnNames[2] },
      { width: colWidths.endDate, name: headerColumnNames[3] },
      { width: colWidths.duration, name: headerColumnNames[4] },
    ];

    let xPos = margin;
    for (const col of headerColumns) {
      page.drawRectangle({
        x: xPos,
        y: yPosition - rowHeight,
        width: col.width,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      page.drawText(col.name, {
        x: xPos + 5,
        y: yPosition - rowHeight + 6,
        size: 9,
        color: rgb(0, 0, 0),
        font: headerFont,
      });
      xPos += col.width;
    }

    // Draw bottom border for header
    page.drawLine({
      start: { x: margin, y: yPosition - rowHeight },
      end: { x: margin + colWidths.media + colWidths.screen + colWidths.startDate + colWidths.endDate + colWidths.duration, y: yPosition - rowHeight },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    yPosition -= rowHeight + 5;

    // Generate rows
    const durationNum = parseInt(duration);
    const gapNum = parseInt(gap || '0');
    let current = new Date(start);

    while (current <= end) {
      const adEnd = new Date(current.getTime() + durationNum * 1000);

      if (adEnd > end) break;

      // Check if we need a new page
      if (yPosition < margin + rowHeight + 20) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = height - margin - 30;
      }

      // Draw row cells
      const rowData = [
        mediaName,
        screenName,
        current.toISOString().slice(0, 19).replace('T', ' '),
        adEnd.toISOString().slice(0, 19).replace('T', ' '),
        durationNum.toString(),
      ];

      xPos = margin;
      const cols = [
        { width: colWidths.media, value: rowData[0], color: rgb(0, 0, 0) },
        { width: colWidths.screen, value: rowData[1], color: rgb(0, 0, 0) },
        { width: colWidths.startDate, value: rowData[2], color: rgb(0, 0, 0) },
        { width: colWidths.endDate, value: rowData[3], color: rgb(0, 0, 0) },
        { width: colWidths.duration, value: rowData[4], color: rgb(0, 0, 0) },
      ];

      for (const col of cols) {
        page.drawText(col.value, {
          x: xPos + 5,
          y: yPosition - rowHeight + 6,
          size: 8,
          color: col.color,
        });
        xPos += col.width;
      }

      yPosition -= rowHeight;

      // Move to next slot
      current = new Date(current.getTime() + (durationNum + gapNum) * 1000);
    }

    // Save and return PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    const response = new NextResponse(pdfBuffer);
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', 'attachment; filename="daily_log.pdf"');
    return response;
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
