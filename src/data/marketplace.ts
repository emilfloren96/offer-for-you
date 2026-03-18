export const SERVICE_CATEGORIES = [
  { id: 'roof',        label: 'Tak',              icon: '🏠', description: 'Läggning, reparation, isolering' },
  { id: 'electrical',  label: 'El',               icon: '⚡', description: 'Installation, säkringsbox, solceller' },
  { id: 'plumbing',    label: 'VVS',              icon: '🔧', description: 'Rör, värmepump, badrum' },
  { id: 'renovation',  label: 'Renovering',       icon: '🔨', description: 'Kök, badrum, helrenovering' },
  { id: 'painting',    label: 'Målning',          icon: '🎨', description: 'Inner- och yttermålning' },
  { id: 'windows',     label: 'Fönster & Dörrar', icon: '🪟', description: 'Byte, tätning, installation' },
  { id: 'flooring',    label: 'Golv',             icon: '📐', description: 'Parkett, klinker, vinyl' },
  { id: 'foundation',  label: 'Grund & Betong',   icon: '🏗️', description: 'Dränering, platta, källare' },
  { id: 'facade',      label: 'Fasad',            icon: '🏡', description: 'Puts, panel, tegel' },
  { id: 'garden',      label: 'Trädgård',         icon: '🌿', description: 'Anläggning, skötsel, staket' },
];

export const REGIONS = [
  'Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås',
  'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping',
  'Lund', 'Umeå', 'Gävle', 'Borås', 'Södertälje',
];

export const URGENCY_OPTIONS = [
  { id: 'urgent',   label: 'Snarast möjligt', sublabel: 'Inom 1–2 veckor' },
  { id: 'soon',     label: 'Inom en månad',   sublabel: '2–4 veckor' },
  { id: 'flexible', label: 'Flexibel',        sublabel: 'Ingen stress' },
];

export interface Professional {
  id: string;
  name: string;
  company: string;
  categories: string[];
  region: string;
  score: number;       // 0–100 Energybrand score
  premium: boolean;
  verified: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  bio: string;
  initials: string;
  avatarColor: string;
  phone: string;
  email: string;
  responseTime: string;
}

export const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: '1',
    name: 'Anders Lindqvist',
    company: 'Lindqvist Bygg AB',
    categories: ['roof', 'renovation', 'facade'],
    region: 'Stockholm',
    score: 94,
    premium: true,
    verified: true,
    rating: 4.9,
    reviewCount: 47,
    completedJobs: 83,
    bio: 'Specialiserade på takbyten och helrenoveringar. 15 års erfarenhet med fokus på kvalitet och hållbarhet.',
    initials: 'AL',
    avatarColor: '#004494',
    phone: '070-111 22 33',
    email: 'anders@lindqvistbygg.se',
    responseTime: '< 2 timmar',
  },
  {
    id: '2',
    name: 'Maria Svensson',
    company: 'MS El & Teknik',
    categories: ['electrical'],
    region: 'Stockholm',
    score: 88,
    premium: true,
    verified: true,
    rating: 4.8,
    reviewCount: 31,
    completedJobs: 56,
    bio: 'Legitimerad elektriker med specialkompetens inom solceller och laddboxar. ROT-godkänd.',
    initials: 'MS',
    avatarColor: '#c0392b',
    phone: '070-222 33 44',
    email: 'maria@mselteknik.se',
    responseTime: '< 4 timmar',
  },
  {
    id: '3',
    name: 'Johan Berg',
    company: 'Berg VVS',
    categories: ['plumbing'],
    region: 'Göteborg',
    score: 85,
    premium: false,
    verified: true,
    rating: 4.7,
    reviewCount: 22,
    completedJobs: 41,
    bio: 'Auktoriserad VVS-installatör specialiserad på badrumsrenoveringar och värmepumpar.',
    initials: 'JB',
    avatarColor: '#27ae60',
    phone: '070-333 44 55',
    email: 'johan@bergvvs.se',
    responseTime: '< 1 dag',
  },
  {
    id: '4',
    name: 'Sara Nilsson',
    company: 'Nilsson Måleri',
    categories: ['painting', 'renovation'],
    region: 'Malmö',
    score: 79,
    premium: false,
    verified: true,
    rating: 4.6,
    reviewCount: 18,
    completedJobs: 34,
    bio: 'Utbildad målare med 10 år i branschen. Erfarenhet av nybyggnation och renovering.',
    initials: 'SN',
    avatarColor: '#8e44ad',
    phone: '070-444 55 66',
    email: 'sara@nilssonmaleri.se',
    responseTime: '< 1 dag',
  },
  {
    id: '5',
    name: 'Erik Gustafsson',
    company: 'Gustafsson Tak',
    categories: ['roof', 'facade'],
    region: 'Stockholm',
    score: 91,
    premium: true,
    verified: true,
    rating: 4.9,
    reviewCount: 38,
    completedJobs: 67,
    bio: 'Takspecialist med F-skatt och 20 år i branschen. Hanterar alla taktyper från tegel till plåt.',
    initials: 'EG',
    avatarColor: '#e67e22',
    phone: '070-555 66 77',
    email: 'erik@gustafssontak.se',
    responseTime: '< 2 timmar',
  },
  {
    id: '6',
    name: 'Lisa Karlsson',
    company: 'Karlsson Golv',
    categories: ['flooring', 'renovation'],
    region: 'Uppsala',
    score: 82,
    premium: false,
    verified: true,
    rating: 4.7,
    reviewCount: 24,
    completedJobs: 45,
    bio: 'Golvspecialist med erfarenhet av parkett, klinker och vinyl. ROT-arbeten välkomna.',
    initials: 'LK',
    avatarColor: '#16a085',
    phone: '070-666 77 88',
    email: 'lisa@karlssongolv.se',
    responseTime: '< 1 dag',
  },
  {
    id: '7',
    name: 'Mikael Holm',
    company: 'Holm Bygg & El',
    categories: ['electrical', 'renovation', 'foundation'],
    region: 'Örebro',
    score: 76,
    premium: false,
    verified: true,
    rating: 4.5,
    reviewCount: 14,
    completedJobs: 28,
    bio: 'Kombinerad kompetens inom el och bygg. Utför allt från grundarbeten till elinstallationer.',
    initials: 'MH',
    avatarColor: '#2c3e50',
    phone: '070-777 88 99',
    email: 'mikael@holmbyggel.se',
    responseTime: '< 2 dagar',
  },
  {
    id: '8',
    name: 'Anna Persson',
    company: 'Persson Trädgård',
    categories: ['garden'],
    region: 'Göteborg',
    score: 80,
    premium: false,
    verified: true,
    rating: 4.8,
    reviewCount: 20,
    completedJobs: 39,
    bio: 'Trädgårdsarkitekt med passion för hållbara och vackra utemiljöer. Specialiserad på anläggning.',
    initials: 'AP',
    avatarColor: '#27ae60',
    phone: '070-888 99 00',
    email: 'anna@perssontradgard.se',
    responseTime: '< 1 dag',
  },
];
