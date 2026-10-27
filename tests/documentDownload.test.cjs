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
  const element = (tag) => ({
    tagName: tag.toUpperCase(), style: {}, attributes: {}, children: [], textContent: '',
    setAttribute(name, value) { this.attributes[name] = value; },
    appendChild(child) { this.children.push(child); return child; },
    replaceChildren(...children) {
      this.children = children;
      frames.push(...children.filter((child) => child.tagName === 'IFRAME'));
    },
  });
  const preview = {
    closed: false,
    document: {
      title: '',
      documentElement: element('html'), head: element('head'), body: element('body'),
      createElement: (tag) => {
        if (options.failFrame && tag === 'iframe') throw new Error('synthetic frame failure');
        return element(tag);
      },
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
  const themeModules = new Map();
  await module.link((specifier) => {
    if (specifier.startsWith('../theme/')) {
      const themeModule = new vm.SourceTextModule(fs.readFileSync(path.join(__dirname, '../src', specifier.slice(3) + '.js'), 'utf8'), { context });
      themeModules.set(specifier, themeModule);
      return themeModule;
    }
    if (specifier === '@mui/material/styles') {
      // Only alpha is needed by palette.js; keep the fixture free of npm dependencies.
      return new vm.SyntheticModule(['alpha'], function exposeAlpha() {
        this.setExport('alpha', (hex, opacity) => {
          const rgb = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
          return `rgba(${rgb.join(', ')}, ${opacity})`;
        });
      }, { context });
    }
    const dependency = specifier === 'axios' ? axios : { error: (message) => messages.push(message) };
    const name = specifier === 'axios' ? 'default' : 'toast';
    return new vm.SyntheticModule([name], function expose() { this.setExport(name, dependency); }, { context });
  });
  await module.evaluate();
  return { open: module.namespace.openAuthenticatedDocument, messages, calls, revoked, timers, frames, events, preview,
    palette: themeModules.get('../theme/palette').namespace.default,
    typography: themeModules.get('../theme/typography').namespace.default,
    createdUrls: () => created, wasOpened: () => opened };
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

for (const status of [401, 403, 404, 429, 500, 503]) {
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
    assert.match(f.messages[0], /sesión|documento|solicitudes/);
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
    if (label === 'JSON 2xx') assert.match(f.messages[0], /Inicia sesión de nuevo/);
  });
}

test('network failure and timeout: close tab and report controlled error', async () => {
  for (const code of ['ERR_NETWORK', 'ECONNABORTED']) {
    const f = await fixture({ request: async () => { throw { code }; } });
    assert.equal(await f.open('/api/invoices/1/download', 'invoice_1.pdf'), false);
    assert.equal(f.preview.closed, true);
    assert.match(f.messages[0], /conexión/);
  }
});

test('pop-up blocked: useful retry instruction, no request or object URL', async () => {
  const f = await fixture({ blocked: true });
  assert.equal(await f.open('/api/invoices/1/download', 'invoice_1.pdf'), false);
  assert.equal(f.calls.length, 0);
  assert.match(f.messages[0], /Permite las ventanas emergentes/);
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

test('static: five previous document routes and excluded backend implementation match HEAD', () => {
  const cloud = path.resolve(__dirname, '../../ia-system-cloud');
  const original = (file) => execFileSync('git', ['-c', `safe.directory=${cloud.replace(/\\/g, '/')}`, 'show', `HEAD:${file}`], { cwd: cloud, encoding: 'utf8' });
  const currentRoutes = fs.readFileSync(path.join(cloud, 'routes/api.php'), 'utf8');
  const oldRoutes = original('routes/api.php');
  for (const route of ['invoices', 'payrolls', 'bank-checks', 'requests', 'bank-checks-preview']) {
    const declaration = (source) => {
      const start = source.search(new RegExp(`Route::get\\('/${route}/\\{[^}]+\\}/download'`));
      assert.ok(start >= 0);
      return source.slice(start).split(';')[0].replace(/\r\n/g, '\n');
    };
    assert.equal(declaration(currentRoutes), declaration(oldRoutes));
  }
  for (const file of [
    'config/cors.php', 'resources/views/pdf/invoice.blade.php',
    'app/Http/Controllers/InvoiceController.php', 'app/Http/Controllers/PayrollController.php',
    'app/Http/Controllers/RequestController.php', 'app/Http/Controllers/BankCheckController.php',
    'app/Http/Controllers/BankCheckPreviewController.php', 'resources/views/pdf/fortnightly.blade.php',
    'resources/views/pdf/bank-checks.blade.php', 'resources/views/pdf/monthly.blade.php',
    'resources/views/pdf/annual.blade.php', 'resources/views/pdf/cumulative.blade.php',
    'resources/views/pdf/monthly-by-payment.blade.php',
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

test('static: invoice, payroll and request consumers remain unchanged', () => {
  const web = path.resolve(__dirname, '..');
  for (const file of ['src/pages/InvoicePage.js', 'src/pages/ServiceHistory.js', 'src/pages/NewServicePage.js', 'src/pages/PayrollPage.js', 'src/pages/RequestPage.js']) {
    const original = execFileSync('git', ['show', `HEAD:${file}`], { cwd: web, encoding: 'utf8' });
    assert.equal(fs.readFileSync(path.join(web, file), 'utf8').replace(/\r\n/g, '\n'), original.replace(/\r\n/g, '\n'));
  }
});

test('waiting UI uses real light-theme tokens, Spanish accessible status and no external data', async () => {
  let resolve;
  const pending = new Promise((done) => { resolve = done; });
  const f = await fixture({ request: () => pending });
  const filename = '<img src=x onerror=alert(1)>.pdf';
  const work = f.open('/api/invoices/1/download', filename);
  const doc = f.preview.document;
  assert.equal(doc.documentElement.lang, 'es');
  assert.equal(doc.documentElement.style.colorScheme, 'light');
  assert.equal(doc.title, filename, 'external filename is assigned only as plain title');
  assert.equal(doc.body.style.backgroundColor, f.palette.background.default);
  assert.equal(doc.body.style.fontFamily, f.typography.fontFamily);
  const main = doc.body.children[0];
  const status = main.children[0];
  assert.equal(status.attributes.role, 'status');
  assert.equal(status.attributes['aria-live'], 'polite');
  assert.equal(status.style.backgroundColor, f.palette.background.paper);
  const [spinner, heading, explanation] = status.children;
  assert.equal(spinner.style.borderTopColor, f.palette.primary.main);
  assert.equal(spinner.attributes['aria-hidden'], 'true');
  assert.equal(heading.textContent, 'Preparando documento');
  assert.equal(heading.style.fontSize, f.typography.h6.fontSize);
  assert.equal(explanation.textContent, 'El PDF se abrirá aquí cuando esté listo');
  assert.equal(explanation.style.color, f.palette.text.secondary);
  assert.equal(f.createdUrls(), 0);
  const css = doc.head.children.find((child) => child.tagName === 'STYLE').textContent;
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /animation: none/);
  assert.match(css, /100svh/);
  assert.doesNotMatch(JSON.stringify(main), /onerror|cloud\.example/);
  assert.doesNotMatch(heading.textContent + explanation.textContent, /\d+\s*%/);
  resolve({ status: 200, headers: { 'content-type': 'application/pdf' }, data: new Blob(['%PDF-1.4 synthetic']) });
  assert.equal(await work, true);
  assert.equal(doc.body.children.length, 1);
  assert.equal(doc.body.children[0].tagName, 'IFRAME');
  assert.equal(f.createdUrls(), 1);
  assert.equal(f.revoked.length, 0);
  f.events.pagehide();
  assert.equal(f.revoked.length, 1);
});

test('malformed URLs and disallowed destinations fail before popup/request/resource creation', async () => {
  const f = await fixture();
  for (const value of ['https://[', 'http://cloud.example.invalid/api/a', 'https://elsewhere.example.invalid/a', '/a?token=synthetic']) {
    assert.equal(await f.open(value, 'fixture.pdf'), false);
  }
  assert.equal(f.wasOpened(), false);
  assert.equal(f.calls.length, 0);
  assert.equal(f.createdUrls(), 0);
  assert.equal(f.timers.size, 0);
});

test('waiting UI is constructed with DOM APIs and never inserts HTML or fetches resources', () => {
  const helper = fs.readFileSync(path.join(__dirname, '../src/utils/documentDownload.js'), 'utf8');
  assert.doesNotMatch(helper, /innerHTML|document\.write|insertAdjacentHTML|@import|url\(/);
  assert.match(helper, /showDocumentLoading\(preview\);\s*const response = await axios\.get/);
});

test('viewer DOM failure releases an already-created Blob URL and reports a controlled error', async () => {
  const f = await fixture({ failFrame: true });
  assert.equal(await f.open('/api/invoices/1/download', 'fixture.pdf'), false);
  assert.equal(f.createdUrls(), 1);
  assert.deepEqual(f.revoked, ['blob:fixture/1']);
  assert.equal(f.preview.closed, true);
  assert.equal(f.timers.size, 0);
  assert.doesNotMatch(f.messages[0], /synthetic frame failure/);
});

const reportSource = fs.readFileSync(path.join(__dirname, '../src/pages/ReportPage.js'), 'utf8');
const reportFile = Object.freeze({
  generation_id: '00000000-0000-4000-8000-000000000000',
  file_path: '/api/reports/00000000-0000-4000-8000-000000000000/download',
  file_name: '00000000-0000-4000-8000-000000000000.pdf',
});

function pageHandler(name, context) {
  const match = reportSource.match(new RegExp(`const ${name} = async \\(\\) => \\{([\\s\\S]*?)\\r?\\n  \\};`));
  assert.ok(match, `actual page handler ${name} found`);
  return vm.runInNewContext(`(async () => {${match[1]}\n})`, context);
}

for (const outcome of ['pdf', 401, 404, 429, 500, 'json', 'html', 'blocked']) {
  test(`report page ${outcome}: shared viewer leaves generated file/modal/filters available`, async () => {
    const options = typeof outcome === 'number'
      ? { request: async () => { throw { response: { status: outcome, data: new Blob(['{}']) } }; } }
      : outcome === 'blocked' ? { blocked: true }
        : ['json', 'html'].includes(outcome) ? { response: {
          status: 200, headers: { 'content-type': outcome === 'json' ? 'application/json' : 'text/html' },
          data: new Blob([outcome === 'json' ? '{"success":false}' : '<html>Error</html>']),
        } } : {};
    const f = await fixture(options);
    const loading = [];
    const handler = pageHandler('handleOpenReport', {
      file: reportFile, openAuthenticatedDocument: f.open,
      setIsOpeningReport: (value) => loading.push(value),
      // No modal, file or filter setters: invoking any would fail this test.
    });
    await handler();
    assert.deepEqual(loading, [true, false]);
    if (outcome === 'pdf') {
      assert.equal(f.frames.length, 1);
      assert.equal(f.revoked.length, 0);
      f.events.pagehide();
      assert.equal(f.revoked.length, 1);
    } else {
      assert.equal(f.frames.length, 0);
      assert.equal(f.messages.length, 1);
      assert.equal(f.timers.size, 0);
      if (outcome !== 'blocked') assert.equal(f.preview.closed, true);
      // Retry the actual handler with the SAME file; no regeneration required.
      if (typeof outcome === 'number') {
        await handler();
        assert.equal(f.calls.length, 2);
        assert.equal(f.calls[0][0], f.calls[1][0]);
      }
    }
  });
}

for (const outcome of ['success', 'network', 401, 500]) {
  test(`report generation ${outcome}: preserves filters and safe error UI`, async () => {
    const state = { loading: false, openReport: true, openFile: false, file: null };
    const messages = [];
    const calls = [];
    const handler = pageHandler('handleGenerateReport', {
      axios: { post: async (...args) => {
        calls.push(args);
        if (outcome === 'success') return { data: reportFile };
        throw outcome === 'network' ? new Error('synthetic network failure') : { response: { status: outcome, data: { message: 'private-server-detail' } } };
      } },
      config: { APPBACK_URL: 'https://cloud.example.invalid' },
      report: { id: 1 }, localStorage: { getItem: () => 'fixture-user' },
      startDate: 'fixture-start', endDate: 'fixture-end', differenceInDays: () => 31,
      format: (date) => date, typeOfPerson: 'Interpreter', nameOfInterpreter: 'Synthetic Alpha', language: 1,
      toast: { success: (message) => messages.push(message), error: (message) => messages.push(message) },
      setIsLoading: (value) => { state.loading = value; },
      setOpenReport: (value) => { state.openReport = value; },
      setOpenFile: (value) => { state.openFile = value; },
      setFile: (value) => { state.file = value; },
      // No filter setters: do not reset selection on success or failure.
    });
    await handler();
    assert.equal(state.loading, false);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][1].filters.name_of_interpreter, 'Synthetic Alpha');
    assert.equal(messages.length, 1);
    assert.doesNotMatch(messages[0], /private-server-detail/);
    if (outcome === 'success') {
      assert.equal(state.file, reportFile);
      assert.equal(state.openFile, true);
      assert.equal(state.openReport, false);
    } else {
      assert.equal(state.openReport, true);
      assert.equal(state.openFile, false);
      assert.equal(state.file, null);
    }
  });
}

test('static: reports use the protected private contract and a retryable button', () => {
  const cloud = path.resolve(__dirname, '../../ia-system-cloud');
  const read = (file) => fs.readFileSync(path.join(cloud, file), 'utf8');
  assert.doesNotMatch(reportSource, /href=\{`\$\{file\.file_path\}/);
  assert.match(reportSource, /onClick=\{handleOpenReport\}/);
  assert.match(reportSource, /loading=\{isOpeningReport\}/);
  const routes = read('routes/api.php');
  assert.match(routes, /Route::get\('\/reports\/\{report\}\/download',[\s\S]*?->middleware\('auth:sanctum'\)[\s\S]*?->name\('reports.download'\)/);
  assert.match(read('app/Http/Middleware/Authenticate.php'), /'reports.download'/);
  const controller = read('app/Http/Controllers/ReportController.php');
  assert.equal((controller.match(/return \$this->storeGeneratedReport\(\$pdf\)/g) || []).length, 4);
  assert.doesNotMatch(controller, /app\/public\/reports|deleteFileAfterSend/);
  assert.match(read('config/filesystems.php'), /'root' => storage_path\('app\/private\/reports-v1'\)/);
  assert.match(read('app/Console/Kernel.php'), /command\('reports:prune'\)->hourly\(\)->withoutOverlapping\(\)/);
});

test('static: four report calculation/filter/rendering bodies preserve their previous code', () => {
  const cloud = path.resolve(__dirname, '../../ia-system-cloud');
  const file = 'app/Http/Controllers/ReportController.php';
  // Compare against CODEX 03, before report storage changed. HEAD now includes CODEX 04.
  const baseline = '22bfe7cf247031aebf80c0127d59914c51c6ff2a';
  const previous = execFileSync('git', ['-c', `safe.directory=${cloud.replace(/\\/g, '/')}`, 'show', `${baseline}:${file}`], { cwd: cloud, encoding: 'utf8' }).replace(/\r\n/g, '\n');
  const current = fs.readFileSync(path.join(cloud, file), 'utf8').replace(/\r\n/g, '\n');
  const bodies = (source) => source.slice(source.indexOf('    public function monthlyServiceReport('), source.indexOf('    public function show('));
  let replacements = 0;
  const expected = bodies(previous).replace(/        \$file_name = '[^\n]+;\n        \$pdf->save\(storage_path\('app\/public\/reports\/' \. \$file_name\)\);\n\n        return response\(\)->json\(\[\n            'file_name' => \$file_name,\n            'file_path' => url\('api\/reports\/' \. \$file_name \. '\/download'\),\n            'status' => 'success',\n            'message' => 'Report generated successfully',\n        \]\);/g, () => {
    replacements += 1;
    return '        return $this->storeGeneratedReport($pdf);';
  });
  assert.equal(replacements, 4);
  assert.equal(bodies(current), expected);
});
