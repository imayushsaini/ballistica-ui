import { TestBed } from '@angular/core/testing';
import { HostManagerService } from './host-manager.service';
import { environment } from 'src/environments/environment';

describe('HostManagerService', () => {
  let service: HostManagerService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [HostManagerService],
    });
    service = TestBed.inject(HostManagerService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isLocalIp', () => {
    it('should identify 127.0.0.1 as local', () => {
      expect(service.isLocalIp('127.0.0.1:43210')).toBeTrue();
      expect(service.isLocalIp('127.0.0.1')).toBeTrue();
      expect(service.isLocalIp('127.10.0.1:8000')).toBeTrue();
    });

    it('should identify localhost as local', () => {
      expect(service.isLocalIp('localhost:43210')).toBeTrue();
      expect(service.isLocalIp('localhost')).toBeTrue();
      expect(service.isLocalIp('my-pc.local:43210')).toBeTrue();
      expect(service.isLocalIp('dev.localhost:43210')).toBeTrue();
    });

    it('should identify 192.168.x.x private IP range as local', () => {
      expect(service.isLocalIp('192.168.1.1:43210')).toBeTrue();
      expect(service.isLocalIp('192.168.0.100:43210')).toBeTrue();
      expect(service.isLocalIp('192.168.254.254:80')).toBeTrue();
    });

    it('should identify 10.x.x.x private IP range as local', () => {
      expect(service.isLocalIp('10.0.0.1:43210')).toBeTrue();
      expect(service.isLocalIp('10.1.2.3:8080')).toBeTrue();
      expect(service.isLocalIp('10.255.255.255:43210')).toBeTrue();
    });

    it('should identify 172.16.0.0 - 172.31.255.255 private IP range as local', () => {
      expect(service.isLocalIp('172.16.0.1:43210')).toBeTrue();
      expect(service.isLocalIp('172.24.1.5:43210')).toBeTrue();
      expect(service.isLocalIp('172.31.255.255:43210')).toBeTrue();
    });

    it('should identify 169.254.x.x link-local and 0.0.0.0 as local', () => {
      expect(service.isLocalIp('169.254.1.1:43210')).toBeTrue();
      expect(service.isLocalIp('0.0.0.0:43210')).toBeTrue();
    });

    it('should identify IPv6 loopback and local addresses', () => {
      expect(service.isLocalIp('[::1]:43210')).toBeTrue();
      expect(service.isLocalIp('::1')).toBeTrue();
      expect(service.isLocalIp('fe80::1:43210')).toBeTrue();
    });

    it('should handle URL format with protocols and paths', () => {
      expect(service.isLocalIp('http://127.0.0.1:43210/api')).toBeTrue();
      expect(service.isLocalIp('https://192.168.1.5:43210')).toBeTrue();
      expect(service.isLocalIp('http://140.238.162.79:43210')).toBeFalse();
    });

    it('should return false for public / external IPs and domains', () => {
      expect(service.isLocalIp('140.238.162.79:43210')).toBeFalse();
      expect(service.isLocalIp('8.8.8.8:53')).toBeFalse();
      expect(service.isLocalIp('172.15.0.1:43210')).toBeFalse();
      expect(service.isLocalIp('172.32.0.1:43210')).toBeFalse();
      expect(service.isLocalIp('example.com:43210')).toBeFalse();
      expect(service.isLocalIp('bombsquad-community.web.app')).toBeFalse();
    });

    it('should return false for empty or invalid input', () => {
      expect(service.isLocalIp('')).toBeFalse();
    });
  });

  describe('getHostUrl', () => {
    it('should return direct URL (skipping proxy) when host is local IP', () => {
      service.switchHost('127.0.0.1:43210');
      expect(service.getHostUrl()).toBe('http://127.0.0.1:43210');

      service.switchHost('192.168.1.100:43210');
      expect(service.getHostUrl()).toBe('http://192.168.1.100:43210');

      service.switchHost('localhost:8080');
      expect(service.getHostUrl()).toBe('http://localhost:8080');
    });

    it('should return proxy URL when host is a public/remote IP', () => {
      service.switchHost('140.238.162.79:43210');
      const expectedProxy = environment.API_PROXY.replace(/\/$/, '');
      expect(service.getHostUrl()).toBe(expectedProxy);
    });

    it('should allow passing a specific host to getHostUrl', () => {
      expect(service.getHostUrl('127.0.0.1:5000')).toBe('http://127.0.0.1:5000');
      expect(service.getHostUrl('140.238.162.79:5000')).toBe(
        environment.API_PROXY.replace(/\/$/, '')
      );
    });
  });
});
