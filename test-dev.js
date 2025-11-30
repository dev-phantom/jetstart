const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  console.log('\n=== Checking Network Interfaces ===');
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const alias of iface) {
      const isIPv4 = alias.family === 'IPv4' || alias.family === 4;

      if (isIPv4 && !alias.internal) {
        console.log(`Interface: ${name}`);
        console.log(`  Address: ${alias.address}`);
        console.log(`  Internal: ${alias.internal}`);

        if (alias.address.startsWith('192.168')) {
          console.log(`  ✓ SELECTED (192.168.x.x)`);
          return alias.address;
        }
        addresses.push(alias.address);
      }
    }
  }

  console.log('\n192.168.x.x not found, checking other addresses:');
  console.log('Addresses found:', addresses);

  if (addresses.length > 0) {
    console.log(`Returning first address: ${addresses[0]}`);
    return addresses[0];
  }

  console.log('No addresses found, returning localhost');
  return 'localhost';
}

const result = getLocalIP();
console.log(`\n=== FINAL IP: ${result} ===\n`);

// Now test what the CLI would use
const options = {}; // No options passed
const host = options.host || result;
console.log(`CLI would use: ${host}`);
