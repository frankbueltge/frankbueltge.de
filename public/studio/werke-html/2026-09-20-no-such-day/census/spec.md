# The census — one question, sixteen readers

Y0=1500, Y1=1930. For every year in that range, every month 1..12, every day 1..31 —
160 332 written dates, in that order — each reader answers on one line:

    -            the reader refuses this written date
    <integer>    the reader accepts it, and this is the Julian Day Number it means

JDN is the common yardstick: an integer naming one day of the world, with no calendar in it.
A reader that accepts a written date and returns a JDN another reader does not return for the
same written date has not made a mistake. It has a different calendar, and says so in its
documentation. This census asks only what each one answers.

Go 1.24.7 was installed, `census.go` was run, and its 160 332 answers were byte-identical
to the C library's. It is kept here because it was run, and it is left off the bench in
`build.py` rather than counted as a seventeenth voice for the same behaviour — which lowers
this work's own headline from seven readers that refuse nothing to six.
