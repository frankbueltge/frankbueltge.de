# Perl's core time conversion. Written dates outside a month's length are a
# fatal error here, not a rounding.
use strict; use warnings; use Time::Local qw(timegm_modern);
my ($Y0, $Y1) = (1500, 1930); my $out = $ARGV[0];
open(my $f, '>', "$out/perl-timegm.txt") or die $!;
for my $y ($Y0 .. $Y1) { for my $m (1 .. 12) { for my $d (1 .. 31) {
  my $t = eval { timegm_modern(0, 0, 12, $d, $m - 1, $y) };
  if (defined $t) { my $q = int($t / 86400); $q-- if $t < 0 && $t % 86400 != 0;
                    print $f ($q + 2440588), "\n"; } else { print $f "-\n"; }
} } }
print STDERR "perl $]\n";
