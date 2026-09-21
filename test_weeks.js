const { differenceInCalendarWeeks, addWeeks, startOfWeek, endOfWeek } = require('date-fns');

const EPOCH = new Date(2026, 7, 31); // Aug 31, 2026 (Monday)
const TODAY = new Date(); // roughly Sep 21, 2026

const currentAbsoluteWeek = differenceInCalendarWeeks(TODAY, EPOCH, { weekStartsOn: 1 });
console.log("Current absolute week:", currentAbsoluteWeek);

const base = addWeeks(EPOCH, currentAbsoluteWeek);
console.log("Base date:", base);
console.log("Start of week:", startOfWeek(base, { weekStartsOn: 1 }));
console.log("End of week:", endOfWeek(base, { weekStartsOn: 1 }));

