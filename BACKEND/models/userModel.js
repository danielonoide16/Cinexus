const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'database', 'users.json');

const read = () => JSON.parse(fs.readFileSync(FILE, 'utf-8'));
const write = (data) => fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

module.exports = { read, write };
