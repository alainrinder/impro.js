var ImPro;

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
})(ImPro);
