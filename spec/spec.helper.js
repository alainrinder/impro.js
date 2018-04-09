'use strict';

// Supported default matchers: (node_modules/jasmine-core/lib/jasmine-core/jasmine.js)
// [expect(a).{method}(b, c, ...)]
// toBe (actual === expected)
// toBeCloseTo (Math.abs(b - a) < (Math.pow(10, -c) / 2))
// toBeDefined (void 0 !== a)
// toBeFalsy (!!!a)
// toBeGreaterThan (a > b)
// toBeLessThan (a < b)
// toBeNaN (a !== a)
// toBeNull (a === null)
// toBeTruthy (!!a)
// toBeUndefined (void 0 === a)
// toContain
// toEqual
// toHaveBeenCalled
// toHaveBeenCalledWith
// toHaveBeenCalledTimes
// toMatch
// toThrow
// toThrowError

beforeEach(function() {
  var matchers = {};

  matchers.nothing = function() {
    return {
      compare: function() {
        return { pass: true };
      }
    };
  };

  matchers.toBeOfType = function() {
    return {
      compare: function(instance, typeString) {
        return { pass: (typeof instance === typeString) };
      }
    }
  };

  matchers.toBeAnInstanceOf = function() {
    return {
      compare: function(instance, type) {
        return { pass: (instance instanceof type) };
      }
    }
  };

  function _toBeOfAdvancedType(_typeString) {
    return {
      compare: (typeof _typeString === 'string') ?
        function(instance) {
          return { pass: (Object.prototype.toString.call(instance).slice(8, -1) === _typeString) };
        } :
        function(instance, typeString) {
          return { pass: (Object.prototype.toString.call(instance).slice(8, -1) === typeString) };
        }
    };
  }

  matchers.toBeOfAdvancedType = function() {
    return _toBeOfAdvancedType();
  };

  matchers.toBeABoolean = function() {
    return _toBeOfAdvancedType('Boolean');
  };

  matchers.toBeANumber = function() {
    return _toBeOfAdvancedType('Number');
  };

  matchers.toBeAString = function() {
    return _toBeOfAdvancedType('String');
  };

  matchers.toBeAnArray = function() {
    return _toBeOfAdvancedType('Array');
  };

  matchers.toBeAFunction = function() {
    return _toBeOfAdvancedType('Function');
  };

  matchers.toBeAnObject = function() {
    return _toBeOfAdvancedType('Object');
  };

  matchers.toBeADate = function() {
    return _toBeOfAdvancedType('Date');
  };

  matchers.toBeARegExp = function() {
    return _toBeOfAdvancedType('RegExp');
  };

  matchers.toBeAnUint8ClampedArray = function() {
    return _toBeOfAdvancedType('Uint8ClampedArray');
  };

  matchers.toBeAnUint8Array = function() {
    return _toBeOfAdvancedType('Uint8Array');
  };

  matchers.toBeAnUint16Array = function() {
    return _toBeOfAdvancedType('Uint16Array');
  };

  matchers.toBeAnUint32Array = function() {
    return _toBeOfAdvancedType('Uint32Array');
  };

  matchers.toBeAnInt8Array = function() {
    return _toBeOfAdvancedType('Int8Array');
  };

  matchers.toBeAnInt16Array = function() {
    return _toBeOfAdvancedType('Int16Array');
  };

  matchers.toBeAnInt32Array = function() {
    return _toBeOfAdvancedType('Int32Array');
  };

  matchers.toBeAFloat32Array = function() {
    return _toBeOfAdvancedType('Float32Array');
  };

  matchers.toBeAFloat64Array = function() {
    return _toBeOfAdvancedType('Float64Array');
  };

  jasmine.addMatchers(matchers);
});
