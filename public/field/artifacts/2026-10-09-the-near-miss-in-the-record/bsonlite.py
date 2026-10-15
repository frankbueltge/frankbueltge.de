"""A minimal BSON reader for a mongodump file (session 191). No dependencies.

Decodes the element types a mongodump of the AI Incident Database uses: double, string,
document, array, binary, ObjectId, bool, UTC datetime, null, int32, int64, decimal128 (raw).
An unknown type raises, so nothing is skipped silently.
"""
import struct, datetime


def _cstring(b, i):
    j = b.index(b'\x00', i)
    return b[i:j].decode('utf-8'), j + 1


def _doc(b, i, array=False):
    (size,) = struct.unpack_from('<i', b, i)
    end = i + size - 1
    i += 4
    out = [] if array else {}
    while i < end:
        t = b[i]; i += 1
        key, i = _cstring(b, i)
        if t == 0x01:
            (v,) = struct.unpack_from('<d', b, i); i += 8
        elif t == 0x02:
            (n,) = struct.unpack_from('<i', b, i); v = b[i + 4:i + 4 + n - 1].decode('utf-8'); i += 4 + n
        elif t == 0x03:
            v, i = _doc(b, i)
        elif t == 0x04:
            v, i = _doc(b, i, array=True)
        elif t == 0x05:
            (n,) = struct.unpack_from('<i', b, i); v = b[i + 5:i + 5 + n]; i += 5 + n
        elif t == 0x07:
            v = b[i:i + 12].hex(); i += 12
        elif t == 0x08:
            v = b[i] == 1; i += 1
        elif t == 0x09:
            (ms,) = struct.unpack_from('<q', b, i); i += 8
            v = (datetime.datetime(1970, 1, 1, tzinfo=datetime.timezone.utc) + datetime.timedelta(milliseconds=ms)).isoformat()
        elif t == 0x0A:
            v = None
        elif t == 0x10:
            (v,) = struct.unpack_from('<i', b, i); i += 4
        elif t == 0x12:
            (v,) = struct.unpack_from('<q', b, i); i += 8
        elif t == 0x13:
            v = b[i:i + 16].hex(); i += 16
        else:
            raise ValueError('BSON type 0x%02x not handled (key %r)' % (t, key))
        if array:
            out.append(v)
        else:
            out[key] = v
    if b[end] != 0:
        raise ValueError('document not terminated')
    return out, end + 1


def read(path):
    b = open(path, 'rb').read()
    i, docs = 0, []
    while i < len(b):
        d, i = _doc(b, i)
        docs.append(d)
    return docs
