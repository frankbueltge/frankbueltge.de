# The Studio's reading of the 135 drawn frames, one line each, in its own words (what is in frame). Photographs are not stored or shown.
# Joins the notes to draw.json / all_records.json and writes reading.json (record key, year, GBIF page, class, note).
import json
N="""mud at a stream edge, one animal
dry woodland, one animal, small in frame
mud wallow, one animal
grass, one animal, close
grass, one animal, head drawn in
grass, one animal, small in frame
brush and sticks, one animal, close
woodland path, one animal, neck out
wet meadow, one animal grazing
grass, one animal, neck raised
mud wallow by a stone wall, one animal
shaded grass, one animal
gravel path, one animal, small
bare earth, one animal
pond, one animal, shell above water
grass, one animal, close
sandy path, one animal walking
leaves, one animal facing the camera
undergrowth, one animal
shrubs, one animal, partly hidden
flooded field, one animal, far off
dirt track, one animal facing the camera
grass, one animal, close
fenced pasture, one animal
pond, three animals, close
pasture with cattle, one animal, far off
grass, one animal
grass, one animal walking
bare earth, three animals in a group
mud wallow, two animals
under a shrub on gravel, one animal
lava rock, one animal, small in frame
grass, one animal, close, mud on the shell
roadside shrubs, one animal, small and far
lava ground, one animal
shaded lawn, one animal
pond edge, one animal, close-up
green pond, four animals
dry grass, one animal, head half drawn in
dry brush, one animal almost hidden, only a limb shows
pond edge, one animal
mud, one large animal
dry field, one animal
roadside, one animal
roadside plants, one animal
stony ground, one animal walking
grass, two animals
gravel path, one animal facing the camera
bare soil, one young animal
grass, one animal close, a second shell at the left edge
grass, one animal
among stones, one animal
pond, three animals, two clearly in frame
red soil, one animal
head close-up, mouth open
path, one animal facing the camera
grass, one animal
grass, one animal
algae pond, one animal
stone floor, one animal, neck raised
grass, one animal
grass, one animal
pasture, several animals, tiny in a wide view, one of them rock-like
grass, one animal
mud, one animal
mud, one animal
pond, head and foreleg
grass, one animal
undergrowth, one animal
head close-up
under a shrub, one animal
grass, two animals
woodland path, one animal
rocky woodland, one animal
shrubs, one animal
among rocks, one animal
grass, one animal, small and far
grass, one animal
pasture, one animal, far off
sandy path, one animal
undergrowth, one animal seen from behind
lawn, one animal
grass, one animal
dirt road, one animal
under a tree, one animal
gravel, one animal
grass, one animal with four people behind it
gravel edge, one animal eating
head close-up, eating a leaf
pond, a dozen or more animals
grass, one animal
leaf litter, one animal
grass, one animal
trail, one animal
grass, one animal
pond, one animal, neck raised
wood chips, one animal
dirt, one dark animal
grass, one animal
pond bank, about fifteen animals
roadside, one animal
undergrowth, one animal
greenery, one animal, colours shifted by editing
grass, one animal, image heavily posterised
asphalt, one animal
puddle, two animals
sand, one animal
gravel, one young animal, leaves in front
lichen woodland, three animals
lava ground, one animal
undergrowth, one animal
shrubs, one animal
grass, one animal
stone wall, one animal
grass, one animal
pasture, about six animals, far off
trail, one animal
mud, one animal, mud on the shell
grass, one animal
head close-up
under a tree, one animal
gravel, one animal
grass, one animal, seen from the front
head and neck raised
grass, one animal
grass, one animal
under benches, one animal
grass, one animal
sandy ground, one animal
sand, one animal
lava ground, one animal
grass, one animal, close
walled enclosure, two animals
greens, one animal
grass, one animal""".split("\n")
assert len(N)==135,len(N)
HARD={40:"the animal is almost hidden; read at full size, a scaled foreleg and body show it is a living animal",
      63:"animals are tiny in a wide view; read at full size, at least one is a living animal and one dark shape is a rock",
      104:"the image is edited (posterised); read at full size, a living animal grazing"}
d=json.load(open('all_records.json'));dr=json.load(open('draw.json'));by={r['key']:r for r in d['rows']}
rows=[]
for i,k in enumerate(dr['keys'],1):
    r=by[k]
    rows.append(dict(n=i,key=k,year=r['year'],licence=r['licence'],page=f"https://www.gbif.org/occurrence/{k}",reading="alive",note=N[i-1],hard=HARD.get(i)))
json.dump(dict(reader="one reader (the Studio's conductor); contact sheets of 9 frames at <=420 px; three frames re-read at full size",rows=rows),open('reading.json','w'),indent=1,ensure_ascii=False)
print(len(rows))
