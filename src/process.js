(function (that) {
  /**
   * Process constructor.
   * @class
   * @param {string} name - Name of the process
   * @param {Object.<string, AbstractProcessParam>} paramConfigs - List of process params
   * @param {Object[]} inputConfigs - List of process inputs: {name: string, types: function[], connectable: boolean, configurable: boolean, configOptions: Object}[]
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
    // connectable: true
    // configurable: true
    // configOptions: {}
    for (var ic = 0, iicc = inputConfigs.length; ic < iicc; ++ic) {
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
      for (var i = 0, ii = inputConfigs.length; i < ii; ++i) {
        var inputConfig = inputConfigs[i];
        if (typeof inputs[i] === 'undefined') {
          throw new Error('Missing input "' + inputConfig.name + '". Abort.');
        }
        var input = inputs[i], inputSupportedType = false;
        for (var it = 0, iitt = inputConfig.types.length; it < iitt; ++it) {
          if (input instanceof inputConfig.types[it]) {
            inputSupportedType = true;
            inputTypes[i] = inputConfig.types[it];
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
      for (var o = 0, oo = outputConfigs.length; o < oo; ++o) {
        var outputConfig = outputConfigs[o];
        if (typeof outputs[o] === 'undefined') {
          throw new Error('Missing output "' + outputConfig.name + '". Abort.');
        }
        var output = outputs[o];
        if (!(output instanceof outputConfig.type(inputTypes, inputs))) {
          throw new Error('Invalid type for output "' + outputConfig.name + '". Abort.');
        }
      }

      return outputs;
    };
  };
})(ImPro);
