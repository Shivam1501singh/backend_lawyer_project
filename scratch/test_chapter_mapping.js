import fs from 'fs';

// Let's load the raw IPC data from prisma/ipcData.json to inspect its contents and map each section to its correct chapter
const rawIpc = JSON.parse(fs.readFileSync('/Users/admin/Desktop/lawyer_project/backend_lawyer_project/prisma/ipcData.json', 'utf8'));

// Define the 26 chapters from the PDF
const chapters = [
  { no: 1, roman: "I", name: "INTRODUCTION", start: "1", end: "5" },
  { no: 2, roman: "II", name: "GENERAL EXPLANATIONS", start: "6", end: "52A" },
  { no: 3, roman: "III", name: "OF PUNISHMENTS", start: "53", end: "75" },
  { no: 4, roman: "IV", name: "GENERAL EXCEPTIONS", start: "76", end: "106" },
  { no: 5, roman: "V", name: "OF ABETMENT", start: "107", end: "120" },
  { no: 6, roman: "VA", name: "CRIMINAL CONSPIRACY", start: "120A", end: "120B" },
  { no: 7, roman: "VI", name: "OF OFFENCES AGAINST THE STATE", start: "121", end: "130" },
  { no: 8, roman: "VII", name: "OF OFFENCES RELATING TO THE ARMY, NAVY AND AIR FORCE", start: "131", end: "140" },
  { no: 9, roman: "VIII", name: "OF OFFENCES AGAINST THE PUBLIC TRANQUILLITY", start: "141", end: "160" },
  { no: 10, roman: "IX", name: "OF OFFENCES BY OR RELATING TO PUBLIC SERVANTS", start: "161", end: "171" },
  { no: 11, roman: "IXA", name: "OF OFFENCES RELATING TO ELECTIONS", start: "171A", end: "171-I" },
  { no: 12, roman: "X", name: "OF CONTEMPTS OF THE LAWFUL AUTHORITY OF PUBLIC SERVANTS", start: "172", end: "190" },
  { no: 13, roman: "XI", name: "OF FALSE EVIDENCE AND OFFENCES AGAINST PUBLIC JUSTICE", start: "191", end: "229A" },
  { no: 14, roman: "XII", name: "OF OFFENCES RELATING TO COIN AND GOVERNMENT STAMPS", start: "230", end: "263A" },
  { no: 15, roman: "XIII", name: "OF OFFENCES RELATING TO WEIGHTS AND MEASURES", start: "264", end: "267" },
  { no: 16, roman: "XIV", name: "OF OFFENCES AFFECTING THE PUBLIC HEALTH, SAFETY, CONVENIENCE, DECENCY AND MORALS", start: "268", end: "294A" },
  { no: 17, roman: "XV", name: "OF OFFENCES RELATING TO RELIGION", start: "295", end: "298" },
  { no: 18, roman: "XVI", name: "OF OFFENCES AFFECTING THE HUMAN BODY", start: "299", end: "377" },
  { no: 19, roman: "XVII", name: "OF OFFENCES AGAINST PROPERTY", start: "378", end: "462" },
  { no: 20, roman: "XVIII", name: "OF OFFENCES RELATING TO DOCUMENTS AND TO PROPERTY MARKS", start: "463", end: "489E" },
  { no: 21, roman: "XIX", name: "OF THE CRIMINAL BREACH OF CONTRACTS OF SERVICE", start: "490", end: "492" },
  { no: 22, roman: "XX", name: "OF OFFENCES RELATING TO MARRIAGE", start: "493", end: "498" },
  { no: 23, roman: "XXA", name: "OF CRUELTY BY HUSBAND OR RELATIVES OF HUSBAND", start: "498A", end: "498A" },
  { no: 24, roman: "XXI", name: "OF DEFAMATION", start: "499", end: "502" },
  { no: 25, roman: "XXII", name: "OF CRIMINAL INTIMIDATION, INSULT AND ANNOYANCE", start: "503", end: "510" },
  { no: 26, roman: "XXIII", name: "OF ATTEMPTS TO COMMIT OFFENCES", start: "511", end: "511" }
];

console.log('Chapters defined:', chapters.length);
console.log('Raw sections count:', rawIpc.length);
