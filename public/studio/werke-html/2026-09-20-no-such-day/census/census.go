// Go's time.Date documents its normalisation: it accepts October 32 and
// returns November 1. Nothing in the written date is refused.
package main

import ("bufio"; "fmt"; "os"; "time")

func main() {
	f, _ := os.Create(os.Args[1] + "/go-time.txt")
	w := bufio.NewWriter(f)
	for y := 1500; y <= 1930; y++ {
		for m := 1; m <= 12; m++ {
			for d := 1; d <= 31; d++ {
				t := time.Date(y, time.Month(m), d, 12, 0, 0, 0, time.UTC)
				q := t.Unix() / 86400
				if t.Unix() < 0 && t.Unix()%86400 != 0 { q-- }
				fmt.Fprintf(w, "%d\n", q+2440588)
			}
		}
	}
	w.Flush(); f.Close()
	fmt.Fprintln(os.Stderr, "go "+ os.Getenv("GOVERSION"))
}
