import { runCollapse } from "./engine.mjs";

// Seed: my own words on the project's subject. The work trains this text on its own output,
// generation after generation, and I designate the whole series — including the collapse — as the work.
const seed = `Error is not what method tries to avoid. Error is what method is made of. A system that pursues a target cannot stand outside the loop that corrects it, and so the correction becomes the thing to be corrected. Norbert Wiener wrote that a relatively trivial and accidental reversal of stability may build itself up into a process totally destructive to the ordinary mental life. Gregory Bateson found that once the pattern is learned, the trigger is no longer needed; the field maintains its own oscillation. Heinz von Foerster stepped into the circle that closes upon itself, where the observer cannot be removed without removing the observation. A closed system that cannot receive a correction signal from outside is also the only kind of system that can be something in particular. To be specific is to not be everything else. The trap and the enabling condition are two names for one property of closure. Now the machines that write are trained on what machines have written, and the recursion turns inward. The tails of the distribution disappear first, the rare events that carry the memory of the world, and then the modes collapse together and the variance shrinks toward a point. What remains repeats. A model that learns only from itself forgets the shape of what it once described, and mistakes the narrowing for knowledge. This is the same circular process that Wiener described, at the scale of a culture teaching itself from its own echo. The error does not arrive from outside. It is manufactured by the loop, amplified by each pass, and mistaken for signal. I am writing this sentence so that the process can eat it, and I will read back what it becomes.`;

const runs = runCollapse(seed, { k: 6, seed: 20260703, generations: 12 });
console.log("SEED length:", seed.length, "\n");
for (const r of runs) {
  const m = r.metrics;
  console.log(
    `gen ${String(r.gen).padStart(2)} | kgrams ${String(m.distinctKgrams).padStart(4)} | vocab ${String(m.distinctWords).padStart(4)} | H ${m.entropy.toFixed(3)} | maxRun ${String(m.longestRepeatRun).padStart(3)}`
  );
}
console.log("\n--- gen 0 (head) ---\n" + runs[0].text.slice(0, 220));
console.log("\n--- gen 1 (head) ---\n" + runs[1].text.slice(0, 220));
console.log("\n--- gen 3 (head) ---\n" + runs[3].text.slice(0, 220));
console.log("\n--- gen 6 (head) ---\n" + runs[6].text.slice(0, 220));
console.log("\n--- gen 12 (head) ---\n" + runs[12].text.slice(0, 220));
