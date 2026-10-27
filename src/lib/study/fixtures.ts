// src/lib/study/fixtures.ts — a study for the tests, one question of every kind (2026-10-27).
// Never imported by the site or the Functions.
import type { Answers } from './answers'
import type { StudyManifest } from './manifest'

export const MANIFEST: StudyManifest = {
  $contract: 'study/1',
  id: 'studio-what-you-heard',
  title: 'What did you hear?',
  question: 'Do listeners hear the unmet share of a humanitarian appeal as silence or as noise?',
  purpose: 'This work plays the money an appeal asked for and did not get. We want to know what you heard in it.',
  reading: 'We compare the choices with the share of silence in each movement, and read the written answers for words of absence.',
  questions: [
    { id: 'heard', kind: 'choice', prompt: 'What did the silence sound like to you?', options: ['a pause', 'a gap', 'nothing'] },
    { id: 'words', kind: 'multi', prompt: 'Which words fit?', options: ['loss', 'calm', 'waste', 'debt'], max: 2 },
    { id: 'weight', kind: 'scale', prompt: 'How heavy was it?', min: 1, max: 7, labels: ['light', 'heavy'] },
    { id: 'guess', kind: 'number', prompt: 'How much of the appeal went unmet, in per cent?', min: 0, max: 100, unit: '%' },
    {
      id: 'urgent',
      kind: 'pairwise',
      prompt: 'Which should be funded first?',
      items: [
        { id: 'food', label: 'Food' },
        { id: 'water', label: 'Water' },
        { id: 'shelter', label: 'Shelter' },
        { id: 'health', label: 'Health' },
      ],
      pairs: 3,
    },
    {
      id: 'rank',
      kind: 'order',
      prompt: 'Put the movements in the order that moved you most.',
      items: [
        { id: 'first', label: 'First movement' },
        { id: 'second', label: 'Second movement' },
      ],
    },
    { id: 'note', kind: 'text', prompt: 'One word for what you heard?', max_length: 80 },
  ],
}

/** Answers as the store keeps them: each pair with its items in id order, the pairs sorted. */
export const ANSWERS: Answers = {
  heard: 'a gap',
  words: ['loss', 'debt'],
  weight: 6,
  guess: 40,
  urgent: [
    ['food', 'water', 0],
    ['health', 'shelter', 2],
    ['health', 'water', null],
  ],
  rank: ['second', 'first'],
  note: null,
}
