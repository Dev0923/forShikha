#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define INPUT_BUF 256
#define NAME_BUF 128
#define COL_MEDIA 24
#define COL_SCREEN 18
#define COL_TIME 19
#define COL_DURATION 12

static int read_line(char *buffer, size_t size) {
    if (!fgets(buffer, (int)size, stdin)) {
        return 0;
    }
    buffer[strcspn(buffer, "\r\n")] = '\0';
    return 1;
}

static int parse_datetime(const char *text, struct tm *out_tm) {
    int year, mon, day, hour, min, sec;
    if (sscanf(text, "%d-%d-%d %d:%d:%d", &year, &mon, &day, &hour, &min, &sec) != 6) {
        return 0;
    }
    if (year < 1900 || mon < 1 || mon > 12 || day < 1 || day > 31 ||
        hour < 0 || hour > 23 || min < 0 || min > 59 || sec < 0 || sec > 59) {
        return 0;
    }

    memset(out_tm, 0, sizeof(*out_tm));
    out_tm->tm_year = year - 1900;
    out_tm->tm_mon = mon - 1;
    out_tm->tm_mday = day;
    out_tm->tm_hour = hour;
    out_tm->tm_min = min;
    out_tm->tm_sec = sec;
    out_tm->tm_isdst = -1;
    return 1;
}

static int parse_int(const char *text, int *out_value) {
    char *end = NULL;
    long value = strtol(text, &end, 10);
    if (end == text || *end != '\0') {
        return 0;
    }
    if (value < 0 || value > INT_MAX) {
        return 0;
    }
    *out_value = (int)value;
    return 1;
}

int main(void) {
    char media_name[NAME_BUF];
    char screen_name[NAME_BUF];
    char input[INPUT_BUF];
    struct tm start_tm;
    struct tm end_tm;
    int duration = 0;
    int gap = 0;

    printf("Media Name: ");
    if (!read_line(media_name, sizeof(media_name)) || media_name[0] == '\0') {
        fprintf(stderr, "Invalid media name.\n");
        return 1;
    }

    printf("Screen Name: ");
    if (!read_line(screen_name, sizeof(screen_name)) || screen_name[0] == '\0') {
        fprintf(stderr, "Invalid screen name.\n");
        return 1;
    }

    printf("Campaign Start DateTime (YYYY-MM-DD HH:MM:SS): ");
    if (!read_line(input, sizeof(input)) || !parse_datetime(input, &start_tm)) {
        fprintf(stderr, "Invalid start datetime.\n");
        return 1;
    }

    printf("Campaign End DateTime (YYYY-MM-DD HH:MM:SS): ");
    if (!read_line(input, sizeof(input)) || !parse_datetime(input, &end_tm)) {
        fprintf(stderr, "Invalid end datetime.\n");
        return 1;
    }

    printf("Advertisement Duration (seconds): ");
    if (!read_line(input, sizeof(input)) || !parse_int(input, &duration) || duration <= 0) {
        fprintf(stderr, "Invalid duration.\n");
        return 1;
    }

    printf("Gap Between Ads (seconds, 0 for none): ");
    if (!read_line(input, sizeof(input)) || !parse_int(input, &gap)) {
        fprintf(stderr, "Invalid gap.\n");
        return 1;
    }

    time_t start_time = mktime(&start_tm);
    time_t end_time = mktime(&end_tm);
    if (start_time == (time_t)-1 || end_time == (time_t)-1) {
        fprintf(stderr, "Failed to convert datetime.\n");
        return 1;
    }

    if (difftime(end_time, start_time) < 0) {
        fprintf(stderr, "End time must be after start time.\n");
        return 1;
    }

    FILE *out = fopen("daily_log.html", "w");
    if (!out) {
        fprintf(stderr, "Failed to open daily_log.html for writing.\n");
        return 1;
    }

    printf("\n%-*s %-*s %-*s %-*s %-*s\n",
           COL_MEDIA, "Media Name",
           COL_SCREEN, "Screen Name",
           COL_TIME, "Start Date",
           COL_TIME, "End Date",
           COL_DURATION, "Duration (s)");

    for (int i = 0; i < COL_MEDIA + COL_SCREEN + COL_TIME + COL_TIME + COL_DURATION + 4; i++) {
        printf("-");
    }
    printf("\n");

    fprintf(out,
            "<!DOCTYPE html>\n"
            "<html><head><meta charset=\"UTF-8\">\n"
            "<style>"
            "body{font-family:Arial,Helvetica,sans-serif;margin:24px;}"
            "table{border-collapse:collapse;width:100%;}"
            "th,td{border:1px solid #000;padding:6px 8px;text-align:left;font-size:14px;}"
            "th{background:#f2f2f2;}"
            "</style></head><body>\n"
            "<table>\n"
            "<thead><tr>"
            "<th>Media Name</th><th>Screen Name</th><th>Start Date</th><th>End Date</th><th>Duration (s)</th>"
            "</tr></thead>\n"
            "<tbody>\n");

    time_t current = start_time;
    while (current <= end_time) {
        time_t ad_end = current + duration;
        if (ad_end > end_time) {
            break;
        }

        char start_buf[32];
        char end_buf[32];
        struct tm *start_local = localtime(&current);
        struct tm *end_local = localtime(&ad_end);
        if (!start_local || !end_local) {
            fprintf(stderr, "Failed to format time.\n");
            fclose(out);
            return 1;
        }

        strftime(start_buf, sizeof(start_buf), "%Y-%m-%d %H:%M:%S", start_local);
        strftime(end_buf, sizeof(end_buf), "%Y-%m-%d %H:%M:%S", end_local);

        printf("%-*s %-*s %-*s %-*s %*d\n",
               COL_MEDIA, media_name,
               COL_SCREEN, screen_name,
               COL_TIME, start_buf,
               COL_TIME, end_buf,
               COL_DURATION, duration);
        fprintf(out,
            "<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%d</td></tr>\n",
            media_name, screen_name, start_buf, end_buf, duration);

        current += duration + gap;
    }

    fprintf(out, "</tbody></table></body></html>\n");
    fclose(out);

    printf("\nLog saved to daily_log.html\n");
    printf("Generating daily_log.pdf using wkhtmltopdf...\n");
    int pdf_status = system("wkhtmltopdf daily_log.html daily_log.pdf");
    if (pdf_status != 0) {
        fprintf(stderr, "PDF generation failed. Make sure wkhtmltopdf is installed and on PATH.\n");
        return 1;
    }
    printf("PDF saved to daily_log.pdf\n");
    return 0;
}
