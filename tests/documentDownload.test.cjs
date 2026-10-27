// No npm packages needed: execute the actual ES module with mocked browser/Axios.
// node --experimental-vm-modules --test tests/documentDownload.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { Blob, File } = require('node:buffer');

async function fixture(options = {}) {
  const messages = [];
  const calls = [];
  const revoked = [];
  const timers = new Map();
  const frames = [];
  const events = {};
  let opened = false;
  let nextTimer = 0;
  let created = 0;
  const preview = {
    closed: false,
    document: {
      title: '',
      body: { style: {}, replaceChildren: (frame) => frames.push(frame) },
      createElement: () => ({ style: {} }),
    },
    close() { this.closed = true; },
    addEventListener: (event, handler) => { events[event] = handler; },
  };
  const axios = {
    defaults: { baseURL: 'https://cloud.example.invalid' },
    get: async (...args) => {
      assert.equal(opened, true, 'window must open before the request');
      calls.push(args);
      if (options.request) return options.request(preview);
      return options.response || {
        status: 200,
        headers: { 'content-type': 'application/pdf' },
        data: new Blob(['%PDF-1.4 synthetic'], { type: 'application/pdf' }),
      };
    },
  };
  class BrowserURL extends URL {}
  BrowserURL.createObjectURL = () => { created += 1; return `blob:fixture/${created}`; };
  BrowserURL.revokeObjectURL = (url) => revoked.push(url);
  const context = vm.createContext({
    Blob, File, URL: BrowserURL,
    window: {
      open: () => { opened = true; return options.blocked ? null : preview; },
      setInterval: (fn) => { nextTimer += 1; timers.set(nextTimer, fn); return nextTimer; },
      clearInterval: (id) => timers.delete(id),
    },
  });
  const source = fs.readFileSync(path.join(__dirname, '../src/utils/documentDownload.js'), 'utf8');
  const module = new vm.SourceTextModule(source, { context });
  await module.link((specifier) => {
    const dependency = specifier === 'axios' ? axios : { error: (message) => messages.push(message) };
    const name = specifier === 'axios' ? 'default' : 'toast';
    return new vm.SyntheticModule([name], function expose() { this.setExport(name, dependency); }, { context });
  });
  await module.evaluate();
  return { open: module.namespace.openAuthenticatedDocument, messages, calls, revoked, timers, frames, events, preview };
}

test('PDF: authenticated Axios settings, filename, opener detached and no early revoke', async () => {
  const f = await fixture();
  assert.equal(await f.open('/api/invoices/1/download', 'invoice_1.pdf'), true);
  assert.equal(f.calls[0][0], 'https://cloud.example.invalid/api/invoices/1/download');
  assert.equal(f.calls[0][1].responseType, 'blob');
  assert.equal(f.calls[0][1].headers.Accept, 'application/pdf');
  assert.equal(f.calls[0][1].timeout, 60000);
  assert.equal(f.preview.opener, null);
  assert.equal(f.preview.document.title, 'invoice_1.pdf');
  assert.equal(f.frames[0].src, 'blob:fixture/1');
  assert.equal(f.revoked.length, 0);
  f.preview.closed = true;
  for (const tick of [...f.timers.values()]) tick();
  assert.deepEqual(f.revoked, ['blob:fixture/1']);
  assert.equal(f.timers.size, 0);
});

for (const status of [401, 403, 404, 429, 500]) {
  test(`HTTP ${status}: close tab, never render error data or disclose server text`, async () => {
    const f = await fixture({ request: async () => {
      throw { response: { status, data: new Blob(['{"message":"private-server-detail"}']) } };
    } });
    assert.equal(await f.open('/api/invoices/1/download', 'invoice_1.pdf'), false);
    assert.equal(f.preview.closed, true);
    assert.equal(f.frames.length, 0);
    assert.equal(f.timers.size, 0);
    assert.equal(f.messages.length, 1);
    assert.equal(f.messages[0].includes('private-server-detail'), false);
  });
}

for (const [label, type, contents] of [
  ['JSON 2xx', 'application/json', '{"message":"Unauthenticated."}'],
  ['HTML 2xx', 'text/html', '<html>error</html>'],
  ['false PDF MIME', 'application/pdf', '{"message":"error"}'],
]) {
  test(`${label}: MIME/signature validation rejects without opening invalid file`, async () => {
    const f = await fixture({ response: { status: 200, headers: { 'content-type': type }, data: new Blob([contents]) } });
    assert.equal(await f.open('/api/invoices/1/download', 'invoice_1.pdf'), false);
    assert.equal(f.preview.closed, true);
    assert.equal(f.frames.length, 0);
    assert.equal(f.messages.length, 1);
    if (label === 'JSON 2xx') assert.match(f.messages[0], /sign in again/);
  });
}

test('network failure and timeout: close tab and report controlled error', async () => {
  for (const code of ['ERR_NETWORK', 'ECONNABORTED']) {
    const f = await fixture({ request: async () => { throw { code }; } });
    assert.equal(await f.open('/api/invoices/1/download', 'invoice_1.pdf'), false);
    assert.equal(f.preview.closed, true);
    assert.match(f.messages[0], /connection/);
  }
});

test('pop-up blocked: useful retry instruction, no request or object URL', async () => {
  const f = await fixture({ blocked: true });
  assert.equal(await f.open('/api/invoices/1/download', 'invoice_1.pdf'), false);
  assert.equal(f.calls.length, 0);
  assert.match(f.messages[0], /Allow pop-ups/);
  assert.equal(f.revoked.length, 0);
});

test('closing the reserved tab during request does not create an object URL', async () => {
  const f = await fixture({ request: async (preview) => { preview.closed = true; return {}; } });
  assert.equal(await f.open('/api/invoices/1/download', 'invoice_1.pdf'), false);
  assert.equal(f.frames.length, 0);
  assert.equal(f.timers.size, 0);
});

test('tab navigation releases Blob exactly once, even after repeated cleanup', async () => {
  const f = await fixture();
  await f.open('/api/invoices/1/download', 'invoice_1.pdf');
  f.events.pagehide();
  f.events.pagehide();
  assert.deepEqual(f.revoked, ['blob:fixture/1']);
  assert.equal(f.timers.size, 0);
});

test('repeated downloads release all resources after their tabs close', async () => {
  const f = await fixture();
  for (let i = 0; i < 5; i += 1) await f.open('/api/invoices/1/download', 'invoice_1.pdf');
  assert.equal(f.timers.size, 5);
  assert.equal(f.revoked.length, 0);
  f.preview.closed = true;
  for (const tick of [...f.timers.values()]) tick();
  assert.equal(f.revoked.length, 5);
  assert.equal(f.timers.size, 0);
});

test('reject other origins, plain HTTP and query credentials before opening/requesting', async () => {
  const f = await fixture();
  for (const url of ['https://other.example.invalid/a', 'http://cloud.example.invalid/a', '/a?token=fixture']) {
    assert.equal(await f.open(url, 'invoice.pdf'), false);
  }
  assert.equal(f.calls.length, 0);
});

test('static: all four invoice actions use the helper and no direct invoice anchors remain', () => {
  for (const [file, count] of [['InvoicePage.js', 1], ['ServiceHistory.js', 2], ['NewServicePage.js', 1]]) {
    const source = fs.readFileSync(path.join(__dirname, '../src/pages', file), 'utf8');
    assert.equal((source.match(/onClick=\{\(\) => openAuthenticatedDocument\(/g) || []).length, count);
    assert.doesNotMatch(source, /href=\{`[^`]*\/invoices\/[^`]*\/download/);
  }
  const app = fs.readFileSync(path.join(__dirname, '../src/App.js'), 'utf8');
  assert.match(app, /axios\.interceptors\.request\.use/);
  assert.match(app, /config\.headers\.Authorization = `Bearer/);
});

test('static: report route and excluded backend implementation match HEAD', () => {
  const cloud = path.resolve(__dirname, '../../ia-system-cloud');
  const original = (file) => execFileSync('git', ['-c', `safe.directory=${cloud.replace(/\\/g, '/')}`, 'show', `HEAD:${file}`], { cwd: cloud, encoding: 'utf8' });
  const currentRoutes = fs.readFileSync(path.join(cloud, 'routes/api.php'), 'utf8');
  const oldRoutes = original('routes/api.php');
  for (const route of ['reports']) {
    const line = oldRoutes.split(/\r?\n/).find((value) => value.includes(`'/${route}/`) && value.includes('/download'));
    assert.ok(line);
    assert.ok(currentRoutes.split(/\r?\n/).includes(line));
  }
  for (const file of [
    'app/Http/Controllers/ReportController.php', 'config/cors.php', 'resources/views/pdf/invoice.blade.php',
    'app/Http/Controllers/InvoiceController.php', 'app/Http/Controllers/PayrollController.php',
    'app/Http/Controllers/RequestController.php', 'app/Http/Controllers/BankCheckController.php',
    'app/Http/Controllers/BankCheckPreviewController.php', 'resources/views/pdf/fortnightly.blade.php',
    'resources/views/pdf/bank-checks.blade.php',
  ]) {
    assert.equal(fs.readFileSync(path.join(cloud, file), 'utf8').replace(/\r\n/g, '\n'), original(file).replace(/\r\n/g, '\n'));
  }
});

const phaseThreeRoutes = ['payrolls', 'bank-checks', 'requests', 'bank-checks-preview'];

for (const route of phaseThreeRoutes) {
  test(`${route}: valid synthetic PDF uses the shared viewer`, async () => {
    const f = await fixture();
    assert.equal(await f.open(`/api/${route}/42/download`, `${route}_42.pdf`), true);
    assert.equal(f.calls[0][0], `https://cloud.example.invalid/api/${route}/42/download`);
    assert.equal(f.preview.document.title, `${route}_42.pdf`);
    assert.equal(f.frames.length, 1);
    assert.equal(f.revoked.length, 0);
    f.events.pagehide();
    assert.equal(f.revoked.length, 1);
  });

  test(`${route}: HTTP 201 success=false JSON is never opened as a PDF`, async () => {
    const f = await fixture({ response: {
      status: 201,
      headers: { 'content-type': 'application/json' },
      data: new Blob(['{"success":false,"message":"synthetic-date-range-error"}']),
    } });
    assert.equal(await f.open(`/api/${route}/42/download`, `${route}_42.pdf`), false);
    assert.equal(f.preview.closed, true);
    assert.equal(f.frames.length, 0);
    assert.equal(f.timers.size, 0);
    assert.equal(f.messages.length, 1);
    assert.doesNotMatch(f.messages[0], /synthetic-date-range-error/);
  });
}

test('static: ten controls preserve route, document ID, context and accessible buttons', () => {
  const expected = {
    'PayrollPage.js': [
      ['payrolls', 'id'], ['bank-checks', 'id'],
      ['payrolls', 'payroll.id'], ['bank-checks', 'payroll.id'],
    ],
    'RequestPage.js': [
      ['requests', 'id'], ['bank-checks-preview', 'id'],
      ['requests', 'id'], ['bank-checks-preview', 'id'],
      ['requests', 'request.id'], ['bank-checks-preview', 'request.id'],
    ],
  };
  for (const [file, actions] of Object.entries(expected)) {
    const source = fs.readFileSync(path.join(__dirname, '../src/pages', file), 'utf8');
    const actual = [...source.matchAll(/<(?:IconButton|Button)\b[^>\n]*onClick=\{\(\) => openAuthenticatedDocument\(`\/api\/([^/]+)\/\$\{([^}]+)\}\/download`/g)]
      .map((match) => [match[1], match[2]]);
    assert.deepEqual(actual, actions);
    assert.doesNotMatch(source, /href=\{`[^`]*\/(?:payrolls|requests|bank-checks|bank-checks-preview)\/[^`]*\/download/);
    assert.match(source, /<ToastContainer\s*\/>/);
  }
});

test('static: four protected routes preserve controllers/binding and explicitly select JSON 401', () => {
  const cloud = path.resolve(__dirname, '../../ia-system-cloud');
  const routes = fs.readFileSync(path.join(cloud, 'routes/api.php'), 'utf8');
  const middleware = fs.readFileSync(path.join(cloud, 'app/Http/Middleware/Authenticate.php'), 'utf8');
  const definitions = [
    ['payrolls', 'payroll', 'PayrollController'], ['bank-checks', 'payroll', 'BankCheckController'],
    ['requests', 'request', 'RequestController'], ['bank-checks-preview', 'request', 'BankCheckPreviewController'],
  ];
  for (const [route, parameter, controller] of definitions) {
    const definition = routes.slice(routes.indexOf(`Route::get('/${route}/{${parameter}}/download'`)).split(';')[0];
    assert.ok(definition.startsWith(`Route::get('/${route}/{${parameter}}/download', [${controller}::class, 'pdf'])`));
    assert.match(definition, /->middleware\('auth:sanctum'\)/);
    assert.ok(definition.includes(`->name('${route}.download')`));
    assert.ok(middleware.includes(`'${route}.download'`));
  }
  assert.match(middleware, /'message' => 'Unauthenticated\.'/);
  assert.match(middleware, /401\)->header\('Cache-Control', 'private, no-store'\)/);
});

test('static: invoice consumers, shared helper and ReportPage remain unchanged', () => {
  const web = path.resolve(__dirname, '..');
  for (const file of ['src/pages/InvoicePage.js', 'src/pages/ServiceHistory.js', 'src/pages/NewServicePage.js', 'src/pages/ReportPage.js', 'src/utils/documentDownload.js']) {
    const original = execFileSync('git', ['show', `HEAD:${file}`], { cwd: web, encoding: 'utf8' });
    assert.equal(fs.readFileSync(path.join(web, file), 'utf8').replace(/\r\n/g, '\n'), original.replace(/\r\n/g, '\n'));
  }
});
