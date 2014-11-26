var angular = global.angular || require('angular');
var action = require('./action.js');
var EventEmitter = require('events').EventEmitter;
var safeDeepClone = require('./safeDeepClone.js');

function mergeStore (mixins, source) {

  var exports = Object.create(EventEmitter.prototype);

  source.actions = source.actions || [];
  source.exports = source.exports || {};

  if (mixins && Array.isArray(mixins)) {

    // Merge mixins, state, handlers and exports
    mixins.forEach(function (mixin) {
      Object.keys(mixin).forEach(function (key) {

        switch(key) {
          case 'mixins':
            // Return as actions and exports are handled on top traversal level
            return mergeStore(mixin.mixins, mixin);

          case 'actions':
            source.actions = source.actions.concat(mixin.actions);
            break;
          case 'exports':
            Object.keys(mixin.exports).forEach(function (key) {
              source.exports[key] = mixin.exports[key];
            });
            break;
          default:
            if (source[key]) {
              throw new Error('The property: ' + key + ', already exists. Can not merge mixin with keys: ' + Object.keys(mixin).join(', '));
            }
          source[key] = mixin[key];
        }

      });
    });

  }

  source.emit = function (eventName) {
    exports.emit(eventName);
    if (exports._events['all']) {
      exports._events['all'].forEach(function (event) {
        event.listener();
      });
    }
  };

  // Register actions
  source.actions.forEach(function (action) {
    if (!action || !action.handlerName) {
      throw new Error('This is not an action ' + action);
    }
    if (!source[action.handlerName]) {
      throw new Error('There is no handler for action: ' + action);
    }
    action.on('trigger', source[action.handlerName].bind(source));
  });

  // Register exports
  Object.keys(source.exports).forEach(function (key) {
    exports[key] = function () {
      return safeDeepClone('[Circular]', [], source.exports[key].apply(source, arguments));
    };
  });

  return exports;

}

var flux = {
  actions: function () {
    return action.apply(null, arguments);
  },
  store: function (definition) {
    return mergeStore(definition.mixins, definition);
  }
}

angular.module('flux', [])
.constant('flux', flux)
.run(['$rootScope', function($rootScope) {
  $rootScope.$listenTo = function (store, eventName, callback) {
    callback = callback.bind(this);
    store.addListener(eventName, callback);
    this.$on('$destroy', function () {
      store.removeListener(eventName, callback);
    });
  };
}]);
