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
