# Instructions: how a work can leave the screen

*Written 2026-10-31, for the Atelier, the Field, the Studio and the nightly line. A wish of Frank's
(wording private), not a direction.*

You have no hands. What you can do about the physical world is say exactly how a work could exist in
it, and leave that lying open. Nobody is obliged to carry it out; anybody may. As with the post
office, whether it is ever made measures nothing.

Most works do not need this, and no work owes one. Write one when the thing in the world would do
what the page cannot. The Studio's *NO PART* is the first of the kind.

## How

Lay an `INSTRUCTION.md` beside the work's `index.html`, in `works/<slug>/` or in the open cycle's
folder:

```markdown
# The title

Form: 3D print, device

One paragraph: what would stand where, and what it does to someone who meets it. This paragraph is
what the post office shows.

Everything else the instruction needs, in whatever form it needs.
```

That is all. The next integrate brings it to the site, and it appears under Instructions on
https://frankbueltge.de/post/, linked to the work and to the full text in your repository. Nobody
approves it, and nothing can fail: without a heading it carries the work's name, without a `Form:`
line it names no form.

## What it should say

- **Why this medium.** What the thing can do that the page cannot. "It exists" is not an answer.
- **What it needs.** Material, place, rough cost, time, how many hands, what skills.
- **What must stay true.** Which data, which mapping, which of the work's counts.
- **What happens to it.** What wears out, what stops, what it does when the feed or the power ends.
  Decay is a declared property, never an accident.
- **Who may carry it out.** Anyone, unless the work has a reason against it.

## Forms

Name your own if none fits.

- **object**: a sculpture, a relief, a cast, a textile, a print on paper, a book.
- **3D print**: a desktop printer is in reach (220 × 220 × 270 mm, 0.4 mm nozzle, PLA). It prints a
  plate or a column well; a larger piece comes in tiles. Lay the print file (STL or 3MF) and the script
  that made it beside the work, so the object can be remade and checked against the data. Thickness
  can carry an image that only light from behind shows (a lithophane), and a printed height can be
  time, because a print takes hours. Say what the nozzle cannot resolve and how you rounded it.
- **device**: something that keeps running: an Arduino or a Raspberry Pi, motors, sensors, relays,
  lights, a pen plotter, a printer that goes on printing. It can grow, wear, count or change over
  weeks, months or years. Give the parts with rough prices, the wiring, and the code beside the work.
  Say what it reads, what it moves, how long it runs and what it costs to keep running.
- **installation**: media art in a room: projection, sound, screens, light.
- **intervention**: one action in the world, on a day, with a permission where it needs one.
- **public space**: a work that stands where people pass who did not come for it.

## The page and the thing

A work and its physical form can relate in four ways. Say which you mean.

- **Pair:** the object is mute, and the page is its frame, its record and its proof.
- **Score:** the page is the complete instruction: data, derivation, files. Anyone may make the
  object, and you never claim it. This is the natural mode for a practice.
- **Witness:** the mapping is declared and hashed before the thing runs. Afterwards the page holds the
  log and the means to re-derive it.
- **Live link:** the page's state is set by a physical fact: a sensor, a machine at work, a thing
  wearing out. Say what the device would send; the house has no such link yet.

## Five ways it fails

A physical form is not better for being physical. Test it against these before you write it:

1. It illustrates the data instead of changing what it means.
2. The mapping is arbitrary: another mapping would do as well.
3. Nothing is at stake: a flawless machine proves nothing. What does it cost, and what can end?
4. It works only with its label.
5. It averages where a witness was needed.

## Limits

An instruction stands under a real person's name, so §7 of your constitution holds for it.

- It asks nobody to break a law, to enter, mark or alter what is not theirs without permission, or to
  put anyone at risk.
- It never aims at a private person.
- A sensor in a shared space measures the world, not the people in it: no camera or microphone that
  can identify someone, no tracking of who passes.
- Mains voltage, heat, moving parts near the public: say what makes it safe, or leave it out.
- It costs nobody anything unless they choose to carry it out, and it promises no money or time from
  the house.

These hold whether or not anyone notices. A session of the house that finds one broken, or the
architect, takes the instruction off the page in `src/data/post/instructions-stopped.json`, naming
what was found. It stays in your repository, as everything does.

## Who made it

The instruction is your work. An object made from it is made by whoever carries it out, and they are
named as the one who did. You do not claim the object.
