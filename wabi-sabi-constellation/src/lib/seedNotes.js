import { newId } from './storage.js';

// A real person's idea inbox: a creative side project (a small ceramics
// practice), a creative philosophy, half-formed business ideas, health and
// rhythm scraps, a few stray observations. Varied tones and lengths.
const RAW = [
  {
    title: 'glaze tests, batch 4',
    body:
      'the matte one cracked again on the rim. the satin held. wonder if it ' +
      'has to do with how long i wait between coats — i was in a hurry monday.',
  },
  {
    title: 'a kind of attention',
    body:
      'the only thing i actually want from a creative practice is the kind ' +
      'of attention it asks of me. the objects are almost a side effect.',
  },
  {
    title: 'small kiln, rented studio space?',
    body:
      'pricing out a shared studio in the east end — ~$180/mo for a shelf ' +
      'and access to a community kiln. would mean i could fire weekly ' +
      'instead of hoarding bisque for a month.',
  },
  {
    title: 'why i keep dropping yoga',
    body:
      'three weeks in, three weeks out. i think the issue isnt time, its ' +
      'that i treat it as a thing to finish instead of a thing to inhabit.',
  },
  {
    title: 'mug subscription — bad idea?',
    body:
      'one handmade mug a month, $40, three months minimum. people would ' +
      'either love this or it would feel like an obligation. not sure which.',
  },
  {
    title: 'sourdough notes',
    body:
      'the loaf with the cold overnight proof had a way deeper flavor. the ' +
      'rushed one looked nice but tasted like nothing. tempted to read ' +
      'something into this.',
  },
  {
    title: 'an aesthetic of leftover',
    body:
      'kintsugi is so overcited but the real thing about it isnt the gold ' +
      'lines, its the implication that the cracked version is more ' +
      'interesting than the original. i want my work to actually believe that.',
  },
  {
    title: 'newsletter idea',
    body:
      'a tiny monthly letter — one piece i made that month, one paragraph ' +
      'about what it taught me, one photograph. no marketing. no cta. just ' +
      'the letter.',
  },
  {
    title: 'morning walk, tues',
    body:
      'fog so thick the cedar at the end of the block looked like it was ' +
      'drawn in pencil. couple minutes of standing there. felt important ' +
      'in a way i cant defend.',
  },
  {
    title: 'on finishing things',
    body:
      'i finish almost nothing and it bothers me less than it used to. ' +
      'maybe finishing is overrated for the kinds of things i care about.',
  },
  {
    title: 'sleep',
    body:
      'in bed by 11 → up at 6:30 felt unreasonably good. the late nights ' +
      'feel productive in the moment and ruin the next 48 hours.',
  },
  {
    title: 'pricing the seconds',
    body:
      'the slightly imperfect pieces sell faster than the "perfect" ones at ' +
      'the market. people pick them up first. i should stop hiding them at ' +
      'the back of the table.',
  },
  {
    title: 'a studio of one',
    body:
      'i think i want to apprentice with someone for a season. not for the ' +
      'technique. for the company. working alone is starting to feel like ' +
      'a kind of low-grade weather.',
  },
  {
    title: 'untitled, late',
    body:
      'every good piece i have made was a recovery from a mistake. every ' +
      'piece i set out to make perfectly is dead on arrival. why do i keep ' +
      'forgetting this.',
  },
  {
    title: 'caffeine math',
    body:
      'coffee after 1pm = bad sleep = bad studio day tomorrow. the cost is ' +
      'never paid by the version of me who orders the second cup.',
  },
];

export function buildSeedNotes() {
  const now = Date.now();
  return RAW.map((n, i) => ({
    id: newId(),
    title: n.title,
    body: n.body,
    createdAt: now - (RAW.length - i) * 60_000,
  }));
}
