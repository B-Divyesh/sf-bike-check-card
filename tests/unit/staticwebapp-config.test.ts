import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type StaticWebAppConfig = {
  globalHeaders: Record<string, string>;
  mimeTypes: Record<string, string>;
  routes: Array<{ route: string; headers?: Record<string, string> }>;
  responseOverrides: Record<string, { rewrite: string }>;
  navigationFallback?: unknown;
};

const config = JSON.parse(readFileSync(resolve(process.cwd(), 'public/staticwebapp.config.json'), 'utf8')) as StaticWebAppConfig;

describe('static deployment response policy', () => {
  it('keeps the app shell revalidated while content-hashed assets are immutable', () => {
    expect(config.globalHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
    expect(config.routes).toContainEqual({
      route: '/assets/*',
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    });
  });

  it('serves an installable manifest and applies the required browser protections', () => {
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json; charset=utf-8');
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
    expect(config.globalHeaders['Permissions-Policy']).toBe('camera=(), geolocation=(), microphone=(), payment=(), usb=()');
    expect(config.globalHeaders['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains; preload');
  });

  it('uses direct route documents and a real not-found response', () => {
    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  });
});
