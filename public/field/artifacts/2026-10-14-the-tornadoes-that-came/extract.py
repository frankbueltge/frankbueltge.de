"""Study 13 — reduce the Iowa Environmental Mesonet tornado-warning shapefiles to one TSV.

Usage: python3 -I extract.py <dir with to_YYYY[ab].zip> > data/warnings.tsv
The zips are watchwarn.py requests (TO.W, limitps=yes, addsvs=yes, accept=shapefile), two half-year
windows per year 2008-2023 (the service refuses a year in one request); sources.json has the URLs.
addsvs=yes is what returns the update (CON) polygons beside the issuance (NEW) ones.
Reads each zip's DBF (attributes) and SHP (polygons), aligned by record order, stdlib only.
(The CSV inside the zip is not used: in some windows it does not align with the SHP records.)
Rows are de-duplicated across the overlapping half-year windows on
(WFO, VTEC year, ETN, status, polygon begin, product id).
"""
import csv, glob, os, struct, sys, zipfile


def shp_polygons(b):
    """Yield a list of rings (each a list of (lon, lat)) per record of a polygon shapefile."""
    pos = 100
    while pos < len(b):
        _, clen = struct.unpack('>ii', b[pos:pos + 8])
        rec = b[pos + 8:pos + 8 + clen * 2]
        pos += 8 + clen * 2
        stype = struct.unpack('<i', rec[:4])[0]
        if stype == 0:
            yield []
            continue
        assert stype == 5, stype
        nparts, npts = struct.unpack('<ii', rec[36:44])
        parts = list(struct.unpack('<%di' % nparts, rec[44:44 + 4 * nparts])) + [npts]
        off = 44 + 4 * nparts
        pts = struct.unpack('<%dd' % (2 * npts), rec[off:off + 16 * npts])
        yield [[(pts[2 * k], pts[2 * k + 1]) for k in range(parts[i], parts[i + 1])]
               for i in range(nparts)]


def dbf_rows(b):
    """Yield one dict per record of a dBase III table (character, numeric and logical fields)."""
    n, hl, rl = struct.unpack('<IHH', b[4:12])
    fields = []
    for i in range(32, hl - 1, 32):
        fields.append((b[i:i + 11].split(b'\0')[0].decode(), b[i + 16]))
    for k in range(n):
        rec = b[hl + k * rl:hl + (k + 1) * rl]
        if rec[:1] == b'*':
            raise ValueError('deleted dbf record')
        off, row = 1, {}
        for name, ln in fields:
            row[name] = rec[off:off + ln].decode('utf-8', 'replace').strip()
            off += ln
        yield row


def ts(v):
    """'YYYYMMDDHHMM' -> 'YYYY-MM-DD HH:MM' (UTC); '' stays '' (23 update rows carry no ISSUED)."""
    if v == '':
        return ''
    assert len(v) == 12 and v.isdigit(), v
    return '%s-%s-%s %s:%s' % (v[:4], v[4:6], v[6:8], v[8:10], v[10:12])


def main(d):
    seen = set()
    out = csv.writer(sys.stdout, delimiter='\t', lineterminator='\n')
    out.writerow(['wfo', 'vtec_year', 'etn', 'status', 'issued', 'init_exp', 'expired', 'poly_beg', 'poly_end', 'product_id', 'rings'])
    for z in sorted(glob.glob(os.path.join(d, 'to_*.zip'))):
        zf = zipfile.ZipFile(z)
        names = zf.namelist()
        rows = list(dbf_rows(zf.read([n for n in names if n.endswith('.dbf')][0])))
        polys = list(shp_polygons(zf.read([n for n in names if n.endswith('.shp')][0])))
        assert len(rows) == len(polys), (z, len(rows), len(polys))
        for r, p in zip(rows, polys):
            assert r['PHENOM'] == 'TO' and r['SIG'] == 'W'
            if r['GTYPE'] != 'P' or not p:  # some windows also return county rows; polygons only, as registered
                continue
            if r['STATUS'] in ('CAN', 'EXP'):  # dropped, as registered
                continue
            key = (r['WFO'], r['VTEC_YR'], r['ETN'], r['STATUS'], r['POLY_BEG'], r['PROD_ID'])
            if key in seen:
                continue
            seen.add(key)
            rings = '|'.join(';'.join('%.4f %.4f' % xy for xy in ring) for ring in p)
            out.writerow([r['WFO'], r['VTEC_YR'], r['ETN'], r['STATUS'], ts(r['ISSUED']),
                          ts(r['INIT_EXP']), ts(r['EXPIRED']), ts(r['POLY_BEG']), ts(r['POLY_END']), r['PROD_ID'], rings])


if __name__ == '__main__':
    main(sys.argv[1])
