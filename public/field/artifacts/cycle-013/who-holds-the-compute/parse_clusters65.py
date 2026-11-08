"""Study 65: rebuild Epoch's GPU-clusters CSV from a copy whose line breaks were flattened to spaces.
Tokenises the CSV stream; the last field of each row (longitude) and the first field of the next (Name)
arrive joined by one space. Rows are found by their anchor: a Status value followed by a Certainty value; the token before the anchor
carries "<last field of the previous row> <Name>". Rows whose field count is not 57 are kept but flagged.
Usage: python3 -I parse_clusters65.py <flattened.txt>  -> data/gpu_clusters.json"""
import json, sys, re
from pathlib import Path
s = Path(sys.argv[1]).read_text()
def tokens(s):
    i, n, out = 0, len(s), []
    while i <= n:
        if i < n and s[i] == '"':
            j, buf = i + 1, []
            while True:
                k = s.index('"', j)
                if k + 1 < n and s[k + 1] == '"': buf.append(s[j:k + 1]); j = k + 2; continue
                buf.append(s[j:k]); i = k + 1; break
            # after a closing quote comes a comma, or (row end) a space
            out.append(('q', ''.join(buf), s[i] if i < n else ''))
            i += 1
        else:
            k = s.find(',', i)
            if k < 0: k = n
            out.append(('u', s[i:k], ',')); i = k + 1
    return out
T = tokens(s)
N = 57
K = 13  # Name .. Sector
vals = [v for _, v, _ in T]
ST = {'Existing', 'Planned', 'Decommissioned'}
CE = {'Confirmed', 'Likely', 'Speculative', 'Unlikely', 'Unknown'}
anchors = [i for i in range(N, len(vals) - 1) if vals[i] in ST and vals[i + 1] in CE]
def split_join(v):
    # "<last field> <Name>": the name is everything after the first space; a bare " Name" has an empty last field
    a, _, b = v.partition(' ')
    return a, b
header = vals[:N - 1] + [split_join(vals[N - 1])[0]]
rows, flagged = [], 0
for k, i in enumerate(anchors):
    name = split_join(vals[i - 1])[1] if k else split_join(vals[N - 1])[1]
    end = anchors[k + 1] - 1 if k + 1 < len(anchors) else len(vals)
    body = vals[i:end]
    if k + 1 < len(anchors): body = body + [split_join(vals[end])[0]]
    row = [name] + body
    ok = len(row) == N
    flagged += not ok
    # Only the leading columns are trusted: the extraction dropped link fields near the row's end, so later
    # columns can shift. The leading thirteen are checked for type below.
    d = {h: row[j] for j, h in enumerate(header[:K]) if j < len(row)}
    d['_parse_ok'] = ok; d['_n_fields'] = len(row)
    rows.append(d)
print(len(header), 'columns;', len(rows), 'rows;', flagged, 'with a field count other than 57')
Path('data/gpu_clusters.json').write_text(json.dumps({'header': header, 'rows': rows}, ensure_ascii=False))
