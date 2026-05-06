// territory-data.js — empty by default; the manager fills it in.
// Persisted to localStorage under 'fp:territories' so reloads don't wipe work.
// Schema:
//   { id, name, price, color, paths: [[{lat,lng}, ...], ...], notes }
window.TERRITORY_STORE_KEY = 'fp:territories:v1';

window.DEFAULT_PALETTE = [
  '#BFE3F4', // lightest blue
  '#7FCBE8',
  '#2BA8E0', // pool blue
  '#1E7BC2',
  '#2FB39A', // teal
  '#F5A623', // sun
  '#E8463E', // coral
  '#6B3FA0', // plum
];

// Default map center — middle of the Naples → Orlando ribbon, west coast Florida.
window.MAP_DEFAULT = {
  center: { lat: 27.20, lng: -82.05 },
  zoom: 8,
};
