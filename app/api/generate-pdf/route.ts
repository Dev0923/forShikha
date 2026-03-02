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

    const leftMargin = 50;
    const rightMargin = 45;
    // Adjusted column widths to fit in page (595 - 50 - 45 = 500 available)
    // Media + Screen + Start + End + Duration = 500
    const colPositions = {
      media: leftMargin,              // 50
      screen: leftMargin + 130,       // 180 (130 = media width)
      startDate: leftMargin + 220,    // 270 (90 = screen width)
      endDate: leftMargin + 340,      // 390 (120 = start width)
      duration: leftMargin + 460,     // 510 (120 = end width, 40 = duration width)
    };
    const rowHeight = 19;

    let yPosition = height - leftMargin - 30;

    // Draw column headers (regular font, no bold, no background)
    const headerColumnNames = ['Media Name', 'Screen Name', 'Start Date', 'End Date', 'Duration  (s)'];
    
    // Draw each header at its fixed position
    page.drawText(headerColumnNames[0], {
      x: colPositions.media,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
      font: font,
    });
    page.drawText(headerColumnNames[1], {
      x: colPositions.screen,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
      font: font,
    });
    page.drawText(headerColumnNames[2], {
      x: colPositions.startDate,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
      font: font,
    });
    page.drawText(headerColumnNames[3], {
      x: colPositions.endDate,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
      font: font,
    });
    page.drawText(headerColumnNames[4], {
      x: colPositions.duration,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
      font: font,
    });

    yPosition -= rowHeight + 5;

    // Generate rows
    const durationNum = parseInt(duration);
    const gapNum = parseInt(gap || '0');
    let current = new Date(start);

    while (current <= end) {
      const adEnd = new Date(current.getTime() + durationNum * 1000);

      // Draw each cell at its fixed position
      page.drawText(rowData[0], {
        x: colPositions.media,
        y: yPosition,
        size: 10,
        color: rgb(0, 0, 0),
        font: font,
      });
      page.drawText(rowData[1], {
        x: colPositions.screen,
        y: yPosition,
        size: 10,
        color: rgb(0, 0, 0),
        font: font,
      });
      page.drawText(rowData[2], {
        x: colPositions.startDate,
        y: yPosition,
        size: 10,
        color: rgb(0, 0, 0),
        font: font,
      });
      page.drawText(rowData[3], {
        x: colPositions.endDate,
        y: yPosition,
        size: 10,
        color: rgb(0, 0, 0),
        font: font,
      });
      page.drawText(rowData[4], {
        x: colPositions.duration,
        y: yPosition,
        size: 10,
        color: rgb(0, 0, 0),
        font: font,
      });

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
