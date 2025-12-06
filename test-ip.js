const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const alias of iface) {
      const isIPv4 = alias.family === 'IPv4' || alias.family === 4;

      if (isIPv4 && !alias.internal) {
        console.log(`Found IPv4: ${alias.address} on ${name}`);
        if (alias.address.startsWith('192.168')) {
          console.log(`  -> SELECTED (starts with 192.168)`);
          return alias.address;
        }
        addresses.push(alias.address);
      }
    }
  }

  if (addresses.length > 0) {
    console.log(`Returning first address: ${addresses[0]}`);
    return addresses[0];
  }

  console.log('No addresses found, returning localhost');
  return 'localhost';
}

console.log('Final IP:', getLocalIP());
