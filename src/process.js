var ImPro;

(function (that) {
  /**
   * Abstract process param constructor. Should not be called but from a child constructor with 'super' function.
   * @class
   * @param {string} name - Name of the parameter
   * @param {*} defaultValue - Default value of the parameter
   */
  function AbstractProcessParam(name, defaultValue) {
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
    that.super(this, [name, defaultValue]);
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
    that.super(this, [name, defaultValue]);
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
    that.super(this, [name, defaultValue]);
  });

  // TODO: ProcessInput & ProcessOutput classes

  /**
   * Process constructor.
   * @class
   * @param {string} name - Name of the process
   * @param {Object.<string, AbstractProcessParam>} paramConfigs - List of process params
   * @param {Object.<string, *>} inputConfigs - List of process inputs
   * @param {Object.<string, *>} outputConfigs - List of process outputs
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
        for (var it in inputConfig.types) {
          inputSupportedType = inputSupportedType || (input instanceof inputConfig.types[it]);
        }
        if (!inputSupportedType) {
          throw new Error('Invalid type for input "' + i + '". Abort.');
        }
      }

      // TODO: Check params

      // Run
      var outputs = run(inputs, params);

      // Check outputs
      for (var o in outputConfigs) {
        if (!(o in outputs)) {
          throw new Error('Missing output "' + o + '". Abort.');
        }
        var output = outputs[o], outputConfig = outputConfigs[o], outputSupportedType = false;
        for (var ot in outputConfig.types) {
          outputSupportedType = outputSupportedType || (output instanceof outputConfig.types[ot]);
        }
        if (!outputSupportedType) {
          throw new Error('Invalid type for output "' + o + '". Abort.');
        }
      }

      return outputs;
    };
  };

  that.testProcess = new that.Process('Test process', {},
    {'Image': {types: [that.Uint8ClampedGrayImage]}},
    {'Image': {types: [that.Uint8ClampedGrayImage]}},
    function(inputs) {
      var inputImage = inputs.Image;

      var outputImage = new that.Uint8ClampedGrayImage(inputImage.width, inputImage.height);

      for (var t = 0, tt = inputImage.length; t < tt; ++t) {
        outputImage.data[t] = 0xff - inputImage.data[t];
      }

      return {'Image': outputImage};
    }
  );
})(ImPro);
