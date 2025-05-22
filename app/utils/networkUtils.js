import os from 'os';
import { AppConfig } from '../config/appConfig.js';

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
  const primaryIP =preferredIP || getPrimaryIPv4();

  const port = useHttps ? httpsPort : httpPort;
  const protocol = useHttps? 'https' : 'http';
  const schemes = useHttps ? ['https','http'] : ['http'];

  const alternativeHosts = addresses.ipv4.map(ip => `${protocol}://${ip}:${port}`);
  

  return  {
    host: `${primaryIP}:${port}`,
    schemes:schemes,
    alternativeHosts:alternativeHosts,
    description: `API is accessible at : ${alternativeHosts.join(', ')}`
  }
  
}