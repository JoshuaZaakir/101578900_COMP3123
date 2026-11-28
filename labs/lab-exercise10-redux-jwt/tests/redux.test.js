import { test } from 'node:test';
import assert from 'node:assert/strict';
import { store, added, toggled, removed, filterChanged, logout, traceObserver } from '../src/store.js';

test('task actions update immutable state and notify the explicit subscriber', () => {
  store.dispatch(logout());
  const before = store.getState();
  const count = traceObserver.getSnapshot().count;
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);
  store.dispatch(added({ id: 'test', title: 'Research Redux', completed: false }));
  assert.equal(before.tasks.items.length, 0);
  assert.equal(store.getState().tasks.items.length, 1);
  store.dispatch(toggled('test'));
  assert.equal(store.getState().tasks.items[0].completed, true);
  store.dispatch(filterChanged('completed'));
  assert.equal(store.getState().tasks.filter, 'completed');
  store.dispatch(removed('test'));
  assert.equal(store.getState().tasks.items.length, 0);
  assert.equal(notifications, 4);
  assert.equal(traceObserver.getSnapshot().count, count + 4);
  assert.equal(traceObserver.getSnapshot().events[0], 'tasks/removed');
  unsubscribe();
  store.dispatch(logout());
  assert.equal(notifications, 4);
  assert.equal(store.getState().auth.token, null);
  assert.equal(store.getState().tasks.filter, 'all');
});
