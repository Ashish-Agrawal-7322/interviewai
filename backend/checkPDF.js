import fs from 'fs';
const buf = fs.readFileSync('uploads/resume_1782018694482_6a377222c4057a1bd983b8ca.pdf');
console.log(buf.slice(0, 10).toString('utf-8'));
process.exit(0);
