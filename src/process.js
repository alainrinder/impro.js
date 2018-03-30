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
