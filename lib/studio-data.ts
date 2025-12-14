export interface Studio {
  id: number;
  name: string;
  position: [number, number];
  type: 'Studio' | 'Producer' | 'Engineer' | 'Artist' | 'Creative';
}

export const studios: Studio[] = [
  {
    id: 1,
    name: 'The Record Co.',
    position: [42.3323, -71.0833],
    type: 'Studio',
  },
  {
    id: 2,
    name: 'Q Division Studios',
    position: [42.3656, -71.1045],
    type: 'Studio',
  },
  {
    id: 3,
    name: 'Mad Oak Studios',
    position: [42.3519, -71.1314],
    type: 'Studio',
  },
  {
    id: 4,
    name: 'Zippah Recording',
    position: [42.3488, -71.1385],
    type: 'Studio',
  },
  {
    id: 5,
    name: 'Cybersound Recording Studios',
    position: [42.3584, -71.0636],
    type: 'Studio',
  },
];
