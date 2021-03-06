var assert = require('chai').assert;

import LRU from '../lru';

var lru = new LRU('lruTest');

module.exports = function LRUTest() {
  beforeEach(function() {
    lru.deregisterEventCallback();
    lru.clear();
    lru.limit(5);
  });

  it('check empty lru', function() {
    assert.equal(lru.get('one'), void 0);
  });

  it('check empty lru get', function() {
    assert.equal(lru.get(), void 0);
  });

  it('check empty lru set', function() {
    lru.set();
    assert.equal(lru.get('one'), void 0);
  });

  it('check lru for exist', function() {
  	lru.set({
      key: 'one',
      value: 'one'
    });
  	let one = lru.get('one');
    assert.equal(one, 'one');
  });

  it('check lru for not exist', function() {
  	lru.set({
      key: 'one',
      value: 'one'
    });
  	let one = lru.get('two');
    assert.equal(one, void 0);
  });

  it('check lru has id', function() {
    assert.equal(lru.getId(), 'lruTest');
    assert.equal(new LRU().getId(), 'lru');
  });

  it('check lru has key', function() {
    lru.set({
      key: 'one',
      value: 'one'
    });
    assert.equal(lru.hasKey(), false);
    assert.equal(lru.hasKey('one'), true);
    assert.equal(lru.hasKey('two'), false);
  });

  it('check lru for least and recent', function() {
    lru.set({
      key: 'one',
      value: 'one'
    });
    lru.set({
      key: 'two',
      value: 'two'
    });
    lru.set({
      key: 'three',
      value: 'three'
    });
    assert.equal(lru.isRecent('three'), true);
    assert.equal(lru.isLeast('two'), false);
    assert.equal(lru.isRecent('two'), false);
    assert.equal(lru.isLeast('one'), true);
  });

  it('check lru for keys availability', function() {
    lru.set({
      key: 'one',
      value: 'one'
    });
    lru.set({
      key: 'two',
      value: 'two'
    });

    let keys = lru.keys();
    assert.lengthOf(keys, 2);
    assert.include(keys, 'one');
    assert.include(keys, 'two');
    assert.notInclude(keys, 'three');
  });

  it('check distinct lru', function() {
    let lruOne = new LRU('lruOne'),
        lruTwo = new LRU('lruTwo');
    assert.equal(lruOne.getId(), 'lruOne');
    assert.equal(lruTwo.getId(), 'lruTwo');

    lruOne.set({
      key: 'one',
      value: 'one'
    });
    lruTwo.set({
      key: 'two',
      value: 'two'
    });
    lruTwo.set({
      key: 'two1',
      value: 'two1'
    });
    assert.equal(lruOne.hasKey('one'), true);
    assert.equal(lruOne.hasKey('two'), false);
    assert.equal(lruTwo.hasKey('one'), false);
    assert.equal(lruTwo.hasKey('two'), true);
    assert.equal(lruTwo.hasKey('two1'), true);
    assert.equal(lruOne.length(), 1);
    assert.equal(lruTwo.length(), 2);
  });

  it('check lru key using pattern', function() {
    lru.set({
      key: 'key1',
      value: 'one'
    });
    lru.set({
      key: 'key2',
      value: 'two'
    });
    lru.set({
      key: 'key3',
      value: 'three'
    });
    assert.equal(lru.find('*').length, 0);
    assert.equal(lru.find('keys*').length, 0);
    assert.equal(lru.find('key1*').length, 1);
    assert.equal(lru.find('key*').length, 3);
  });

  it('check lru clear all', function() {
  	lru.set({
      key: 'one',
      value: 'one'
    });
    lru.set({
      key: 'two',
      value: 'two'
    });
  	lru.clear();
    lru.clear(null);
    lru.clear('');
    lru.clear('three');
    assert.equal(lru.get('one'), void 0);
    assert.equal(lru.get('two'), void 0);

    // Check for allowing set after clear
    lru.set({
      key: 'one',
      value: 'one'
    });
    assert.equal(lru.get('one'), 'one');
  });

  it('check lru clear head node', function() {
    lru.set({
      key: 'one',
      value: 'one'
    });
    lru.set({
      key: 'two',
      value: 'two'
    });
    lru.clear('one');
    assert.equal(lru.get('one'), void 0);
    assert.equal(lru.get('two'), 'two');
    
    // Check for allowing set after clear
    lru.set({
      key: 'one',
      value: 'one'
    });
    assert.equal(lru.get('one'), 'one');
  });

  it('check lru clear in-between node', function() {
    lru.set({
      key: 'one',
      value: 'one'
    });
    lru.set({
      key: 'two',
      value: 'two'
    });
    lru.set({
      key: 'three',
      value: 'three'
    });
    lru.clear('two');
    assert.equal(lru.get('one'), 'one');
    assert.equal(lru.get('two'), void 0);
    assert.equal(lru.get('three'), 'three');

    // Check for allowing set after clear
    lru.set({
      key: 'two',
      value: 'two'
    });
    assert.equal(lru.get('two'), 'two');
  });

  it('check lru clear tail node', function() {
    lru.set({
      key: 'one',
      value: 'one'
    });
    lru.set({
      key: 'two',
      value: 'two'
    });
    lru.clear('two');
    assert.equal(lru.get('one'), 'one');
    assert.equal(lru.get('two'), void 0);

    // Check for allowing set after clear
    lru.set({
      key: 'two',
      value: 'two'
    });
    assert.equal(lru.get('two'), 'two');
  });

  it('check lru clear multiple nodes', function() {
    lru.set({
      key: 'one',
      value: 'one'
    });
    lru.set({
      key: 'two',
      value: 'two'
    });
    lru.set({
      key: 'three',
      value: 'three'
    });
    lru.set({
      key: 'four',
      value: 'four'
    });
    lru.set({
      key: 'five',
      value: 'five'
    });
    lru.clear(['two', 'four']);
    assert.equal(lru.get('one'), 'one');
    assert.equal(lru.get('two'), void 0);
    assert.equal(lru.get('three'), 'three');
    assert.equal(lru.get('four'), void 0);

    // Check for allowing multiple set after clear
    lru.set({
      key: 'two',
      value: 'two'
    });
    lru.set({
      key: 'four',
      value: 'four'
    });
    assert.equal(lru.get('one'), 'one');
    assert.equal(lru.get('two'), 'two');
    assert.equal(lru.get('three'), 'three');
    assert.equal(lru.get('four'), 'four');
    assert.equal(lru.get('five'), 'five');
  });

  it('check lru key using pattern', function() {
    lru.set({
      key: 'key1',
      value: 'one'
    });
    lru.set({
      key: 'key2',
      value: 'two'
    });
    lru.set({
      key: 'key3',
      value: 'three'
    });
    lru.clear('*');
    assert.equal(lru.find('key*').length, 3);
    lru.clear('keys*');
    assert.equal(lru.find('key*').length, 3);
    lru.clear('key1*');
    assert.equal(lru.find('key*').length, 2);
    lru.clear('key*');
    assert.equal(lru.find('key*').length, 0);
  });

  it('check lru rotate', function() {
    lru.set({
      key: 'one',
      value: 'one'
    });
    lru.set({
      key: 'two',
      value: 'two'
    });
    lru.set({
      key: 'three',
      value: 'three'
    });
    lru.set({
      key: 'four',
      value: 'four'
    });
    lru.set({
      key: 'five',
      value: 'five'
    });
    lru.set({
      key: 'six',
      value: 'six'
    });
    assert.equal(lru.get('one'), void 0);
    assert.equal(lru.get('three'), 'three');
		lru.set({
      key: 'seven',
      value: 'seven'
    });
  });

  it('check lru size limit', function() {
    lru.limit(3);
    lru.set({
      key: 'one',
      value: 'one'
    });
    lru.set({
      key: 'two',
      value: 'two'
    });
    lru.set({
      key: 'three',
      value: 'three'
    });
    lru.set({
      key: 'four',
      value: 'four'
    });
    assert.equal(lru.get('one'), void 0);
    assert.equal(lru.length(), 3);

    // Setting lower limit won't update cache size
    lru.limit(2);

    lru.set({
      key: 'five',
      value: 'five'
    });
    lru.set({
      key: 'six',
      value: 'six'
    });
    lru.set({
      key: 'seven',
      value: 'seven'
    });
    assert.equal(lru.get('five'), 'five');
    assert.equal(lru.length(), 3);

    // Setting higher limit allow update cache size
    lru.limit(5);
    lru.set({
      key: 'one',
      value: 'one'
    });
    lru.set({
      key: 'two',
      value: 'two'
    });
    lru.set({
      key: 'three',
      value: 'three'
    });
    assert.equal(lru.get('six'), void 0);
    assert.equal(lru.get('five'), 'five');

    // Setting empty limit dis-allow update cache size
    lru.limit();
  });

  it('check lru for key value overriding', function() {
    lru.set({
      key: 'one',
      value: 'one'
    });
    lru.set({
      key: 'one',
      value: 'two'
    });
    assert.equal(lru.get('one'), 'two');
    assert.equal(lru.length(), 1);
  });

  it('check lru for key value overriding with tti', function() {
    lru.set({
      key: 'one',
      value: 'one',
      timeToIdle: 1
    });
    lru.set({
      key: 'one',
      value: 'two'
    });
    assert.equal(lru.get('one'), 'two');
    assert.equal(lru.length(), 1);
  });

  it('check lru for key value overriding with tti', function() {
    lru.set({
      key: 'one',
      value: 'one',
      timeToLive: 1
    });
    lru.set({
      key: 'one',
      value: 'two'
    });
    assert.equal(lru.get('one'), 'two');
    assert.equal(lru.length(), 1);
  });

  it('check if lru receives updated event', function() {
    assert.equal(lru.events().CREATED, 'created');
    assert.equal(lru.events().UPDATED, 'updated');
    assert.equal(lru.events().DELETED, 'deleted');
  });

  it('check if lru receives created event', function() {
    lru.registerEventCallback(() => {
      // console.log(`LRU Event Triggered`);
      assert(true);
    });
    lru.set({
      key: 'one',
      value: 'one'
    });
  });

  it('check if lru receives updated event', function() {
    lru.registerEventCallback(() => {
      // console.log(`LRU Event Triggered`);
      assert(true);
    });
    lru.set({
      key: 'one',
      value: 'one'
    });
    lru.set({
      key: 'one',
      value: '1'
    });
  });

  it('check if lru receives deleted event', function() {
    lru.registerEventCallback(() => {
      // console.log(`LRU Event Triggered`);
      assert(true);
    });
    lru.limit(1);
    lru.set({
      key: 'one',
      value: 'one'
    });
    lru.set({
      key: 'two',
      value: 'two'
    });
  });

  it('dll should allow to clear event listeners', function() {
    lru.set({
      key: 'one',
      value: 'one'
    });
    lru.registerEventCallback(() => {
      assert(false);
    });
    lru.deregisterEventCallback();
    lru.set({
      key: 'one',
      value: '1'
    });
  });

  it('check if lru receives hit event', function() {
    let key = 'one';
    lru.registerEventCallback((evt, payload) => {
      // console.log(`LRU Event Triggered ${evt} ${JSON.stringify(payload)}`);
      if (evt === lru.events().HIT) {
        if (payload.key === key) {
          assert(true);
        } else {
          assert(false);
        }
      }
    });
    lru.set({
      key: key,
      value: 'one'
    });
    lru.get(key);
  });

  it('check if lru receives missed event', function() {
    let key = 'one',
        altKey = 'two';
    lru.registerEventCallback((evt, payload) => {
      // console.log(`LRU Event Triggered ${evt} ${JSON.stringify(payload)}`);
      if (evt === lru.events().MISSED) {
        if (payload.key === altKey) {
          assert(true);
        } else {
          assert(false);
        }
      }
    });
    lru.set({
      key: key,
      value: 'one'
    });
    lru.get(altKey);
  });
};