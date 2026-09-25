import fs from 'fs';

const rawIpc = JSON.parse(fs.readFileSync('/Users/admin/Desktop/lawyer_project/backend_lawyer_project/prisma/ipcData.json', 'utf8'));
console.log(`Total sections in ipcData.json: ${rawIpc.length}`);
console.log('Sample item 0:', JSON.stringify(rawIpc[0], null, 2));
console.log('Sample item 120A / 120B:', rawIpc.filter(s => s.sectionNo.includes('120')));
console.log('Last 5 items:', rawIpc.slice(-5).map(s => s.sectionNo));
