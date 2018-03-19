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
