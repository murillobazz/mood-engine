import type { Profile } from '../types';
import type { DimensionId } from './dimensions';

type CookingProfile = Profile & { dimensions: readonly [DimensionId, DimensionId] };

// One profile per pair of dimensions (5 choose 2 = 10). A test checks none is missing.
export const profiles: readonly CookingProfile[] = [
  { id: 'spicy-blanket', name: 'the spicy blanket', dimensions: ['cozy', 'bold'], blurb: 'comfort food, but make it loud.' },
  { id: 'sunday-garden', name: 'the sunday garden', dimensions: ['cozy', 'fresh'], blurb: 'warm plate, something green on top.' },
  { id: 'flour-everywhere', name: 'flour everywhere', dimensions: ['cozy', 'playful'], blurb: "you want to knead something. let's knead something." },
  { id: 'slow-simmer', name: 'the slow simmer', dimensions: ['cozy', 'calm'], blurb: 'one pot, low heat, zero decisions.' },
  { id: 'citrus-fire', name: 'citrus fire', dimensions: ['bold', 'fresh'], blurb: 'chili, lime, crunch. wake up.' },
  { id: 'kitchen-chaos', name: 'kitchen chaos', dimensions: ['bold', 'playful'], blurb: 'every burner on, music too loud.' },
  { id: 'quiet-heat', name: 'the quiet heat', dimensions: ['bold', 'calm'], blurb: 'big flavor, tiny effort.' },
  { id: 'market-sprint', name: 'the market sprint', dimensions: ['fresh', 'playful'], blurb: 'raw, bright, assembled with your hands.' },
  { id: 'clean-plate', name: 'the clean plate', dimensions: ['fresh', 'calm'], blurb: 'barely cooking. technically a salad.' },
  { id: 'lazy-tinkerer', name: 'the lazy tinkerer', dimensions: ['playful', 'calm'], blurb: 'a fun little project that cleans up itself.' },
];
