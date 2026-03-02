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
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    const leftMargin = 20;
    const rightMargin = 55;
    const colWidths = { media: 135, screen: 85, startDate: 110, endDate: 110, duration: 40 };
    const rowHeight = 20;
    const cellPaddingLeft = 6;
    const cellPaddingTop = 4;
    
    // Define colors
    const borderColor = rgb(0.81, 0.81, 0.81); // #cfcfcf
    const headerBgColor = rgb(0.90, 0.90, 0.90); // #e6e6e6

    let yPosition = height - leftMargin - 30;

    // Draw column headers
    const headerColumnNames = ['Media Name', 'Screen Name', 'Start Date', 'End Date', 'Duration  (s)'];
    const headerColumns = [
      { width: colWidths.media, name: headerColumnNames[0], align: 'center' },
      { width: colWidths.screen, name: headerColumnNames[1], align: 'center' },
      { width: colWidths.startDate, name: headerColumnNames[2], align: 'center' },
      { width: colWidths.endDate, name: headerColumnNames[3], align: 'center' },
      { width: colWidths.duration, name: headerColumnNames[4], align: 'center' },
    ];

    let xPos = leftMargin;
    for (const col of headerColumns) {
      // Draw header cell background
      page.drawRectangle({
        x: xPos,
        y: yPosition - rowHeight,
        width: col.width,
        height: rowHeight,
        color: headerBgColor,
        borderColor: borderColor,
        borderWidth: 1,
      });
      
      // Calculate text position for center alignment
      const textWidth = headerFont.widthOfTextAtSize(col.name, 9);
      const textX = xPos + (col.width - textWidth) / 2;
      
      page.drawText(col.name, {
        x: textX,
        y: yPosition - rowHeight + 6,
        size: 9,
        color: rgb(0, 0, 0),
        font: headerFont,
      });
      xPos += col.width;
    }

    yPosition -= rowHeight;

    // Generate rows
    const durationNum = parseInt(duration);
    const gapNum = parseInt(gap || '0');
    let current = new Date(start);

    while (current <= end) {
      const adEnd = new Date(current.getTime() + durationNum * 1000);

      if (adEnd > end) break;

      // Check if we need a new page
      if (yPosition < margin + rowHeight + 20) {
        page = pdfDoc.leftMargin + rowHeight + 20) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = height - leftMargin - 30;
      }

      // Draw row cells
      const rowData = [
        mediaName,
        screenName,
        current.toISOString().slice(0, 19).replace('T', ' '),
        adEnd.toISOString().slice(0, 19).replace('T', ' '),
        durationNum.toString(),
      ];

      xPos = leftMargin;
      const cols = [
        { width: colWidths.media, value: rowData[0], align: 'left' },
        { width: colWidths.screen, value: rowData[1], align: 'left' },
        { width: colWidths.startDate, value: rowData[2], align: 'center' },
        { width: colWidths.endDate, value: rowData[3], align: 'center' },
        { width: colWidths.duration, value: rowData[4], align: 'center' },
      ];

      for (const col of cols) {
        // Draw cell border
        page.drawRectangle({
          x: xPos,
          y: yPosition - rowHeight,
          width: col.width,
          height: rowHeight,
          borderColor: borderColor,
          borderWidth: 1,
        });
        
        // Calculate text position based on alignment
        let textX;
        if (col.align === 'center') {
          const textWidth = bodyFont.widthOfTextAtSize(col.value, 9);
          textX = xPos + (col.width - textWidth) / 2;
        } else {
          textX = xPos + cellPaddingLeft;
        }
        
        page.drawText(col.value, {
          x: textX,
          y: yPosition - rowHeight + 6,
          size: 9,
          color: rgb(0, 0, 0),
          font: bodyFont
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
