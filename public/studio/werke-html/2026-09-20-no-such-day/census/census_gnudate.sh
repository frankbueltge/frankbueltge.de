#!/bin/sh
# GNU coreutils date, the one on the command line. Fed every written date on
# stdin in one process; a refusal is a diagnostic on stderr, so stdout is kept
# line-buffered and the two streams are merged in order.
OUT="$1"
awk 'BEGIN{for(y=1500;y<=1930;y++)for(m=1;m<=12;m++)for(d=1;d<=31;d++)printf "%04d-%02d-%02d\n",y,m,d}' > "$OUT/gnu-date.in"
stdbuf -oL -eL date -f "$OUT/gnu-date.in" +%s 2>&1 \
  | awk '/^date:/{print "-"; next} {q=int($1/86400); if($1<0 && $1%86400!=0) q--; print q+2440588}' \
  > "$OUT/gnu-date.txt"
date --version | head -1 >&2
