'use strict';

var ImPro = (function() {
  function ImPro() {}

  return new ImPro();
})();


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
    return that.extends(AbstractImage, function(width, height, data) {
      that.super(this, [dataType, channelProfile, width, height, data]);
    });
  }

  /**
   * Predefined groups of image type
   * @type {Object.<string, function[]>}
   */
  that.imageTypeGroups = {
    all: []
  };
  for (var t = 0, tt = that.dataTypes.length; t < tt; ++t) {
    that.imageTypeGroups[that.dataTypes[t]] = [];
  }
  for (var channelProfile in that.channelProfiles) {
    that.imageTypeGroups[channelProfile] = [];
  }

  /**
   * Image type string from data type and channel profile
   * @param {string} dataType - Type of data store in pixel data (see dataTypes array)
   * @param {string} channelProfile - Type and number of channels (see channelProfiles array)
   * @returns {string} Image type string
   */
   function getImageTypeString(dataType, channelProfile) {
     return dataType + channelProfile + 'Image';
   }

  // For each data type, for each channel profile (Gray, RGB, RGBA), create an image constructor
  for (t = 0, tt = that.dataTypes.length; t < tt; ++t) {
    var dataType = that.dataTypes[t];
    for (channelProfile in that.channelProfiles) {
      var imageType = buildImageConstructor(dataType, channelProfile);
      that[getImageTypeString(dataType, channelProfile)] = imageType;
      that.imageTypeGroups[dataType].push(imageType);
      that.imageTypeGroups[channelProfile].push(imageType);
      that.imageTypeGroups.all.push(imageType);
    }
  }

  /**
   * Image type from data type and channel profile
   * @param {string} dataType - Type of data store in pixel data (see dataTypes array)
   * @param {string} channelProfile - Type and number of channels (see channelProfiles array)
   * @returns {function} Image type
   */
   that.getImageType = function(dataType, channelProfile) {
     return that[getImageTypeString(dataType, channelProfile)];
   };

  /**
   * Read an Uint8ClampedRgbaImage from an existing canvas.
   * @param {Element} canvas - Canvas element
   * @returns {ImPro.Uint8ClampedRgbaImage} Image read from the canvas
   */
  that.Uint8ClampedRgbaImage.fromCanvas = function(canvas) {
    var context = canvas.getContext('2d');
    var canvasData = context.getImageData(0, 0, canvas.width, canvas.height);
    return new that.Uint8ClampedRgbaImage(canvas.width, canvas.height, canvasData.data);
  };

  /**
   * Read an Uint8ClampedRgbaImage from an existing DOM image.
   * @param {Element} domImage - DOM image
   * @returns {ImPro.Uint8ClampedRgbaImage} Image read from the DOM image
   */
  that.Uint8ClampedRgbaImage.fromDomImage = function(domImage) {
    var canvas = document.createElement('canvas');
    canvas.width = domImage.width;
    canvas.height = domImage.height;
    var context = canvas.getContext('2d');
    context.drawImage(domImage, 0, 0);
    return that.Uint8ClampedRgbaImage.fromCanvas(canvas);
  };

  /**
   * Read an Uint8ClampedRgbaImage from a local image file
   * and execute the callback  with the read image as parameter.
   * @param {string} filePath - Absolute or relative path to a local image
   * @param {function} callback - Callback called once the image is loaded.
   */
  that.Uint8ClampedRgbaImage.fromLocalFile = function(filePath, callback) {
    var domImage = new window.Image();
    domImage.addEventListener('load', function() {
       var image = that.Uint8ClampedRgbaImage.fromDomImage(domImage);
       callback(image);
    }, false);
    domImage.src = filePath;
  };

  /**
   * Paint an Uint8ClampedRgbaImage on a canvas.
   * @param {Element} canvas - Canvas element
   * @returns {Element} Canvas element
   */
  that.Uint8ClampedRgbaImage.prototype.toCanvas = function(canvas) {
    if (typeof canvas === 'undefined') {
      canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
    }
    var context = canvas.getContext('2d');
    var imageData = context.createImageData(canvas.width, canvas.height);
    imageData.data.set(this.data);
    context.putImageData(imageData, 0, 0);
    // context.putImageData(this.data, 0, 0);
    return canvas;
  };

  /**
   * Convert an Uint8ClampedRgbaImage to a data URL.
   * @returns {string} Data URL ot the image
   */
  that.Uint8ClampedRgbaImage.prototype.toDataURL = function() {
    var canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    this.toCanvas(canvas);
    return canvas.toDataURL('image/png');
  };

  /**
   * Write an Uint8ClampedRgbaImage as a DOM image.
   * @param {Element} domImage - DOM Image
   * @returns {Element} DOM Image
   */
  that.Uint8ClampedRgbaImage.prototype.toDomImage = function(domImage) {
    if (typeof domImage === 'undefined') {
      domImage = new window.Image();
    }
    domImage.src = this.toDataURL();
    return domImage;
  };
})(ImPro);


(function(that) {
  /**
   * Process constructor.
   * @class
   * @param {string} name - Name of the process
   * @param {Object.<string, AbstractProcessParam>} paramConfigs - List of process params
   * @param {Object[]} inputConfigs - List of process inputs: {name: string, types: function[], [default=undefined]: *, [connectable=true]: boolean, [configurable=false]: boolean, [configOptions={}]: Object}[]
   * @param {Object[]} outputConfigs - List of process outputs: {name: string, type: function(inputTypes, inputs)}[]
   * @param {function(Object.<string, *>, Object.<string, *>)} run - Function to execute
   */
  that.Process = function(name, /*paramConfigs, */inputConfigs, outputConfigs, run) {
    /**
     * Name of the process
     * @type {string}
     */
    this.name = name;
    /**
     * Last execution time in milliseconds
     * @type {double}
     */
    this.lastExecutionTime = null;

    // inputConfigs default values:
    // default: undefined
    // connectable: true
    // configurable: true
    // configOptions: {}
    for (var ic = 0; ic < inputConfigs.length; ++ic) {
      var inputConfig = inputConfigs[ic];
      if (typeof inputConfig.connectable    === 'undefined') inputConfig.connectable   = true;
      if (typeof inputConfig.configurable   === 'undefined') inputConfig.configurable  = false;
      if (typeof inputConfig.configOptions  === 'undefined') inputConfig.configOptions = {};
    }
    /**
     * List of process inputs: {name: string, types: function[], connectable: boolean, configurable: boolean, configOptions: Object}[]
     * @type {Object[]}
     */
    this.inputConfigs = inputConfigs;
    /**
     * List of process outputs: {name: string, type: function(inputTypes, inputs)}[]
     * @type {Object[]}
     */
    this.outputConfigs = outputConfigs;
    /**
     * Function to execute
     * @type {function(Array)}
     */
    this.run = function(inputs) {
      // Check inputs
      var inputTypes = [];
      for (var i = 0; i < inputConfigs.length; ++i) {
        var inputConfig = inputConfigs[i];
        if (typeof inputs[i] === 'undefined') {
          if (typeof inputConfig.default !== 'undefined') {
            inputs[i] = inputConfig.default;
          } else {
            throw new Error('Missing input "' + inputConfig.name + '". Abort.');
          }
        }
        var input = inputs[i], inputSupportedType = false;
        for (var it = 0; it < inputConfig.types.length; ++it) {
          var inputType = inputConfig.types[it];
          if ((typeof inputType === 'function' && input instanceof inputType) ||
              (typeof inputType === 'string' && typeof input === inputType)) {
            inputSupportedType = true;
            inputTypes[i] = inputType;
          }
        }
        if (!inputSupportedType) {
          throw new Error('Invalid type for input "' + inputConfig.name + '". Abort.');
        }
      }

      // Timing: start
      var processStart = performance.now();

      // Run
      var outputs = run(inputTypes, inputs);

      // Timing: end
      var processEnd = performance.now();
      this.lastExecutionTime = processEnd - processStart;

      // Check outputs
      for (var o = 0; o < outputConfigs.length; ++o) {
        var outputConfig = outputConfigs[o];
        if (typeof outputs[o] === 'undefined') {
          throw new Error('Missing output "' + outputConfig.name + '". Abort.');
        }
        var output = outputs[o], outputType = outputConfig.type(inputTypes, inputs);
        if (!(typeof outputType === 'function' && output instanceof outputType) &&
            !(typeof outputType === 'string' && typeof output === outputType)) {
          throw new Error('Invalid type for output "' + outputConfig.name + '". Abort.');
        }
      }

      return outputs;
    };
  };
})(ImPro);


(function(that) {
  that.convolutionBorderPolicies = that.enum([
    'LeaveBlack', // Set pixels black in areas near image borders
    'LeaveWhite', // Set pixels white in areas near image borders
    'LeavePristine', // Keep input pixels in areas near image borders
    'CropImage', // Output image will be smaller than input image
    'CropKernel', // Ignore outside kernel values (kernel sum can be modified!)
    'SquashKernel', // Report any outside kernel value on the nearest inside kernel value (same as DuplicateBorder)
    'DuplicateBorder', // Convolve as if the pixel border was duplicated on and on (same as SquashKernel)
    'MirrorImage' // Convolve as if image was mirrored at the pixel border
  ], that.convolutionBorderPolicy = that.EnumItem);

  that.convolution = new that.Process('Convolution',
    [
      {name: 'Image', types: that.imageTypeGroups.all},
      {name: 'Kernel', types: [that.Float32GrayImage], connectable: true, configurable: true},
      {name: 'Normalize', types: ['boolean'], default: true, connectable: false, configurable: true},
      {name: 'BorderPolicy', types: [that.convolutionBorderPolicy], default: that.convolutionBorderPolicies.LeaveBlack, connectable: false, configurable: true}
    ],
    [
      {name: 'Image', type: function(inputTypes, inputs) { return inputTypes[0]; }}
    ],
    function(inputTypes, inputs) {
      var inputImage = inputs[0],
          kernel     = inputs[1],
          normalize  = inputs[2];
      var tempImageType   = that.getImageType('Float32', inputImage.channelProfile),
          outputImageType = inputTypes[0];
      var tempImage   = new tempImageType(inputImage.width, inputImage.height),
          outputImage = new outputImageType(tempImage.width, tempImage.height);
      var inputData  = inputImage.data,
          tempData   = tempImage.data,
          outputData = outputImage.data,
          kernelData = kernel.data;
      var inputDataLength  = inputData.length,
          tempDataLength   = tempData.length,
          outputDataLength = outputData.length,
          kernelDataLength = kernelData.length;
      var channelCount = that.channelProfiles[inputImage.channelProfile], c = 0;

          /*
           * IMAGE LIMITS & AREAS
           *
           *  a   b       c   d
           *  + - + - - - + - + e
           *  | A |   B   | C |
           *  + - + - - - + - + f
           *  |   |       |   |
           *  | D |   E   | F |
           *  |   |       |   |
           *  + - + - - - + - + g
           *  | G |   H   | I |
           *  + - + - - - + - + h
           *
           * A: Top Left area: kernel will go across the top and left borders
           * B: Top area: kernel will go across the top border
           * C: Top right area: kernel will go across the top and right borders
           * D: Left area: kernel will go across the left border
           * E: Center area: kernel won't go across any border
           * F: Right area: kernel will go across the right border
           * G: Bottom Left area: kernel will go across the bottom and left borders
           * H: Bottom area: kernel will go across the bottom border
           * I: Bottom Right area: kernel will go across the bottom and right borders
           *
           * a: Left border of the image (x = 0)
           * b: Safe left margin: from this point, the kernel won't go across the left border (x = kernel half width)
           * c: Safe right margin: up to this point, the kernel won't go across the right border (x = image width - kernel half width)
           * d: Right border of the image (x = image width)
           * e: Top border of the image (y = 0)
           * f: Safe top margin: form this point, the kernel won't go across the top border (x = kernel half height)
           * g: Safe bottom margin: up to this point, the kernel won't go across the bottom border (x = image height - kernel half height)
           * h: Bottom border of the image (y = image height)
           */

      var imageWidth       = inputImage.width,
          imageHeight      = inputImage.height,
          kernelWidth      = kernel.width,
          kernelHeight     = kernel.height,
          kernelHalfWidth  = kernel.width  >> 1,
          kernelHalfHeight = kernel.height >> 1;
      var safeLeftMargin   = kernelHalfWidth,
          safeRightMargin  = imageWidth - kernelHalfWidth,
          safeTopMargin    = kernelHalfHeight,
          safeBottomMargin = imageHeight - kernelHalfHeight;
      var x   = 0, // x on image (both input, temp & output)
          y   = 0, // y on image (both input, temp & output)
          dx  = inputImage.dx, // dx on image (both input, temp & output)
          dy  = inputImage.dy, // dy on image (both input, temp & output)
          xSrc = 0, // x+kx on image (assuming (0,0) on kernel is at its center)
          ySrc = 0, // y+ky on image (assuming (0,0) on kernel is at its center)
          kx  = 0, // x on kernel
          ky  = 0, // y on kernel
          kdx = kernel.dx, // dx on kernel
          kdy = kernel.dy, // dy on kernel
          kxy = 0; // value at x,y on kernel
      var z          = 0, // index in data array matching (x,y) location
          dz         = dx, // dz on image (both input, temp & output)
          zSrc       = 0, // index in data array matching (xSrc, ySrc)
          zSrcOffset = 0, // index offset in data array between (x,y) and (xSrc, ySrc)
          kz         = 0, // z on kernel
          kdz        = kdx, // dz on kernel
          kernelSum  = 0;

      // Border areas
      for (ky = 0; ky < kernelHeight; ++ky) {
        for (kx = 0; kx < kernelWidth; ++kx) {
          kxy = kernelData[ky*kdy + kx*kdx];

          if (kxy === 0) continue;

          // Top Left area
          for (y = 0; y < safeTopMargin; ++y) {
            for (x = 0; x < safeLeftMargin; ++x) {
              z = x*dx + y*dy;
              xSrc = x + kx - kernelHalfWidth;
              ySrc = y + ky - kernelHalfHeight;
              zSrc = (xSrc < 0 ? 1 - xSrc : xSrc)*dx + (ySrc < 0 ? 1 - ySrc : ySrc)*dy;
              for (c = 0; c < channelCount; ++c) {
                tempData[z + c] += inputData[zSrc + c]*kxy;
              }/*
              tempData[z    ] += inputData[zSrc    ]*kxy;
              tempData[z + 1] += inputData[zSrc + 1]*kxy;
              tempData[z + 2] += inputData[zSrc + 2]*kxy;*/
            }
          }

          // Top area
          for (y = 0; y < safeTopMargin; ++y) {
            for (x = safeLeftMargin; x < safeRightMargin; ++x) {
              z = x*dx + y*dy;
              xSrc = x + kx - kernelHalfWidth;
              ySrc = y + ky - kernelHalfHeight;
              zSrc = xSrc*dx + (ySrc < 0 ? 1 - ySrc : ySrc)*dy;
              for (c = 0; c < channelCount; ++c) {
                tempData[z + c] += inputData[zSrc + c]*kxy;
              }/*
              tempData[z    ] += inputData[zSrc    ]*kxy;
              tempData[z + 1] += inputData[zSrc + 1]*kxy;
              tempData[z + 2] += inputData[zSrc + 2]*kxy;*/
            }
          }

          // Top Right area
          for (y = 0; y < safeTopMargin; ++y) {
            for (x = safeRightMargin; x < imageWidth; ++x) {
              z = x*dx + y*dy;
              xSrc = x + kx - kernelHalfWidth;
              ySrc = y + ky - kernelHalfHeight;
              zSrc = (xSrc < imageWidth ? xSrc : 2*imageWidth - xSrc - 1)*dx + (ySrc < 0 ? 1 - ySrc : ySrc)*dy;
              for (c = 0; c < channelCount; ++c) {
                tempData[z + c] += inputData[zSrc + c]*kxy;
              }/*
              tempData[z    ] += inputData[zSrc    ]*kxy;
              tempData[z + 1] += inputData[zSrc + 1]*kxy;
              tempData[z + 2] += inputData[zSrc + 2]*kxy;*/
            }
          }

          // Left area
          for (y = safeTopMargin; y < safeBottomMargin; ++y) {
            for (x = 0; x < safeLeftMargin; ++x) {
              z = x*dx + y*dy;
              xSrc = x + kx - kernelHalfWidth;
              ySrc = y + ky - kernelHalfHeight;
              zSrc = (xSrc < 0 ? 1 - xSrc : xSrc)*dx + ySrc*dy;
              for (c = 0; c < channelCount; ++c) {
                tempData[z + c] += inputData[zSrc + c]*kxy;
              }/*
              tempData[z    ] += inputData[zSrc    ]*kxy;
              tempData[z + 1] += inputData[zSrc + 1]*kxy;
              tempData[z + 2] += inputData[zSrc + 2]*kxy;*/
            }
          }

          // Right area
          for (y = safeTopMargin; y < safeBottomMargin; ++y) {
            for (x = safeRightMargin; x < imageWidth; ++x) {
              z = x*dx + y*dy;
              xSrc = x + kx - kernelHalfWidth;
              ySrc = y + ky - kernelHalfHeight;
              zSrc = (xSrc < imageWidth ? xSrc : 2*imageWidth - xSrc - 1)*dx + ySrc*dy;
              for (c = 0; c < channelCount; ++c) {
                tempData[z + c] += inputData[zSrc + c]*kxy;
              }/*
              tempData[z    ] += inputData[zSrc    ]*kxy;
              tempData[z + 1] += inputData[zSrc + 1]*kxy;
              tempData[z + 2] += inputData[zSrc + 2]*kxy;*/
            }
          }

          // Bottom Left area
          for (y = safeBottomMargin; y < imageHeight; ++y) {
            for (x = 0; x < safeRightMargin; ++x) {
              z = x*dx + y*dy;
              xSrc = x + kx - kernelHalfWidth;
              ySrc = y + ky - kernelHalfHeight;
              zSrc = (xSrc < 0 ? 1 - xSrc : xSrc)*dx + (ySrc < imageHeight ? ySrc : 2*imageHeight - ySrc - 1)*dy;
              for (c = 0; c < channelCount; ++c) {
                tempData[z + c] += inputData[zSrc + c]*kxy;
              }/*
              tempData[z    ] += inputData[zSrc    ]*kxy;
              tempData[z + 1] += inputData[zSrc + 1]*kxy;
              tempData[z + 2] += inputData[zSrc + 2]*kxy;*/
            }
          }

          // Bottom area
          for (y = safeBottomMargin; y < imageHeight; ++y) {
            for (x = 0; x < safeRightMargin; ++x) {
              z = x*dx + y*dy;
              xSrc = x + kx - kernelHalfWidth;
              ySrc = y + ky - kernelHalfHeight;
              zSrc = xSrc*dx + (ySrc < imageHeight ? ySrc : 2*imageHeight - ySrc - 1)*dy;
              for (c = 0; c < channelCount; ++c) {
                tempData[z + c] += inputData[zSrc + c]*kxy;
              }/*
              tempData[z    ] += inputData[zSrc    ]*kxy;
              tempData[z + 1] += inputData[zSrc + 1]*kxy;
              tempData[z + 2] += inputData[zSrc + 2]*kxy;*/
            }
          }

          // Bottom Right area
          for (y = safeBottomMargin; y < imageHeight; ++y) {
            for (x = safeRightMargin; x < imageWidth; ++x) {
              z = x*dx + y*dy;
              xSrc = x + kx - kernelHalfWidth;
              ySrc = y + ky - kernelHalfHeight;
              zSrc = (xSrc < imageWidth ? xSrc : 2*imageWidth - xSrc - 1)*dx + (ySrc < imageHeight ? ySrc : 2*imageHeight - ySrc - 1)*dy;
              for (c = 0; c < channelCount; ++c) {
                tempData[z + c] += inputData[zSrc + c]*kxy;
              }/*
              tempData[z    ] += inputData[zSrc    ]*kxy;
              tempData[z + 1] += inputData[zSrc + 1]*kxy;
              tempData[z + 2] += inputData[zSrc + 2]*kxy;*/
            }
          }
        }
      }

      // Center area
      for (ky = 0; ky < kernelHeight; ++ky) {
        for (kx = 0; kx < kernelWidth; ++kx) {
          kxy = kernelData[ky*kdy + kx*kdx];
          zSrcOffset = (kx - kernelHalfWidth)*dx + (ky - kernelHalfHeight)*dy;
          for (y = safeTopMargin; y < safeBottomMargin; ++y) {
            for (x = safeLeftMargin; x < safeRightMargin; ++x) {
              z = y*dy + x*dx;
              zSrc = z + zSrcOffset;
              for (c = 0; c < channelCount; ++c) {
                tempData[z + c] += inputData[zSrc + c]*kxy;
              }/*
              tempData[z    ] += inputData[zSrc    ]*kxy;
              tempData[z + 1] += inputData[zSrc + 1]*kxy;
              tempData[z + 2] += inputData[zSrc + 2]*kxy;*/
            }
          }
        }
      }

      if (normalize) {
        for (kz = 0; kz < kernelDataLength; kz += kdz) {
          kernelSum += kernelData[kz];
        }

        if (kernelSum === 0) { // Set 0 at 128
          for (z = 0; z < tempDataLength; z += dz) {
            tempData[z    ] += 0x80;
            tempData[z + 1] += 0x80;
            tempData[z + 2] += 0x80;
          }
        } else {
          for (z = 0; z < tempDataLength; z += dz) {
            tempData[z    ] /= kernelSum;
            tempData[z + 1] /= kernelSum;
            tempData[z + 2] /= kernelSum;
          }
        }
      }

      // Conversion
      for (z = 0; z < tempDataLength; z += dz) {
        outputData[z    ] = Math.round(tempData[z    ]);
        outputData[z + 1] = Math.round(tempData[z + 1]);
        outputData[z + 2] = Math.round(tempData[z + 2]);
        outputData[z + 3] = 0xff;
      }

      return [outputImage];
    }
  );
})(ImPro);
