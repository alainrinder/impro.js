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