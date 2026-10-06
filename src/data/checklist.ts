/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InspectionModule } from '../types';

export const CHECKLIST_TEMPLATE: InspectionModule[] = [
  {
    id: 'A',
    title: 'Workstation Ergonomics & Desk Setup',
    shortTitle: 'Ergonomics & Desks',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.1.2 · OSHA Computer Workstation Standards',
    items: [
      {
        id: 'A.1',
        ref: 'A.1',
        item: 'Office Chairs & Lumbar Support',
        criteria: 'Chairs are stable with smooth 5-caster base; seat height, backrest tilt, and armrest adjustments function properly without wobbling or damage.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'A.2',
        ref: 'A.2',
        item: 'Computer Monitors & Screen Height',
        criteria: 'Monitors are directly in front of staff at arm’s length with top of screen near eye level; free from severe glare or window reflections.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'A.3',
        ref: 'A.3',
        item: 'Desk Clearance & Legroom Space',
        criteria: 'Under-desk leg space is completely open and free of boxes, files, personal bags, or loose equipment to allow comfortable posture.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'A.4',
        ref: 'A.4',
        item: 'Keyboard, Mouse & Repetitive Strain',
        criteria: 'Keyboards and mice are positioned on the same surface within easy reach without twisting; wrist rests or ergonomic accessories provided where needed.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'B',
    title: 'Electrical Safety & Cable Organization',
    shortTitle: 'Electrical & Cables',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.1.1 · NFPA 70E Office Electrical Guidelines',
    items: [
      {
        id: 'B.1',
        ref: 'B.1',
        item: 'Trailing Cables & Walkway Tripping Hazards',
        criteria: 'No power cords, chargers, or network cables run across open walking areas; cords under desks are bundled or secured with rubber floor bridges.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'B.2',
        ref: 'B.2',
        item: 'Extension Sockets & Multi-Plugs',
        criteria: 'Multi-outlet power strips have surge protection and are plugged directly into wall outlets; no "daisy-chaining" (plugging power strips into one another) or overloaded sockets.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'B.3',
        ref: 'B.3',
        item: 'Office Electrical Appliances & PAT Condition',
        criteria: 'Printers, photocopiers, paper shredders, and heaters show no cord fraying, cracked plugs, or exposed wire; equipment has valid safety test inspection stickers.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'B.4',
        ref: 'B.4',
        item: 'Office Distribution Boards & Panel Access',
        criteria: 'Sub-electrical breaker panels and network cabinets are closed, locked, and have at least 1 meter (3 feet) of clear, unobstructed space in front of them.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'C',
    title: 'Walkways, Passageways & Housekeeping',
    shortTitle: 'Walkways & Housekeeping',
    statutoryRefs: 'ISO 45001:2018 Cl. 6.1.2.1 · Workplace Housekeeping Protocols',
    items: [
      {
        id: 'C.1',
        ref: 'C.1',
        item: 'Corridors & Main Office Aisles',
        criteria: 'Main pedestrian pathways and office suite corridors are wide, clean, and completely clear of cardboard delivery boxes, extra chairs, or temporary obstacles.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'C.2',
        ref: 'C.2',
        item: 'Floor Surfaces & Carpet Tiles',
        criteria: 'Carpets and floor tiles are flat with no curling edges, tears, or loose transition strips that could cause trips; hard floors are clean and free of water or spills.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'C.3',
        ref: 'C.3',
        item: 'Office Lighting & Visual Clarity',
        criteria: 'All ceiling lights and task lamps are working with no flickering tubes or dark spots; light levels are comfortable for computer work and paperwork.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'C.4',
        ref: 'C.4',
        item: 'General Waste & Paper Clutter Management',
        criteria: 'Office trash and recycling bins are not overflowing; confidential paper shredding bins are secure; no combustible paper piles stacked against heaters.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'D',
    title: 'Fire Safety & Emergency Evacuation',
    shortTitle: 'Fire & Evacuation',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.2 · Saudi Building Code (SBC 801) Fire Safety',
    items: [
      {
        id: 'D.1',
        ref: 'D.1',
        item: 'Fire Extinguishers & Fire Blankets',
        criteria: 'Wall-mounted extinguishers are fully accessible (unblocked), pressure gauge needle is in the green zone, pin and safety seal are intact, and monthly inspection tags are signed.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'D.2',
        ref: 'D.2',
        item: 'Emergency Exit Doors & Lit Signs',
        criteria: 'Emergency exit doors open outwards easily with push bars, are unlocked during business hours, and green illuminated EXIT signs are lit and visible from all desks.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'D.3',
        ref: 'D.3',
        item: 'Smoke Detectors & Manual Call Points',
        criteria: 'Ceiling smoke detectors have at least 0.5m clearance with no decorations hanging; manual "Break Glass" alarm pull stations are prominent and unblocked.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'D.4',
        ref: 'D.4',
        item: 'Evacuation Maps & Floor Warden Directory',
        criteria: 'Laminated office floor evacuation maps are clearly posted near exits and elevators showing assembly points; designated office floor fire wardens are listed with phone numbers.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'E',
    title: 'Office Pantry, Breakroom & Appliances',
    shortTitle: 'Pantry & Breakroom',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.1.2 · Workplace Hygiene & Welfare Standards',
    items: [
      {
        id: 'E.1',
        ref: 'E.1',
        item: 'Pantry Kitchen Appliances',
        criteria: 'Microwaves, electric kettles, coffee makers, and refrigerators are clean, working safely, and situated away from sink water splash zones.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'E.2',
        ref: 'E.2',
        item: 'Pantry Floor Dryness & Spill Response',
        criteria: 'Floor around sinks, coffee stations, and water coolers is dry; spill clean-up materials (paper rolls or mop) are readily accessible.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'E.3',
        ref: 'E.3',
        item: 'Drinking Water Dispensers',
        criteria: 'Water dispensers are clean and sanitized; bottle storage is tidy; drip trays are emptied without standing stagnant water.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'E.4',
        ref: 'E.4',
        item: 'Pantry Waste & Hygiene Standards',
        criteria: 'Foot-pedal garbage bins with trash liners are used and emptied daily; no uncovered perishable food left out overnight; pest prevention measures maintained.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'F',
    title: 'Storage, Shelving & Filing Cabinets',
    shortTitle: 'Storage & Shelving',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.1.1 · Safe Manual Handling Regulations',
    items: [
      {
        id: 'F.1',
        ref: 'F.1',
        item: 'Shelving Anchoring & Stability',
        criteria: 'Bookcases, tall filing units, and archive shelving racks are securely anchored to walls or floor to prevent tipping over in an emergency.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'F.2',
        ref: 'F.2',
        item: 'Heavy Item Distribution & Stacking',
        criteria: 'Heavy paper boxes and archive binders are stored on middle or lower shelves; top shelves are not overloaded and have 0.5m clearance below sprinkler heads.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'F.3',
        ref: 'F.3',
        item: 'Filing Cabinet Drawers & Interlocks',
        criteria: 'Drawers close flush without sticking out into walkways; anti-tip drawer interlocking mechanisms work so multiple heavy drawers cannot open simultaneously.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'F.4',
        ref: 'F.4',
        item: 'Safe High-Reach Step Stools',
        criteria: 'Approved safety kick-stools or step ladders are provided for reaching high shelves; staff are not standing on wheeled office chairs or desks.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'G',
    title: 'Indoor Environmental Quality & Climate',
    shortTitle: 'Indoor Climate & Air',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.1.2 · Workplace Thermal Comfort & Indoor Air',
    items: [
      {
        id: 'G.1',
        ref: 'G.1',
        item: 'HVAC Temperature & Air Circulation',
        criteria: 'Air conditioning provides comfortable office temperatures (21°C - 24°C); supply and return ceiling vents are clean and not blocked by files or partitions.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'G.2',
        ref: 'G.2',
        item: 'Indoor Air Quality & Ventilation',
        criteria: 'Office area is free from chemical solvent fumes, toner ozone odors, dampness, or musty smells; adequate fresh air exchange in meeting rooms.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'G.3',
        ref: 'G.3',
        item: 'Acoustics & Office Noise Levels',
        criteria: 'Noise from copy machines, server racks, or air diffusers does not exceed comfortable conversational volume (below 55-60 dBA in general offices).',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'G.4',
        ref: 'G.4',
        item: 'Window Blinds & Solar Heat / Glare Control',
        criteria: 'Window blinds or solar shades operate smoothly to control harsh afternoon sunlight, heat, and reflections on computer screens.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  },
  {
    id: 'H',
    title: 'First Aid, Welfare & Workplace Health',
    shortTitle: 'First Aid & Welfare',
    statutoryRefs: 'ISO 45001:2018 Cl. 8.2 · Workplace Health & Welfare Regulations',
    items: [
      {
        id: 'H.1',
        ref: 'H.1',
        item: 'First Aid Kit Availability & Supplies',
        criteria: 'First aid kit is mounted in a visible, unlocked location with green cross sign; fully stocked with in-date sterile dressings, bandages, burn relief, and antiseptic wipes.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'H.2',
        ref: 'H.2',
        item: 'Designated Office First Aiders List',
        criteria: 'Up-to-date notice posted near the first aid kit listing names and direct phone extensions of certified office first aiders on duty.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'H.3',
        ref: 'H.3',
        item: 'Restroom Sanitation & Hygiene Supplies',
        criteria: 'Office washrooms are clean, well-maintained with running warm/cold water, antibacterial soap, and paper towels or hand dryers functioning properly.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      },
      {
        id: 'H.4',
        ref: 'H.4',
        item: 'HSE Noticeboard & Incident Reporting',
        criteria: 'Official safety noticeboard displays KSIA HSE policy, emergency phone numbers (medical, security, facilities), and simple steps to report near-miss incidents.',
        status: null,
        severity: null,
        likelihood: null,
        consequence: null,
        location: '',
        finding: '',
        photos: []
      }
    ]
  }
];
