/**
 * NONCHALANT JR STUDIO - Clean Fresh State
 * No dummy matches, no fake trophies, no fake squads.
 * Clean slate ready for NONCHALANT JR and friends.
 */

const DemoData = {
  matches: [],
  trophies: [],
  tactics: [],
  squads: [
    {
      id: 'squad_default',
      name: 'NONCHALANT JR - Main Squad',
      teamStrength: 0,
      manager: {
        name: 'No Coach Set',
        playstyle: 'Click "Edit Squad & Coach" to configure',
        boost: 'No Boost'
      },
      roles: {
        captain: 'Not Assigned',
        longFK: 'Not Assigned',
        shortFK: 'Not Assigned',
        secondFK: 'Not Assigned',
        leftCorner: 'Not Assigned',
        rightCorner: 'Not Assigned',
        penalty: 'Not Assigned'
      },
      startingXI: [],
      subs: []
    }
  ],
  tournament: null
};
