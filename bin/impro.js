'use strict';

// jshint unused:false

var ImPro = (function () {
  function ImPro() {
    var that = this;

    this.init = function() {

    };
  }

  return new ImPro();
})();


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




var ImPro;

(function(that) {
  /**
   * List of image data types
   * @type {string[]}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray | TypedArray (MDN)}
   */
  that.dataTypes = [
    'Uint8Clamped', // native default data type of canvas
    'Uint8',
    'Uint16',
    'Uint32',
    'Int8',
    'Int16',
    'Int32',
    'Float32',
    'Float64'
  ];
  /**
  * Abstract Imqge constructor. Should not be called but from a child constructor with 'super' function.
  * @class
  * @param {string} dataType - Type of data store in pixel data
  * @param {number} channels - Count of channels: 1 for Gray, 3 for RGB, 4 for RGBA
  * @param {number} width - The width of the image
  * @param {number} height - The height of the image
  * @param {TypedArray} [data] - An array containing pixel data
  */
  that.AbstractImage = function(dataType, channels, width, height, data) {
    var arrayType = window[dataType + 'Array'];
    /**
     * Description of data type
     * @type {string}
     */
    this.dataType = dataType;
    /**
     * Data array class
     * @type {function}
     */
    this.arrayType = arrayType;
    /**
     * Channel count
     * @type {number}
     */
    this.channels = channels;
    /**
     * Width of the image
     * @type {number}
     */
    this.width = width;
    /**
     * Height of the image
     * @type {number}
     */
    this.height = height;
    /**
     * Byte offset between adjacent pixels on x-axis
     * @type {number}
     */
    this.dx = channels;
    /**
     * Byte offset between adjacent pixels on y-axis
     * @type {number}
     */
    this.dy = width*channels;
    /**
     * Data array length
     * @type {number}
     */
    this.length = width*height*channels;
    /**
     * Pixel data
     * @type {TypedArray}
     */
    this.data = new arrayType(this.length);
    if (data instanceof arrayType || data instanceof Array) this.data.set(data);
  };

  /**
   * Create an image constructor for the given data type and channel count.
   * @param {string} dataType - Type of data (cf. TypedArray)
   * @param {number} channels - Number of channel: 1 or 4
   * @returns {function} Image constructor
   */
  function buildImageConstructor(dataType, channels) {
    /**
     * Create a new image with the given data type and channel count.
     * @class
     * @implements {AbstractImage}
     * @param {number} width - The width of the image
     * @param {number} height - The height of the image
     * @param {TypedArray} [data] - An array containing pixel data
     */
    var TypedImage = that.extends(that.AbstractImage, function(width, height, data) {
      that.super(this, [dataType, channels, width, height, data]);
    });

    return TypedImage;
  }

  for (var t in that.dataTypes) {
    var dataType = that.dataTypes[t];
    that[dataType + 'GrayImage'] = buildImageConstructor(dataType, 1);
    that[dataType + 'RgbImage' ] = buildImageConstructor(dataType, 3);
    that[dataType + 'RgbaImage'] = buildImageConstructor(dataType, 4);
  }
})(ImPro);


var ImPro;

(function (that) {
  // type: boolean, integer, float, select
  function ProcessParam(type, label, defaultValue, options) {

  }

  this.BooleanProcessParam = this.extends(ProcessParam, function(label, defaultValue) {
    this.super(this, ['boolean', label, defaultValue, {}]); // Call to super
  });

  /**
   * Create a new process.
   * @class
     * @param {string} name - Name of the process
     * @param {ProcessParam[]} paramConfigs - List of process inputs {'<paramId>': {label: '<paramLabel>', type: 'boolean'|'integer'|'float'}, ...}
     * @param {array} inputs - List of process inputs
     * @param {array} outputs - List of process outputs
     * @param {function(array, array)} run - function to execute
   */
  this.Process = function(name, paramConfigs, inputConfigs, outputConfigs, run) {
    this.name = name;
    this.paramConfigs = paramConfigs;
    this.inputConfigs = inputConfigs;
    this.outputConfigs = outputConfigs;
    this.run = function(inputs, params) {
      // Check inputs
      if (Object.keys(inputs).length !== 1) throw new Error('Wrong argument count');
      if (!inputs.Image) throw new Error('Missing argument "Image"');
      if (!(inputs.Image instanceof that.Uint8ClampedGrayImage)) throw new Error('Invalid type for argument "Image');

      var outputs = run(inputs, params);

      // Check outputs

      return outputs;
    };
  };

  this.testProcess = new this.Process('Test process',
    {'Image': {type: [this.Uint8ClampedGrayImage]}},
    {'Image': {type: [this.Uint8ClampedGrayImage]}},
    function(inputs) {
      if (Object.keys(inputs).length !== 1) throw new Error('Wrong argument count');
      if (!inputs.Image) throw new Error('Missing argument "Image"');
      if (!(inputs.Image instanceof that.Uint8ClampedGrayImage)) throw new Error('Invalid type for argument "Image');

      var inputImage = inputs.Image;

      var outputImage = new that.Uint8ClampedGrayImage(inputImage.width, inputImage.height);

      for (var t = 0, tt = inputImage.length; t < tt; ++t) {
        outputImage.data[t] = 0xff - inputImage.data[t];
      }

      var outputs = {'Image': outputImage};

      return outputs;
    }
  );
})(ImPro);
