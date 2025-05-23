import os from 'os';
import { AppConfig } from '../config/appConfig.js';

export const getOptimalHost = (options = {}) => {
  const {
    preferIPv4 = true,
    excludePattern = ['docker', 'veth', 'br-', 'lo'],
    preferPattern = ['eth', 'en', 'em', 'eno', 'wlan', 'ens'],
  } = options;

  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const ifaceName in interfaces) {
    if (excludePattern.some(pattern => ifaceName.includes(pattern))) continue; // Skip docker interfaces

    const iface = interfaces[ifaceName];
    if (!iface) continue;

    for (const addr of iface) {
      if (addr.internal) continue;

      let priority = 0;
      if (preferIPv4 && addr.family === 'IPv4') priority += 100;

      for (let i = 0; i < preferPattern.length; i++) {
        if (ifaceName.includes(preferPattern[i])) {
          priority += 50 - (i * 5);
          break;
        }
      }

      if (addr.address.startsWith('10.')) priority += 20;
      if (addr.address.startsWith('172..')) priority += 15;
      if (addr.address.startsWith('192.168.')) priority += 10;

      candidates.push({
        address: addr.address,
        family: addr.family,
        interface: ifaceName,
        priority: priority,
      });
    }
  }
  candidates.sort((a, b) => b.priority - a.priority);

  return candidates.length > 0 ? candidates[0].address : '10.2.6.142';
}

export const getAllNetworkAddresses = () => {
  const networkInterfaces = os.networkInterfaces();
  const addresses = {
    ipv4: [],
    ipv6: [],
    all: []
  };

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (!iface.internal) {
        const addressInfo = {
          address: iface.address,
          family: iface.family,
          interface: interfaceName,
          internal: iface.internal,
        };
        addresses.all.push(addressInfo);
        if (iface.family === 'IPv4') {
          addresses.ipv4.push(iface.address);
        } else if (iface.family === 'IPv6' || iface.family === 6) {
          addresses.ipv6.push(iface.address);
        }
      }
    }
  }
  return addresses;
};


export const getServerIPs = () => {
  const addresses = getAllNetworkAddresses();
  return {
    primary: getOptimalHost(),
    ipv4: addresses.ipv4,
    ipv6: addresses.ipv6,
  }
};

export const getPrimaryIPv4 = () => {
  const addresses = getAllNetworkAddresses();
  return addresses.ipv4.length > 0 ? addresses.ipv4[0] : '127.0.0.1';
};

export const getPrimaryIPv6 = () => {
  const addresses = getAllNetworkAddresses();
  return addresses.ipv6.length > 0 ? addresses.ipv6[0] : '::1';
}

export const getSwaggerHostConfig = (options = {}) => {
  const {
    useHttps = true,
    httpPort = 5000 || parseInt(AppConfig.PORT),
    httpsPort = 443 || parseInt(AppConfig.HTTPS_PORT),
    preferredIP = null,
  } = options;

  const addresses = getAllNetworkAddresses();
  const primaryIP = preferredIP || getOptimalHost();

  const port = useHttps ? httpsPort : httpPort;
  const protocol = useHttps ? 'https' : 'http';
  const schemes = useHttps ? ['https', 'http'] : ['http'];

  const alternativeHosts = addresses.ipv4.map(ip => `${protocol}://${ip}:${port}`);


  return {
    host: `${primaryIP}:${port}`,
    schemes: schemes,
    alternativeHosts: alternativeHosts,
    description: `API is accessible at : ${alternativeHosts.join(', ')}`
  };

}