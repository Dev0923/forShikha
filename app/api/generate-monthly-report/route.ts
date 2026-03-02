import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, PDFFont, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFile } from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { Readable } from 'stream';

export const runtime = 'nodejs';

async function resolvePdfFont(pdfDoc: PDFDocument): Promise<PDFFont> {
  const aptosCandidates = [
    path.join(process.cwd(), 'public', 'fonts', 'AptosNarrow.ttf'),
    path.join(process.cwd(), 'public', 'fonts', 'aptosnarrow.ttf'),
    path.join(process.cwd(), 'AptosNarrow.ttf'),
    path.join(process.cwd(), 'aptosnarrow.ttf'),
  ];

  pdfDoc.registerFontkit(fontkit);

  for (const fontPath of aptosCandidates) {
    try {
      const fontBytes = await readFile(fontPath);
      return await pdfDoc.embedFont(fontBytes);
    } catch {
      // Try next candidate path
    }
  }

  return await pdfDoc.embedFont(StandardFonts.Helvetica);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomStartTime(date: Date): Date {
  // Random hour: 11, random minutes: 0-10, random seconds: 0-59
  const minutes = randomBetween(0, 10);
  const seconds = randomBetween(0, 59);
  const result = new Date(date);
  result.setHours(11, minutes, seconds, 0);
  return result;
}

function generateRandomEndTime(date: Date): Date {
  // Random hour: 22 or 23 based on minutes
  // If 22:50-22:59 or 23:00
  const useHour23 = Math.random() < 0.5;
  
  if (useHour23) {
    const minutes = randomBetween(0, 0); // 23:00:00
    const seconds = randomBetween(0, 59);
    const result = new Date(date);
    result.setHours(23, minutes, seconds, 0);
    return result;
  } else {
    const minutes = randomBetween(50, 59); // 22:50-22:59
    const seconds = randomBetween(0, 59);
    const result = new Date(date);
    result.setHours(22, minutes, seconds, 0);
    return result;
  }
}

function generateRandomGap(): number {
  return randomBetween(190, 200);
}

async function generateDayPDF(
  mediaName: string,
  screenName: string,
  date: Date,
  duration: number
): Promise<Uint8Array> {
  const startTime = generateRandomStartTime(date);
  const endTime = generateRandomEndTime(date);
  const gap = generateRandomGap();

  const pdfDoc = await PDFDocument.create();
  const font = await resolvePdfFont(pdfDoc);
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  const leftMargin = 50;
  const colPositions = {
    media: leftMargin,
    screen: leftMargin + 130,
    startDate: leftMargin + 220,
    endDate: leftMargin + 340,
    duration: leftMargin + 460,
  };
  const rowHeight = 19;

  let yPosition = height - leftMargin - 30;

  // Draw headers
  const headerColumnNames = ['Media Name', 'Screen Name', 'Start Date', 'End Date', 'Duration  (s)'];
  
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
  let current = new Date(startTime);

  while (current <= endTime) {
    const adEnd = new Date(current.getTime() + duration * 1000);

    if (adEnd > endTime) break;

    if (yPosition < leftMargin + rowHeight + 20) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - leftMargin - 30;
    }

    const rowData = [
      mediaName,
      screenName,
      current.toISOString().slice(0, 19).replace('T', ' '),
      adEnd.toISOString().slice(0, 19).replace('T', ' '),
      duration.toString(),
    ];

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

    current = new Date(current.getTime() + (duration + gap) * 1000);
  }

  return await pdfDoc.save();
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { mediaName, screenName, year, month, duration } = body;

    // Validate inputs
    if (!mediaName || !screenName || !year || !month || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const durationNum = parseInt(duration);

    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(durationNum)) {
      return NextResponse.json(
        { error: 'Invalid input values' },
        { status: 400 }
      );
    }

    if (monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Get number of days in month
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

    // Generate PDFs for each day
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    const archivePromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      archive.on('error', (err: Error) => {
        reject(err);
      });
    });

    // Generate a PDF for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(yearNum, monthNum - 1, day);
      const pdfBytes = await generateDayPDF(mediaName, screenName, date, durationNum);
      
      const dateStr = date.toISOString().slice(0, 10);
      archive.append(Buffer.from(pdfBytes), { 
        name: `${mediaName}_${screenName}_${dateStr}.pdf` 
      });
    }

    archive.finalize();

    const zipBuffer = await archivePromise;

    const response = new NextResponse(new Uint8Array(zipBuffer));
    response.headers.set('Content-Type', 'application/zip');
    response.headers.set('Content-Disposition', `attachment; filename="${mediaName}_${screenName}_${year}-${month.toString().padStart(2, '0')}_monthly_report.zip"`);
    return response;
  } catch (error) {
    console.error('Monthly PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate monthly report' },
      { status: 500 }
    );
  }
}
