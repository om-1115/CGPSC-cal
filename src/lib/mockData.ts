import type { SubjectGroups, DaysStore, Resource } from '../types';
import { dKey, addDays } from './dates';

export const DEFAULT_SUBJECTS: SubjectGroups = {
  A: {
    label: 'Part A · General Studies',
    items: [
      { id: 'a-philosophy', name: 'Philosophy of India (Art, Literature & Culture)' },
      { id: 'a-history',    name: 'Modern Indian History & National Movement' },
      { id: 'a-economy',    name: 'Economy of India' },
      { id: 'a-geo',        name: 'Geography of India' },
      { id: 'a-science',    name: 'General Science & Tech' },
      { id: 'a-polity',     name: 'Indian Constitution & Polity' },
      { id: 'a-env',        name: 'Environment & Ecology' },
      { id: 'a-ca',         name: 'Current Affairs — Awards & Sports' },
    ],
  },
  B: {
    label: 'Part B · Chhattisgarh GK',
    items: [
      { id: 'b-admin',    name: 'Administrative Structure & Panchayati-raj of CG' },
      { id: 'b-history',  name: 'History of CG & Freedom Movement' },
      { id: 'b-tribes',   name: 'Tribes, Traditions, Teej & Festivals of CG' },
      { id: 'b-geo',      name: 'Geography, Climate, Census, Tourist Centres of CG' },
      { id: 'b-economy',  name: 'Economy, Forest & Agriculture of CG' },
      { id: 'b-culture',  name: 'Literature, Music, Dance, Art & Culture of CG' },
      { id: 'b-ca',       name: 'Current Affairs of CG' },
      { id: 'b-industry', name: 'Industry, Energy, Water & Minerals of CG' },
    ],
  },
};

export function seedDemoData(today: Date): { days: DaysStore; resources: Resource[] } {
  const days: DaysStore = {};
  for (let i = 1; i <= 3; i++) {
    const d = addDays(today, -i);
    const k = dKey(d);
    days[k] = {
      checked: {
        'a-history': true,
        'a-polity': i <= 2,
        'b-tribes': i === 1,
      },
      notes: {
        'a-history': {
          did: i === 1
            ? 'NCERT Ch. 4 — Revolt of 1857, made a 2-page mind map'
            : 'Skimmed Spectrum, marked weak areas',
          plan: i === 1 ? 'Revise + 20 MCQs from Lucent' : 'Reread + summary',
        },
      },
    };
  }

  const resources: Resource[] = [
    {
      id: 'r1', type: 'pdf',
      name: 'NCERT Class XI — Modern India.pdf',
      addedAt: Date.now() - 86400000 * 4,
      tags: ['Modern Indian History & National Movement'],
    },
    {
      id: 'r2', type: 'link',
      name: 'PIB Archive — May 2026',
      url: 'https://pib.gov.in',
      addedAt: Date.now() - 86400000 * 2,
      tags: ['Current Affairs — Awards & Sports'],
    },
    {
      id: 'r3', type: 'pdf',
      name: 'Chhattisgarh Tribal Atlas (selected).pdf',
      addedAt: Date.now() - 86400000 * 6,
      tags: ['Tribes, Traditions, Teej & Festivals of CG', 'Geography, Climate, Census, Tourist Centres of CG'],
    },
    {
      id: 'r4', type: 'link',
      name: 'drishtiias.com — Polity Compendium',
      url: 'https://drishtiias.com',
      addedAt: Date.now() - 86400000 * 7,
      tags: ['Indian Constitution & Polity', 'MCQs'],
    },
  ];

  return { days, resources };
}

export const TAG_SHORT_MAP: Record<string, string> = {
  'Philosophy of India (Art, Literature & Culture)': 'Philosophy / Culture',
  'Modern Indian History & National Movement': 'Modern History',
  'Economy of India': 'Economy (India)',
  'Geography of India': 'Geography (India)',
  'General Science & Tech': 'Sci & Tech',
  'Indian Constitution & Polity': 'Polity',
  'Environment & Ecology': 'Environment',
  'Current Affairs — Awards & Sports': 'Current Affairs',
  'Administrative Structure & Panchayati-raj of CG': 'CG Admin & Panchayat',
  'History of CG & Freedom Movement': 'CG History',
  'Tribes, Traditions, Teej & Festivals of CG': 'CG Tribes & Culture',
  'Geography, Climate, Census, Tourist Centres of CG': 'CG Geography',
  'Economy, Forest & Agriculture of CG': 'CG Economy & Forest',
  'Literature, Music, Dance, Art & Culture of CG': 'CG Art & Music',
  'Current Affairs of CG': 'CG Current Affairs',
  'Industry, Energy, Water & Minerals of CG': 'CG Industry & Minerals',
};

export const TAG_SHORT_MAP_COMPACT: Record<string, string> = {
  ...TAG_SHORT_MAP,
  'Economy of India': 'Economy',
  'Geography of India': 'Geography',
  'Administrative Structure & Panchayati-raj of CG': 'CG Admin',
  'Tribes, Traditions, Teej & Festivals of CG': 'CG Tribes',
  'Economy, Forest & Agriculture of CG': 'CG Economy',
  'Literature, Music, Dance, Art & Culture of CG': 'CG Art & Music',
  'Industry, Energy, Water & Minerals of CG': 'CG Industry',
};

export const PICKER_TAGS = [
  'Philosophy / Culture', 'Modern History', 'Economy (India)', 'Geography (India)',
  'Sci & Tech', 'Polity', 'Environment', 'Current Affairs',
  'CG Admin & Panchayat', 'CG History', 'CG Tribes & Culture',
  'CG Geography', 'CG Economy & Forest', 'CG Art & Music',
  'CG Current Affairs', 'CG Industry & Minerals',
  'MCQs', 'Notes', 'PYQ',
];
