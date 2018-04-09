(function(that) {
  // Inheritance with params: http://jsfiddle.net/bKUF6/38/
  //
  // Example :
  // var A = function(argA1, argA2) {
  //   ...
  // }
  // var B = ImPro.extends(A, function(argB1, argB2, argB3) {
  //   ImPro.super(this, [argB2, argB3]);
  //   ...
  // });
  //

  /**
   * Set that child class extends parent class
   * @param {function} ParentClass - The parent class
   * @param {function} ChildClass - The child class
   * @returns {function} The child class
   */
  that.extends = function(ParentClass, ChildClass) {
    ChildClass.prototype = (function(ParentClass, ChildClass) {
      function protoCreator() {
        this.constructor = ChildClass.prototype.constructor;
      }
      protoCreator.prototype = ParentClass.prototype;
      return new protoCreator();
    })(ParentClass, ChildClass);

    ChildClass.prototype.ParentClass = ParentClass;

    return ChildClass;
  };

  /**
   * Call the parent constructor from the child constructor
   * @param {*} childInstance - An instance of the child class
   * @param {array} parentArgs - List of arguments for the parent constructor
   */
  that.super = function(childInstance, parentArgs) {
    childInstance.ParentClass.apply(childInstance, parentArgs);
  };

  /**
   * EnumItem constructor.
   * @class
   * @param {string} label - Key of the enum item
   * @param {number} value - Numeric value of the enum item
   */
   that.EnumItem = function(label, value) {
     this.label = label;
     this.value = value;
   };

  /**
   * Define a typed enum from an array of string or an associative array of number.
   * Enum items are instances of PseudoEnumItemClass.
   *
   * var ArrayEnumItem;
   * var arrayEnum = that.enum(['Label1', 'Label2'], ArrayEnumItem = that.EnumItem);
   * arrayEnum.Label2 instanceof ArrayEnumItem; // true
   * objectEnum.Label2.value === 1; // true
   *
   * var ObjectEnumItem;
   * var objectEnum = that.enum({'Label1': 10, 'Label2': 20}, ObjectEnumItem = that.EnumItem);
   * objectEnum.Label1 instanceof ObjectEnumItem; // true
   * objectEnum.Label1.value === 10; // true
   *
   * @param {(string[]|Object.<string, number>)} dataList - list of keys, with or without
   * @param {function} [PseudoEnumItemClass] - class of enum items (used for type checking)
   */
  that.enum = function(dataList, PseudoEnumItemClass) {
    if (typeof PseudoEnumItemClass !== 'function') PseudoEnumItemClass = that.EnumItem;
    var result = {};
    if (dataList instanceof Array) {
      for (var v = 0; v < dataList.length; ++v) {
        result[dataList[v]] = new PseudoEnumItemClass(dataList[v], v);
      }
    } else {
      for (var l in dataList) {
        result[l] = new PseudoEnumItemClass(l, dataList[l]);
      }
    }
    return result;
  };

  /**
   * Improved version of typeof operator.
   * Supports: Undefined, Null, Boolean, Number, String, Array, Function, Object, Date, RegExp, Arguments, Math, JSON,
   * ImPro, TypedArray(Uint8Clamped, Uint8, Uint16, Uint32, Int8, Int16, Int32, Float32, Float64), ...
   * See Jasmine tests for examples.
   *
   * @param {*} instance - object or primitive whose type is to be returned
   * @return {string} Type as a capitalized string
   */
  that.typeof = function(instance) {
    return (instance === that) ? 'ImPro' : Object.prototype.toString.call(instance).slice(8, -1);
  };
})(ImPro);
