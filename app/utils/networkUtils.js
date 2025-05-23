import os from 'os';
import { AppConfig } from '../config/appConfig.js';


export const getPrimaryIP = () => {
  const interfaces = os.networkInterfaces();
  for (const ifaceName in interfaces) {
    const iface = interfaces[ifaceName];
    if (iface) {
      for (const alias of iface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  return '127.0.0.1';
};


export const getOptimalHost = () => {
  const networkIface = os.networkInterfaces();
  const candidates = [];

  for (const ifaceName in networkIface) {
    const iface = networkIface[ifaceName];
    if (iface) {
      for (const alias of iface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          candidates.push({
            address: alias.address,
            ifaceName: ifaceName,
            priority: getPriority(ifaceName, alias.address),
          });
        }
      }
    }
  }
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates.length > 0 ? candidates[0].address : '127.0.0.1';
}

const getPriority = (ifaceName, address) => {
  let priority = 0;

  if (ifaceName.includes('eth') || ifaceName.includes('en')) priority += 10;
  if (ifaceName.includes('wlan') || ifaceName.includes('wifi')) priority += 5;

  if (address.startsWith('192.168.')) priority += 8;
  if (address.startsWith('10.')) priority += 7;
  if (address.startsWith('172.')) priority += 6;

  return priority;
}


export const getServerIPs = () => {
  const networkInterfaces = os.networkInterfaces();
  const ipAddresses = {
    ipv4: [],
    ipv6: [],
    primary: null,
  };

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      // Skip internal addresses
      if (!iface.internal) {
        if (iface.family === 'IPv4') {
          ipAddresses.ipv4.push(iface.address);
          if (!ipAddresses.primary) {
            ipAddresses.primary = iface.address;
          }
        } else if (iface.family === 'IPv6' || iface.family === 6) {
          ipAddresses.ipv6.push(iface.address);
        }
      }
    }
  }

  if (!ipAddresses.primary) {
    ipAddresses.primary = '127.0.0.1';
  }

  return ipAddresses;
};


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
  const primaryIP = preferredIP || getPrimaryIPv4();

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