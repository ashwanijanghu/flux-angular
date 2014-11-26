/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var util = require('util'),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    CHANGE_EVENT = 'change';

/**
 * @class BaseStore
 * @extends EventEmitter2
 * @param dispatcher The dispatcher interface
 * @constructor
 */
function BaseStore(dispatcher) {
    EventEmitter2.call(this, { wildcard: true });
    this.dispatcher = dispatcher;
    if (this.initialize) {
        this.initialize();
    }
}

util.inherits(BaseStore, EventEmitter2);

/**
 * Add a listener for the change event
 * @method addChangeListener
 * @param {Function} callback
 */
BaseStore.prototype.addChangeListener = function addChangeListener(callback) {
  this.on(CHANGE_EVENT, callback);
};

/**
 * Remove a listener for the change event
 * @method removeChangeListener
 * @param {Function} callback
 */
BaseStore.prototype.removeChangeListener = function removeChangeListener(callback) {
  this.removeListener(CHANGE_EVENT, callback);
};

/**
 * Emit a change event
 * @method emitChange
 * @param {*} param=this
 */
BaseStore.prototype.emitChange = function emitChange(param) {
  this.emit(CHANGE_EVENT, param || this);
};

module.exports = BaseStore;
