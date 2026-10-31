const a = require('node:assert/strict'), {create, SLEEP_GAP} = require('../launcher/idle-policy');
const MIN = 60000;
// Advances one second at a time, as the page does, and returns what fired and when.
function run(p, from, to) {
  const fired = [];
  for (let t = from + 1000; t <= to; t += 1000) {
    const what = p.tick(t);
    if (what) fired.push([what, t]);
  }
  return fired;
}

let p = create(MIN, 5 * MIN, 0);
a.deepEqual(run(p, 0, 6 * MIN), [['saver', MIN], ['off', 5 * MIN]]);
console.log('PASS: photos at one minute, power off at five, each once');

p = create(MIN, 5 * MIN, 0);
run(p, 0, 30000);
a.equal(p.activity(30000), false);
a.deepEqual(run(p, 30000, 80000), []);
a.deepEqual(run(p, 80000, 90000), [['saver', 90000]]);
console.log('PASS: a press restarts the count');

p = create(MIN, 5 * MIN, 0);
run(p, 0, 2 * MIN);
a.equal(p.saverShown(), true);
a.equal(p.activity(2 * MIN), true, 'the press that clears the photos is reported, so it can be swallowed');
a.equal(p.saverShown(), false);
a.equal(p.activity(2 * MIN + 1000), false);
a.deepEqual(run(p, 2 * MIN + 1000, 3 * MIN + 1000), [['saver', 3 * MIN + 1000]]);
console.log('PASS: the first press only clears the photos, and the cycle can repeat');

p = create(MIN, 5 * MIN, 0);
p.visible(false, 1000);
a.deepEqual(run(p, 1000, 20 * MIN), [], 'an app in front must never start photos or power off');
p.visible(true, 20 * MIN);
a.deepEqual(run(p, 20 * MIN, 20 * MIN + 59000), []);
a.deepEqual(run(p, 20 * MIN + 59000, 20 * MIN + 60000), [['saver', 20 * MIN + 60000]]);
console.log('PASS: time only counts while Home is on screen');

p = create(MIN, 5 * MIN, 0);
run(p, 0, 30000);
const woke = 30000 + 8 * 3600000;
a.equal(p.tick(woke), 'wake', 'a night asleep is not inactivity');
a.deepEqual(run(p, woke, woke + 59000), [], 'no power-off as the TV wakes');
a.equal(p.tick(woke + 59000 + SLEEP_GAP + 1), 'wake', 'a long gap counts as sleep, even just past the limit');
console.log('PASS: waking from standby restarts the count instead of powering off');

p = create(0, 5 * MIN, 0);
a.deepEqual(run(p, 0, 5 * MIN), [['off', 5 * MIN]]);
p = create(MIN, 0, 0);
a.deepEqual(run(p, 0, 10 * MIN), [['saver', MIN]]);
console.log('PASS: photos and power-off can each be turned off alone');
