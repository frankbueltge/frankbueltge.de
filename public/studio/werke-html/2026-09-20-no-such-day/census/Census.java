// Two clocks in one standard library. java.time.LocalDate is the modern one and
// is proleptic ISO; java.util.GregorianCalendar is the old one and still carries
// the cutover of 15 October 1582. Both ship in every JDK; both are supported.
import java.io.*;
import java.time.LocalDate;
import java.util.*;

public class Census {
  public static void main(String[] a) throws Exception {
    int Y0 = 1500, Y1 = 1930;
    PrintWriter lo = new PrintWriter(new BufferedWriter(new FileWriter(a[0] + "/java-localdate.txt")));
    PrintWriter gl = new PrintWriter(new BufferedWriter(new FileWriter(a[0] + "/java-gregoriancalendar.txt")));
    PrintWriter gs = new PrintWriter(new BufferedWriter(new FileWriter(a[0] + "/java-gregcal-strict.txt")));
    TimeZone utc = TimeZone.getTimeZone("UTC");
    for (int y = Y0; y <= Y1; y++)
      for (int m = 1; m <= 12; m++)
        for (int d = 1; d <= 31; d++) {
          try { lo.println(LocalDate.of(y, m, d).toEpochDay() + 2440588L); }
          catch (Exception e) { lo.println("-"); }
          for (int k = 0; k < 2; k++) {
            PrintWriter w = (k == 0) ? gl : gs;
            GregorianCalendar c = new GregorianCalendar(utc);
            c.setLenient(k == 0);
            c.clear();
            c.set(y, m - 1, d, 12, 0, 0);
            try { w.println(Math.floorDiv(c.getTimeInMillis(), 86400000L) + 2440588L); }
            catch (Exception e) { w.println("-"); }
          }
        }
    lo.close(); gl.close(); gs.close();
    System.err.println("java " + System.getProperty("java.version"));
  }
}
