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
   * var enumExample = that.enum(["Label1", "Label2"], EnumExampleItem = that.EnumItem);
   * enumExample.Label1 instanceof EnumExampleItem; // true
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
})(ImPro);
