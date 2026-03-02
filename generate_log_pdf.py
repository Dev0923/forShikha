import json
from datetime import datetime, timedelta
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


def parse_datetime(value):
    return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")


def generate_rows(media_name, screen_name, start_dt, end_dt, duration_sec, gap_sec):
    rows = []
    current = start_dt
    duration = timedelta(seconds=duration_sec)
    gap = timedelta(seconds=gap_sec)

    while current <= end_dt:
        ad_end = current + duration
        if ad_end > end_dt:
            break
        rows.append([
            media_name,
            screen_name,
            current.strftime("%Y-%m-%d %H:%M:%S"),
            ad_end.strftime("%Y-%m-%d %H:%M:%S"),
            str(duration_sec),
        ])
        current = current + duration + gap

    return rows


def build_pdf(output_path, rows):
    # Try to register Calibri font, fall back to Helvetica if not available
    try:
        pdfmetrics.registerFont(TTFont('Calibri', 'calibri.ttf'))
        pdfmetrics.registerFont(TTFont('Calibri-Bold', 'calibrib.ttf'))
        font_name = 'Calibri'
        font_bold = 'Calibri-Bold'
    except:
        font_name = 'Helvetica'
        font_bold = 'Helvetica-Bold'
    
    doc = SimpleDocTemplate(str(output_path), pagesize=A4, topMargin=50, leftMargin=20, rightMargin=55)

    data = [["Media Name", "Screen Name", "Start Date", "End Date", "Duration  (s)"]] + rows

    # Column widths: 135, 85, 110, 110, 40 (total = 480)
    table = Table(data, repeatRows=1, colWidths=[135, 85, 110, 110, 40], rowHeights=20)
    
    # Define gray colors
    border_color = colors.HexColor('#cfcfcf')
    header_bg = colors.HexColor('#e6e6e6')
    
    table.setStyle(TableStyle([
        # Header row styling
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('FONTNAME', (0, 0), (-1, 0), font_bold),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        
        # Body styling
        ('FONTNAME', (0, 1), (-1, -1), font_name),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        
        # Alignment: Media Name and Screen Name left, rest center
        ('ALIGN', (0, 1), (1, -1), 'LEFT'),
        ('ALIGN', (2, 1), (-1, -1), 'CENTER'),
        
        # Vertical alignment
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        
        # Cell padding (6-8px)
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        
        # Grid borders (all cells)
        ('GRID', (0, 0), (-1, -1), 1, border_color),
    ]))

    doc.build([table])


def load_config(config_path):
    with open(config_path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def main():
    config_path = Path("config.json")
    config = load_config(config_path)

    media_name = config["media_name"]
    screen_name = config["screen_name"]
    start_dt = parse_datetime(config["campaign_start"])
    end_dt = parse_datetime(config["campaign_end"])
    duration_sec = int(config["duration_seconds"])
    gap_sec = int(config.get("gap_seconds", 0))
    output_path = Path(config.get("output_pdf", "daily_log.pdf"))

    rows = generate_rows(media_name, screen_name, start_dt, end_dt, duration_sec, gap_sec)
    build_pdf(output_path, rows)


if __name__ == "__main__":
    main()
