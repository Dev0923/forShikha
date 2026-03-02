import json
from datetime import datetime, timedelta
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
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
    # Try Aptos Narrow first, then Calibri, then Helvetica fallback
    font_name = 'Helvetica'
    font_candidates = [
        ('AptosNarrow', ['AptosNarrow.ttf', 'aptosnarrow.ttf', 'Aptos Narrow.ttf']),
        ('Calibri', ['calibri.ttf', 'Calibri.ttf']),
    ]

    for font_alias, file_names in font_candidates:
        is_registered = False
        for file_name in file_names:
            try:
                pdfmetrics.registerFont(TTFont(font_alias, file_name))
                font_name = font_alias
                is_registered = True
                break
            except Exception:
                continue
        if is_registered:
            break
    
    doc = SimpleDocTemplate(str(output_path), pagesize=A4, topMargin=50, leftMargin=50, rightMargin=45)

    data = [["Media Name", "Screen Name", "Start Date", "End Date", "Duration  (s)"]] + rows

    # Column widths adjusted to fit page: 130 + 90 + 120 + 120 + 40 = 500
    table = Table(data, repeatRows=1, colWidths=[130, 90, 120, 120, 40], rowHeights=19, spaceBefore=10)
    
    table.setStyle(TableStyle([
        # Font styling - Regular (not bold) for all including header
        ('FONTNAME', (0, 0), (-1, -1), font_name),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        
        # All columns left-aligned
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        
        # Vertical alignment
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        
        # Cell padding - minimal for borderless look
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        
        # NO borders - borderless table
        ('LINEBELOW', (0, 0), (-1, 0), 0, colors.white),  # No header underline
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
