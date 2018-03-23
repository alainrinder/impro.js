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
})(ImPro);
