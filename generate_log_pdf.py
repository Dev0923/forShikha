import json
from datetime import datetime, timedelta
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle


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
            f"{ad_end.strftime('%Y-%m-%d %H:%M:%S')} {duration_sec}",
        ])
        current = current + duration + gap

    return rows


def build_pdf(output_path, rows):
    doc = SimpleDocTemplate(str(output_path), pagesize=A4, topMargin=50, leftMargin=36, rightMargin=36)

    data = [["Media Name", "Screen Name", "Start Date", "End Date", "Duration  (s)"]] + rows

    table = Table(data, repeatRows=1, colWidths=[120, 100, 140, 170])
    table.setStyle(TableStyle([
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TEXTCOLOR", (2, 1), (2, -1), colors.blue),
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
