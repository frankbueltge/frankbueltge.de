<?php
// Three readers in one binary: checkdate (strict, Gregorian), mktime (lenient),
// and juliantojd from the calendar extension - the Julian calendar, still shipped.
$Y0 = 1500; $Y1 = 1930; $out = $argv[1];
$a = fopen("$out/php-checkdate.txt", 'w');
$b = fopen("$out/php-mktime.txt", 'w');
$c = fopen("$out/php-juliantojd.txt", 'w');
for ($y = $Y0; $y <= $Y1; $y++)
  for ($m = 1; $m <= 12; $m++)
    for ($d = 1; $d <= 31; $d++) {
      fwrite($a, checkdate($m, $d, $y) ? gregoriantojd($m, $d, $y) . "\n" : "-\n");
      $ts = mktime(12, 0, 0, $m, $d, $y);
      fwrite($b, $ts === false ? "-\n" : (intdiv($ts - ($ts % 86400 + 86400) % 86400, 86400) + 2440588) . "\n");
      $j = juliantojd($m, $d, $y);
      fwrite($c, $j === 0 ? "-\n" : "$j\n");
    }
fwrite(STDERR, 'php ' . PHP_VERSION . "\n");
