export const routes = [
  {
    id: 'fh-sm',
    name: 'Falmouth – St Mawes',
    crossing: 20,
    first: '08:15',
    last: '18:45',
    every: 30,
    winterLast: '17:15',
  },
  {
    id: 'fh-fl',
    name: 'Falmouth – Flushing',
    crossing: 10,
    first: '07:40',
    last: '23:00',
    every: 20,
    winterLast: '19:00',
  },
  {
    id: 'sm-pl',
    name: 'St Mawes – Place',
    crossing: 8,
    first: '09:00',
    last: '17:00',
    every: 30,
    winterLast: null,
  },
]
export const fares = [
  { ticket: 'Adult single', price: 7.5 },
  { ticket: 'Adult return', price: 12 },
  { ticket: 'Child (5–15) single', price: 4 },
  { ticket: 'Bike', price: 2 },
  { ticket: 'Dog', price: 0 },
  { ticket: 'Ten-trip carnet', price: 55 },
]
export const notices = [
  'St Mawes – Place runs April to October only.',
  'Winter timetable from 3 November: earlier last sailings.',
]
