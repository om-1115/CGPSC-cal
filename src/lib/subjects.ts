import type { SubjectGroups } from '../types';

export const SUBJECTS: SubjectGroups = {
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
      { id: 'a-ca',         name: 'Current Affairs – Awards & Sports' },
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
