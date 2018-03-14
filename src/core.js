// jshint unused:false
var ImPro = (function () {
  function ImPro() {
    var that = this;

    /**
     * Create an image constructor for the specified data type and channel count.
     * @param {string} dataType - Type of data (cf. TypedArray)
     * @param {number} channels - Number of channel: 1 or 4
     * @return {function} Image constructor
     */
    function ImageBuilder(dataType, channels) {
      var arrayType = window[dataType + 'Array'];

      /**
       * Create a new image.
       * @class 
       * @param {number} width - The width of the image
       * @param {number} height - The height of the image
       * @param {TypedArray} [data] - An array containing pixel data
       */
      that.AbstractImage = function(width, height, data) {
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
         * Byte offset between 2 pixels on x-axis
         * @type {number}
         */
        this.dx = channels;
        /** 
         * Byte offset between 2 pixels on y-axis
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

      return that.AbstractImage;
    }

    var dataTypes = [
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

    for (var t in dataTypes) {
      var dataType = dataTypes[t];
      this[dataType + 'GrayImage'] = ImageBuilder(dataType, 1);
      this[dataType + 'RgbImage' ] = ImageBuilder(dataType, 3);
      this[dataType + 'RgbaImage'] = ImageBuilder(dataType, 4);
    }

    /**
     * Create a new process.
     * @class 
       * @param {string} name - Name of the process
       * @param {array} inputs - List of process inputs
       * @param {array} outputs - List of process outputs
       * @param {function} run - function to execute
     */
    this.Process = function(name, inputs, outputs, run) {
      this.name = name;
      this.inputs = inputs; // inputs: {'name1': {type: [...]}}
      this.outputs = outputs;
      this.run = run;
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

    this.init = function() {

    };
  }

  return new ImPro();
})();