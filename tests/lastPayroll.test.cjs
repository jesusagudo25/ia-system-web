// Execute the actual page handler with synthetic Axios/UI; no React/HTTP server needed.
// node --test tests/lastPayroll.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const web = path.resolve(__dirname, '..');
const cloud = path.resolve(web, '../ia-system-cloud');
const source = fs.readFileSync(path.join(web, 'src/pages/CAndRWizardPage.js'), 'utf8');
const match = source.match(/const getLastPayroll = async \(\) => \{([\s\S]*?)\r?\n    \}/);
assert.ok(match, 'actual getLastPayroll handler found');

function fixture(request) {
  const state = { loading: false, payrolls: ['previous-selection'], messages: [], calls: [], loadingChanges: [] };
  const run = vm.runInNewContext(`(async () => {${match[1]}\n})`, {
    axios: { get: (...args) => {
      assert.equal(state.loading, true);
      state.calls.push(args);
      return request();
    } },
    config: { APPBACK_URL: 'https://cloud.example.invalid' },
    setIsLoading: (value) => { state.loading = value; state.loadingChanges.push(value); },
    setPayrolls: (value) => { state.payrolls = value; },
    toast: { error: (message) => state.messages.push(message) },
  });
  return { run, state };
}

test('success preserves the JSON object/list, selected fields and shared Axios call', async () => {
  const payroll = Object.freeze({ id: 42, suffix_id: 'SYNTHETIC-42', end_date: '2026-01-31', total_amount: '1.00' });
  const f = fixture(async () => ({ data: payroll }));
  await f.run();
  assert.equal(f.state.payrolls.length, 1);
  assert.equal(f.state.payrolls[0], payroll);
  assert.deepEqual(f.state.calls, [['https://cloud.example.invalid/api/last-payroll']]);
  assert.deepEqual(f.state.loadingChanges, [true, false]);
  assert.deepEqual(f.state.messages, []);
});

for (const data of [null, '', undefined]) {
  test(`empty response (${String(data)}) preserves list contract without loading failure`, async () => {
    const f = fixture(async () => ({ data }));
    await f.run();
    assert.equal(f.state.payrolls.length, 1);
    assert.equal(f.state.payrolls[0], data);
    assert.equal(f.state.loading, false);
    // Same guard used by the existing selector: no option for an empty entry.
    assert.equal(f.state.payrolls.filter((payroll) => payroll?.id).length, 0);
    assert.equal(f.state.messages.length, 0);
  });
}

for (const outcome of [401, 429, 500, 503, 'network', 'timeout', 'synchronous-failure']) {
  test(`${outcome}: releases loading and displays a safe message, preserving existing list`, async () => {
    const error = typeof outcome === 'number'
      ? { response: { status: outcome, data: { message: 'private-server-detail' } }, config: { headers: { Authorization: 'private-fixture' } } }
      : new Error('private-server-detail');
    const f = fixture(outcome === 'synchronous-failure'
      ? () => { throw error; }
      : async () => { throw error; });
    await f.run();
    assert.deepEqual(f.state.loadingChanges, [true, false]);
    assert.deepEqual(f.state.payrolls, ['previous-selection']);
    assert.equal(f.state.messages.length, 1);
    assert.doesNotMatch(f.state.messages[0], /private-server-detail|private-fixture/);
    assert.match(f.state.messages[0], outcome === 401 ? /sign in again/ : /Please try again/);
  });
}

test('loading remains active until the request settles, including rejection', async () => {
  let reject;
  const pending = new Promise((resolve, rejectRequest) => { reject = rejectRequest; });
  const f = fixture(() => pending);
  const work = f.run();
  assert.equal(f.state.loading, true);
  reject({ response: { status: 401 } });
  await work;
  assert.equal(f.state.loading, false);
});

test('a retry after an error uses the same endpoint and can populate the selector', async () => {
  let attempt = 0;
  const payroll = { id: 42, suffix_id: 'SYNTHETIC-42', end_date: '2026-01-31' };
  const f = fixture(async () => {
    attempt += 1;
    if (attempt === 1) throw new Error('synthetic network failure');
    return { data: payroll };
  });
  await f.run();
  await f.run();
  assert.equal(f.state.payrolls[0], payroll);
  assert.equal(f.state.calls.length, 2);
  assert.equal(f.state.calls[0][0], f.state.calls[1][0]);
  assert.deepEqual(f.state.loadingChanges, [true, false, true, false]);
});

function original(root, file) {
  return execFileSync('git', ['-c', `safe.directory=${root.replace(/\\/g, '/')}`, 'show', `HEAD:${file}`], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n');
}

test('static: protected last-payroll uses the existing explicit JSON 401 contract', () => {
  const routes = fs.readFileSync(path.join(cloud, 'routes/api.php'), 'utf8');
  const middleware = fs.readFileSync(path.join(cloud, 'app/Http/Middleware/Authenticate.php'), 'utf8');
  assert.match(routes, /Route::get\('\/last-payroll', \[PayrollController::class, 'lastPayroll'\]\)\s*->middleware\('auth:sanctum'\)\s*->name\('payrolls.last'\)/);
  assert.match(middleware, /routeIs\([\s\S]*?'payrolls.last'[\s\S]*?throw new HttpResponseException\(response\(\)->json\(/);
  assert.match(middleware, /'message' => 'Unauthenticated\.'/);
  assert.match(middleware, /401\)->header\('Cache-Control', 'private, no-store'\)/);
  // The six existing declarations are byte-equivalent after line-ending normalization.
  const before = original(cloud, 'routes/api.php');
  const declarations = (text) => [...text.matchAll(/Route::get\('[^']+\/download',[\s\S]*?;/g)].map((m) => m[0].replace(/\r\n/g, '\n'));
  assert.equal(declarations(routes).length, 6);
  assert.deepEqual(declarations(routes), declarations(before));
});

test('static: controller/model, interceptor, guard and other C&R operations are unchanged', () => {
  for (const file of ['app/Http/Controllers/PayrollController.php', 'app/Models/Payroll.php']) {
    assert.equal(fs.readFileSync(path.join(cloud, file), 'utf8').replace(/\r\n/g, '\n'), original(cloud, file));
  }
  // CODEX 06 intentionally changes the PDF helper; its own suite covers that flow.
  for (const file of ['src/App.js', 'src/components/auth/PrivateRoute.js']) {
    assert.equal(fs.readFileSync(path.join(web, file), 'utf8').replace(/\r\n/g, '\n'), original(web, file));
  }
  const withoutHandler = (text) => text.replace(/    const getLastPayroll = (?:async )?\(\) => \{[\s\S]*?\r?\n    \}/, '').replace(/\r\n/g, '\n');
  assert.equal(withoutHandler(source), withoutHandler(original(web, 'src/pages/CAndRWizardPage.js')));
  assert.match(source, /payroll\?\.id \? \(/);
  assert.match(source, /payroll\.suffix_id/);
  assert.match(source, /payroll\.end_date/);
  assert.match(source, /useEffect\(\(\) => \{\s*getLastPayroll\(\);\s*\}, \[\]\)/);
});
