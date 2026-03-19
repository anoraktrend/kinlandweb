// Polyfills for browser globals in Node.js environment
if (typeof window === 'undefined') {
  global.window = global;
  global.self = global;
  global.document = {};
  global.navigator = { userAgent: 'Node.js' };
}