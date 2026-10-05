/* glibc's timegm: the C library under most of the others. It normalises -
   a struct tm holding 30 February is turned into a real day without complaint. */
#include <stdio.h>
#include <time.h>
#include <string.h>
int main(int argc, char **argv) {
  char path[512]; snprintf(path, sizeof path, "%s/c-timegm.txt", argv[1]);
  FILE *f = fopen(path, "w");
  for (int y = 1500; y <= 1930; y++)
    for (int m = 1; m <= 12; m++)
      for (int d = 1; d <= 31; d++) {
        struct tm tm; memset(&tm, 0, sizeof tm);
        tm.tm_year = y - 1900; tm.tm_mon = m - 1; tm.tm_mday = d; tm.tm_hour = 12;
        time_t t = timegm(&tm);
        if (t == (time_t)-1) fputs("-\n", f);
        else { long q = t / 86400; if (t < 0 && t % 86400 != 0) q--;
               fprintf(f, "%ld\n", q + 2440588); }
      }
  fclose(f); return 0;
}
