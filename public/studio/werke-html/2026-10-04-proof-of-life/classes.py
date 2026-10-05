# The reading of each record. Classes are the Studio's own, assigned by hand from what the record's
# fields and, where marked "looked", the linked photographs show. Not determinations of identity.
CLASSES=[
 ('A','Stands in for it','A picture or a statue','looked'),
 ('B','Bones','Bones, or a figure of bones','looked'),
 ('C','Carcass','A dead bird found on a beach','looked'),
 ('D','Alive, old name','Living birds filed under a dead name','record fields'),
 ('E','Field record','A field record at a named reserve','not examined'),
 ('F','Interview','Recorded from an interview','record fields'),
 ('G','One checklist','Six extinct names in one checklist','record fields'),
 ('H','Nothing behind it','No photograph, no remarks, no way to check','record fields'),
]
BY_KEY={}
for k in (5025055753,5018933085,5025415612,5021858729): BY_KEY[k]='A'
for k in (4055934516,3995273262,4056029114): BY_KEY[k]='B'
BY_KEY[4041567817]='C'
for k in (1147076458,1147226609): BY_KEY[k]='D'
for k in (1784603256,2799541545,1409943799,1760164400,2432452470,2725083097,1782921439,4681615867): BY_KEY[k]='E'
BY_KEY[6362103322]='F'
for k in (1981553985,1981553384,1981553885,1981554397,1981554576,1981553475): BY_KEY[k]='G'
READING={
 5025055753:'Two photographs: a life-sized model of the bird and framed prints with museum labels, in a crocodile park.',
 5018933085:'One photograph: a painted beer logo of the bird.',
 5025415612:'One photograph: a roadside billboard with two painted birds and a beer bottle.',
 5021858729:'One photograph: a green bronze-like statue of a bird on lava ground.',
 4055934516:'One image: a labelled plate of bone views with a 1 cm scale bar, not a bird in the field.',
 3995273262:'One photograph: a tooth and a bone lying on sand.',
 4056029114:'One photograph: a single bone held in a hand.',
 4041567817:'Two photographs of one dead duck on a stony beach; the note says it was found during a beach clean-up.',
 1147076458:'Sound recording; the recorder’s note describes a breeding pair with very recent fledglings.',
 1147226609:'Sound recording; the recorder’s note describes a breeding pair with three fledglings.',
 6362103322:'The record’s remarks field reads "Entrevistas" (interviews).',
}
