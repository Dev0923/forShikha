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
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    const leftMargin = 75;
    const rightMargin = 100;
    const colWidths = { media: 135, screen: 85, startDate: 110, endDate: 110, duration: 40 };
    const colGap = 38; // Gap between columns
    const rowHeight = 19;
    const lineHeight = 1.4;

    let yPosition = height - leftMargin - 30;

    // Draw column headers (regular font, no bold, no background)
    const headerColumnNames = ['Media Name', 'Screen Name', 'Start Date', 'End Date', 'Duration  (s)'];
    const headerColumns = [
      { width: colWidths.media, name: headerColumnNames[0] },
      { width: colWidths.screen, name: headerColumnNames[1] },
      { width: colWidths.startDate, name: headerColumnNames[2] },
      { width: colWidths.endDate, name: headerColumnNames[3] },
      { width: colWidths.duration, name: headerColumnNames[4] },
    ];

    let xPos = leftMargin;
    for (const col of headerColumns) {
      // Draw header text (left-aligned, no background, no borders)
      page.drawText(col.name, {
        x: xPos,
        y: yPosition,
        size: 10,
        color: rgb(0, 0, 0),
        font: font,
      });
      xPos += col.width + colGap;
    }

    yPosition -= rowHeight + 5;

    // Generate rows
    const durationNum = parseInt(duration);
    const gapNum = parseInt(gap || '0');
    let current = new Date(start);

    while (current <= end) {
      const adEnd = new Date(current.getTime() + durationNum * 1000);

      if (adEnd > end) break;

      // Check if we need a new page
      if (yPosition < leftMargin + rowHeight + 20) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = height - leftMargin - 30;
      }

      // Draw row cells (borderless, left-aligned)
      const rowData = [
        mediaName,
        screenName,
        current.toISOString().slice(0, 19).replace('T', ' '),
        adEnd.toISOString().slice(0, 19).replace('T', ' '),
        durationNum.toString(),
      ];

      xPos = leftMargin;
      const cols = [
        { width: colWidths.media, value: rowData[0] },
        { width: colWidths.screen, value: rowData[1] },
        { width: colWidths.startDate, value: rowData[2] },
        { width: colWidths.endDate, value: rowData[3] },
        { width: colWidths.duration, value: rowData[4] },
      ];

      for (const col of cols) {
        // Draw text (no borders, left-aligned)
        page.drawText(col.value, {
          x: xPos,
          y: yPosition,
          size: 10,
          color: rgb(0, 0, 0),
          font: font,
        });
        xPos += col.width + colGap;
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
