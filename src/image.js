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

  that.Uint8ClampedRgbaImage.fromCanvas = function(canvas) {
    var context = canvas.getContext('2d');
    var canvasData = context.getImageData(0, 0, canvas.width, canvas.height);
    return new that.Uint8ClampedRgbaImage(canvas.width, canvas.height, canvasData.data);
  };

  that.Uint8ClampedRgbaImage.fromDomImage = function(domImage) {
    var canvas = document.createElement('canvas');
    canvas.width = domImage.width;
    canvas.height = domImage.height;
    var context = canvas.getContext('2d');
    context.drawImage(domImage, 0, 0);
    return that.Uint8ClampedRgbaImage.fromCanvas(canvas);
  };

  that.Uint8ClampedRgbaImage.fromLocalFile = function(filePath, callback) {
    var domImage = new window.Image();
    domImage.addEventListener('load', function() {
       var image = that.Uint8ClampedRgbaImage.fromDomImage(domImage);
       callback(image);
    }, false);
    domImage.src = filePath;
  };

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


  that.Uint8ClampedRgbaImage.prototype.toDataURL = function() {
    var canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    this.toCanvas(canvas);
    return canvas.toDataURL('image/png');
  };

  that.Uint8ClampedRgbaImage.prototype.toDomImage = function(domImage) {
    if (typeof domImage === 'undefined') {
      domImage = new window.Image();
    }
    domImage.src = this.toDataURL();
    return domImage;
  };
})(ImPro);
