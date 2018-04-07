'use strict';

// main.js
describe('main', function() {
  it('has no spec implemented', function() {
    expect(true).toBe(true);
  });
});

// utils.js
describe('utils', function() {
  it('allows a child class to extends a parent class (extends)', function() {
    function A() {}
    var B = ImPro.extends(A, function() {});
    var a = new A();
    var b = new B();

    expect(a instanceof A).toBe(true);
    expect(b instanceof B).toBe(true);
    expect(b instanceof A).toBe(true);
    expect(a instanceof B).toBe(false);
  });

  it('allows a child class to call its parent constructor (super)', function() {
    function A(paramA) {
      this.paramA = paramA;
    }
    var B = ImPro.extends(A, function(paramB1, paramB2) {
      ImPro.super(this, [paramB2]);
      this.paramB1 = paramB1;
      this.paramB2 = paramB2;
    });
    var a = new A('test');
    var b = new B(true, 5);

    expect(a instanceof A).toBe(true);
    expect(b instanceof B).toBe(true);
    expect(b instanceof A).toBe(true);
    expect(a instanceof B).toBe(false);
    expect(a.paramA).toBe('test');
    expect(b.paramA).toBe(5);
    expect(b.paramB1).toBe(true);
    expect(b.paramB2).toBe(5);
  });

  it('allows to define an enum from an array of string (enum/EnumItem)', function() {
    var ArrayEnumItem;
    var arrayEnum = ImPro.enum(['Label1', 'Label2'], ArrayEnumItem = ImPro.EnumItem);

    expect(arrayEnum.Label1 instanceof ArrayEnumItem).toBe(true);
    expect(arrayEnum.Label2 instanceof ImPro.EnumItem).toBe(true);
    expect(typeof arrayEnum.Label1.value).toBe('number');
    expect(typeof arrayEnum.Label2.label).toBe('string');
    expect(arrayEnum.Label1.value).toBe(0);
    expect(arrayEnum.Label2.value).toBe(1);
    expect(arrayEnum.Label1.label).toBe('Label1');
    expect(arrayEnum.Label2.label).toBe('Label2');
  });

  it('allows to define an enum from a string:number object (enum/EnumItem)', function() {
    var ObjectEnumItem;
    var objectEnum = ImPro.enum({'Label1': 10, 'Label2': 20}, ObjectEnumItem = ImPro.EnumItem);

    expect(objectEnum.Label1 instanceof ObjectEnumItem).toBe(true);
    expect(objectEnum.Label2 instanceof ImPro.EnumItem).toBe(true);
    expect(typeof objectEnum.Label1.value).toBe('number');
    expect(typeof objectEnum.Label2.label).toBe('string');
    expect(objectEnum.Label1.value).toBe(10);
    expect(objectEnum.Label2.value).toBe(20);
    expect(objectEnum.Label1.label).toBe('Label1');
    expect(objectEnum.Label2.label).toBe('Label2');
  });

  it('allows to get an accurate type string from an instance (typeof)', function() {
    expect(ImPro.typeof(undefined)).toBe('Undefined');
    expect(ImPro.typeof(null)).toBe('Null');
    expect(ImPro.typeof(new Boolean())).toBe('Boolean');
    expect(ImPro.typeof(true)).toBe('Boolean');
    expect(ImPro.typeof(false)).toBe('Boolean');
    expect(ImPro.typeof(1 > 0)).toBe('Boolean');
    expect(ImPro.typeof(new Number())).toBe('Number');
    expect(ImPro.typeof(0)).toBe('Number');
    expect(ImPro.typeof(3.14)).toBe('Number');
    expect(ImPro.typeof(Math.PI)).toBe('Number');
    expect(ImPro.typeof(NaN)).toBe('Number');
    expect(ImPro.typeof(Infinity)).toBe('Number');
    expect(ImPro.typeof(new String())).toBe('String');
    expect(ImPro.typeof('')).toBe('String');
    expect(ImPro.typeof(new Array())).toBe('Array');
    expect(ImPro.typeof([])).toBe('Array');
    expect(ImPro.typeof(new Function())).toBe('Function');
    expect(ImPro.typeof(function() {})).toBe('Function');
    expect(ImPro.typeof(expect)).toBe('Function');
    expect(ImPro.typeof(Boolean)).toBe('Function');
    expect(ImPro.typeof(Number)).toBe('Function');
    expect(ImPro.typeof(String)).toBe('Function');
    expect(ImPro.typeof(Array)).toBe('Function');
    expect(ImPro.typeof(Function)).toBe('Function');
    expect(ImPro.typeof(Object)).toBe('Function');
    expect(ImPro.typeof(RegExp)).toBe('Function');
    expect(ImPro.typeof(Math.abs)).toBe('Function');
    expect(ImPro.typeof(JSON.stringify)).toBe('Function');
    expect(ImPro.typeof(new Object())).toBe('Object');
    expect(ImPro.typeof({})).toBe('Object');
    expect(ImPro.typeof(new RegExp())).toBe('RegExp');
    expect(ImPro.typeof(/[a-z]/gi)).toBe('RegExp');
    expect(ImPro.typeof(arguments)).toBe('Arguments');
    expect(ImPro.typeof(Math)).toBe('Math');
    expect(ImPro.typeof(JSON)).toBe('JSON');
    expect(ImPro.typeof(ImPro)).toBe('ImPro');
    expect(ImPro.typeof(new Uint8ClampedArray())).toBe('Uint8ClampedArray');
    expect(ImPro.typeof(new Uint8Array())).toBe('Uint8Array');
    expect(ImPro.typeof(new Uint16Array())).toBe('Uint16Array');
    expect(ImPro.typeof(new Uint32Array())).toBe('Uint32Array');
    expect(ImPro.typeof(new Int8Array())).toBe('Int8Array');
    expect(ImPro.typeof(new Int16Array())).toBe('Int16Array');
    expect(ImPro.typeof(new Int32Array())).toBe('Int32Array');
    expect(ImPro.typeof(new Float32Array())).toBe('Float32Array');
    expect(ImPro.typeof(new Float64Array())).toBe('Float64Array');
  });
});

// exception.js
describe('exception', function() {
  it('has no spec implemented', function() {
    expect(true).toBe(true);
  });
});

// image.js
describe('image', function() {
  it('has no spec implemented', function() {
    expect(true).toBe(true);
  });
});

// process.js
describe('process', function() {
  it('has no spec implemented', function() {
    expect(true).toBe(true);
  });
});
