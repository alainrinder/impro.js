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
   * List of image channel profiles
   * @type {{Object.<string, number>}}
   */
  that.channelProfiles = {
    'Gray': 1,
    'Rgb' : 3,
    'Rgba': 4
  };

  /**
   * Abstract Image constructor. Should not be called but from a child constructor with 'super' function.
   * @class
   * @param {string} dataType - Type of data store in pixel data (see dataTypes array)
   * @param {string} channelProfile - Type and number of channels (see channelProfiles array)
   * @param {number} width - The width of the image
   * @param {number} height - The height of the image
   * @param {TypedArray} [data] - An array containing pixel data
   */
  function AbstractImage(dataType, channelProfile, width, height, data) {
    var arrayType = window[dataType + 'Array'];
    var channelCount = that.channelProfiles[channelProfile];
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
     * Channel profile
     * @type {string}
     */
    this.channelProfile = channelProfile;
    /**
     * Channel count
     * @type {number}
     */
    this.channelCount = channelCount;
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
    this.dx = channelCount;
    /**
     * Byte offset between adjacent pixels on y-axis
     * @type {number}
     */
    this.dy = width*channelCount;
    /**
     * Data array length
     * @type {number}
     */
    this.length = width*height*channelCount;
    /**
     * Pixel data
     * @type {TypedArray}
     */
    this.data = new arrayType(this.length);
    if (data instanceof arrayType || data instanceof Array) this.data.set(data);
  }

  /**
   * Create an image constructor for the given data type and channel profile.
   * @param {string} dataType - Type of data (see dataTypes array)
   * @param {string} channelProfile - Channel profile (see channelProfiles array)
   * @returns {function} Image constructor
   */
  function buildImageConstructor(dataType, channelProfile) {
    /**
     * Create a new image with the given data type and channel profile.
     * @class
     * @constructs {DataType}{ChannelProfile}Image
     * @implements {AbstractImage}
     * @param {number} width - The width of the image
     * @param {number} height - The height of the image
     * @param {TypedArray} [data] - An array containing pixel data
     */
    that[dataType + channelProfile + 'Image'] = that.extends(AbstractImage,
    function(width, height, data) {
      that.super(this, [dataType, channelProfile, width, height, data]);
    });
  }

  // For each data type, for each channel profile (Gray, RGB, RGBA), create an image constructor
  for (var t in that.dataTypes) {
    var dataType = that.dataTypes[t];
    for (var p in that.channelProfiles) {
      buildImageConstructor(dataType, p);
    }
  }
})(ImPro);


var ImPro;

(function (that) {
  /**
   * Abstract process param constructor. Should not be called but from a child constructor with 'super' function.
   * @class
   * @param {string} valueType - Expected type for value
   * @param {string} name - Name of the parameter
   * @param {*} defaultValue - Default value of the parameter
   */
  function AbstractProcessParam(valueType, name, defaultValue) {
    /**
     * Name of the parameter
     * @type {string}
     */
    this.name = name;
    /**
     * Default value of the parameter
     * @type {*}
     */
    this.defaultValue = defaultValue;
    /**
     * Expected type for value (compared with typeof)
     * @type {string}
     */
     this.valueType = valueType;
  }

  /**
   * Boolean process param constructor.
   * @class
   * @param {string} name - Name of the parameter
   * @param {boolean} [defaultValue = false] - Default value of the parameter
   */
  that.BooleanProcessParam = that.extends(AbstractProcessParam,
  function(name, defaultValue) {
    defaultValue = !!defaultValue;
    that.super(this, ['boolean', name, defaultValue]);
  });

  /**
   * Number process param constructor.
   * @class
   * @param {string} name - Name of the parameter
   * @param {Object.<string, *>} [options = {}] - Additional options: step (1), min (none), max (none)
   * @param {number} [defaultValue = 0] - Default value of the parameter
   */
  that.NumberProcessParam = that.extends(AbstractProcessParam,
  function(name, options, defaultValue) {
    defaultValue = (typeof defaultValue === 'number') ? defaultValue : 0;
    that.super(this, ['number', name, defaultValue]);
  });

  /**
   * Select process param constructor.
   * @class
   * @param {string} name - Name of the parameter
   * @param {Object.<string, *>} values - List of selectable values, with the key as label
   * @param {string|null} [defaultValue = null] - Key of the value selected by default; none if null
   */
  that.SelectProcessParam = that.extends(AbstractProcessParam,
  function(name, values, defaultValue) {
    defaultValue = (defaultValue in values) ? defaultValue : null;
    that.super(this, ['string', name, defaultValue]);
  });

  // TODO: ProcessInput & ProcessOutput classes

  /**
   * Process constructor.
   * @class
   * @param {string} name - Name of the process
   * @param {Object.<string, AbstractProcessParam>} paramConfigs - List of process params
   * @param {Object.<string, function[]>} inputConfigs - List of process inputs
   * @param {Object.<string, function[]>} outputConfigs - List of process outputs
   * @param {function(Object.<string, *>, Object.<string, *>)} run - Function to execute
   */
  that.Process = function(name, paramConfigs, inputConfigs, outputConfigs, run) {
    /**
     * Name of the process
     * @type {string}
     */
    this.name = name;
    /**
     * List of process params
     * @type {Object.<string, AbstractProcessParam>}
     */
    this.paramConfigs = paramConfigs;
    /**
     * List of process inputs
     * @type {Object.<string, *>}
     */
    this.inputConfigs = inputConfigs;
    /**
     * List of process outputs
     * @type {Object.<string, *>}
     */
    this.outputConfigs = outputConfigs;
    /**
     * Function to execute
     * @type {function(Object.<string, *>, Object.<string, *>)}
     */
    this.run = function(inputs, params) {
      // Check inputs
      for (var i in inputConfigs) {
        if (!(i in inputs)) {
          throw new Error('Missing input "' + i + '". Abort.');
        }
        var input = inputs[i], inputConfig = inputConfigs[i], inputSupportedType = false;
        for (var it in inputConfig) {
          inputSupportedType = inputSupportedType || (input instanceof inputConfig[it]);
        }
        if (!inputSupportedType) {
          throw new Error('Invalid type for input "' + i + '". Abort.');
        }
      }

      // Check params
      for (var p in paramConfigs) {
        if (!(p in params)) {
          throw new Error('Missing param "' + p + '". Abort.');
        }
        var paramSupportedType = (typeof params[p] === paramConfigs[p].valueType);
        if (!paramSupportedType) {
          throw new Error('Invalid type for param "' + p + '". Abort.');
        }
      }

      // Run
      var outputs = run(inputs, params);

      // Check outputs
      for (var o in outputConfigs) {
        if (!(o in outputs)) {
          throw new Error('Missing output "' + o + '". Abort.');
        }
        var output = outputs[o], outputConfig = outputConfigs[o], outputSupportedType = false;
        for (var ot in outputConfig) {
          outputSupportedType = outputSupportedType || (output instanceof outputConfig[ot]);
        }
        if (!outputSupportedType) {
          throw new Error('Invalid type for output "' + o + '". Abort.');
        }
      }

      return outputs;
    };
  };

  // FIXME move to test directory
  /*that.testProcess = new that.Process('Test process', {},
    {'Image': [that.Uint8ClampedGrayImage]},
    {'Image': [that.Uint8ClampedGrayImage]},
    function(inputs) {
      var inputImage = inputs.Image;

      var outputImage = new that.Uint8ClampedGrayImage(inputImage.width, inputImage.height);

      for (var t = 0, tt = inputImage.length; t < tt; ++t) {
        outputImage.data[t] = 0xff - inputImage.data[t];
      }

      return {'Image': outputImage};
    }
  );*/
})(ImPro);
