from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph


def build_pdf(output_path: str) -> None:
    doc = SimpleDocTemplate(output_path, pagesize=A4, topMargin=36, leftMargin=36, rightMargin=36)

    headers = ["Media Name", "Screen Name", "Start Date", "End Date", "Duration  (s)"]

    # Placeholder rows to demonstrate formatting only.
    rows = [
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 23:54:28", "2026-02-16 23:54:43", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 23:48:45", "2026-02-16 23:49:00", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 23:43:01", "2026-02-16 23:43:16", "15"],
    ]

    data = [headers] + rows

    table = Table(data, repeatRows=1, colWidths=[120, 100, 140, 170, 70])
    table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("LINEBELOW", (0, 0), (-1, 0), 1, colors.black),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("ALIGN", (0, 1), (-1, -1), "LEFT"),
    ]))

    doc.build([table])


def main() -> None:
    build_pdf("Forest_Log.pdf")


if __name__ == "__main__":
    main()
