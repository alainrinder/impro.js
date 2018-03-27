'use strict';

// main.js
describe('main', function() {
  it('has no spec implemented', function() {
    expect(true).toBe(true);
  });
});

// utils.js
describe('utils', function() {
  it('allows a class to inherit from another', function() {
    function A(paramA) {
      this.paramA = paramA;
    }
    var B = ImPro.extends(A, function(paramB1, paramB2) {
      ImPro.super(this, [paramB2]);
      this.paramB1 = paramB1;
      this.paramB2 = paramB2;
    });

    var a = new A("test");
    var b = new B(true, 5);

    expect(a instanceof A).toBe(true);
    expect(a.paramA).toEqual("test");
    expect(b instanceof B).toBe(true);
    expect(b.paramA).toEqual(5);
    expect(b.paramB1).toEqual(true);
    expect(b.paramB2).toEqual(5);
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
