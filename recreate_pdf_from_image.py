from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle

def build_pdf(output_path):
    doc = SimpleDocTemplate(str(output_path), pagesize=A4, topMargin=50, leftMargin=36, rightMargin=36)

    # Data extracted from the image
    headers = ["Media Name", "Screen Name", "Start Date", "End Date", "Duration  (s)"]
    data_rows = [
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 23:54:28", "2026-02-16 23:54:43", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 23:48:45", "2026-02-16 23:49:00", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 23:43:01", "2026-02-16 23:43:16", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 23:37:18", "2026-02-16 23:37:33", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 23:31:36", "2026-02-16 23:31:51", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 23:25:53", "2026-02-16 23:26:08", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 23:20:10", "2026-02-16 23:20:25", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 23:14:27", "2026-02-16 23:14:42", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 23:08:44", "2026-02-16 23:08:59", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 23:03:01", "2026-02-16 23:03:16", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 22:57:18", "2026-02-16 22:57:33", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 22:51:35", "2026-02-16 22:51:50", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 22:45:52", "2026-02-16 22:46:07", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 22:40:09", "2026-02-16 22:40:25", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 22:34:26", "2026-02-16 22:34:41", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 22:28:43", "2026-02-16 22:28:58", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 22:23:00", "2026-02-16 22:23:15", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 22:17:17", "2026-02-16 22:17:32", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 22:11:34", "2026-02-16 22:11:49", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 22:05:51", "2026-02-16 22:06:06", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 22:00:07", "2026-02-16 22:00:23", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 21:54:25", "2026-02-16 21:54:40", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 21:48:42", "2026-02-16 21:48:57", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 21:42:59", "2026-02-16 21:43:14", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 21:37:16", "2026-02-16 21:37:31", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 21:31:33", "2026-02-16 21:31:48", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 21:25:50", "2026-02-16 21:26:05", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 21:20:07", "2026-02-16 21:20:22", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 21:14:24", "2026-02-16 21:14:39", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 21:08:41", "2026-02-16 21:08:56", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 21:02:58", "2026-02-16 21:03:13", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 20:57:15", "2026-02-16 20:57:30", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 20:51:32", "2026-02-16 20:51:47", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 20:45:49", "2026-02-16 20:46:04", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 20:40:06", "2026-02-16 20:40:21", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 20:34:23", "2026-02-16 20:34:38", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 20:28:40", "2026-02-16 20:28:55", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 20:22:57", "2026-02-16 20:23:12", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 20:17:14", "2026-02-16 20:17:29", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 20:11:31", "2026-02-16 20:11:46", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 20:05:48", "2026-02-16 20:06:03", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 20:00:05", "2026-02-16 20:00:20", "15"],
        ["Forest 1080x648.mp4", "Moti_Dongri", "2026-02-16 19:54:22", "2026-02-16 19:54:37", "15"]
    ]

    all_data = [headers] + data_rows

    # Create table with approximate column widths from the image
    # Image total width is roughly A4 width (approx 500-550 points useable)
    # Visual check: 
    # Media Name: ~140
    # Screen Name: ~100
    # Start Date: ~130
    # End Date: ~130
    # Duration: ~50
    # Total: 550
    table = Table(all_data, repeatRows=1, colWidths=[140, 90, 130, 130, 60])

    # Add style to match image
    table.setStyle(TableStyle([
        # Header Row
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("VALIGN", (0, 0), (-1, 0), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),  # Headers centered
        
        # Grid/Lines - The image has a box around the header and probably the whole table
        ("BOX", (0, 0), (-1, -1), 1, colors.black),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.white), # Start with white grid to hide all
        
        # Specific lines from image:
        # - Box around the whole header row
        # - Vertical lines between header columns
        ("GRID", (0, 0), (-1, 0), 1, colors.black),
        
        # - No grid lines for the data rows, EXCEPT maybe outer box?
        # Actually, looking closely at the image:
        # There is a box around the header row.
        # There are vertical lines separating the headers.
        # There seem to be NO vertical lines or horizontal lines in the data content, 
        # EXCEPT maybe a bottom line at the very end (not visible).
        # Let's verify the header border again.
        # The image shows a strong black border around the header row.
        # And vertical lines separating the header textual columns.
        
        # Data Rows
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("TEXTCOLOR", (0, 1), (-1, -1), colors.black),
        ("VALIGN", (0, 1), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 1), (-1, -1), "LEFT"),
        
        # Adjust alignment for Duration? It looks slightly left-aligned or centered?
        # In image: "15" is aligned with "End Date" roughly? No, it's just left aligned in its column.
    ]))

    doc.build([table])
    print(f"PDF generated at: {output_path}")

if __name__ == "__main__":
    output_pdf = "Forest_Log_Recreated.pdf"
    build_pdf(output_pdf)
