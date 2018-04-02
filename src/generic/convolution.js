(function(that) {
  that.convolutionKernelSum = function(kernel) {
    var kernelSum = 0;
    for (var kz = 0; kz < kernel.data.length; ++kz) {
      kernelSum += kernel.data[kz];
    }
    return kernelSum;
  };

  function buildKernel(kernelSize, expression) {
    var kernel = new that.Float32GrayImage(kernelSize, kernelSize);
    var kernelHalfSize = kernelSize >> 1, dx = 1, dy = kernelSize;
    for (var y = -kernelHalfSize; y <= kernelHalfSize; ++y) {
      for (var x = -kernelHalfSize; x <= kernelHalfSize; ++x) {
        kernel.data[(y + kernelHalfSize)*dy + (x + kernelHalfSize)*dx] = expression(x, y);
      }
    }
    return kernel;
  }

  that.convolutionKernels = {
    'Gaussian': function(kernelSize) {
      // 99.7% between -3sigma and +3sigma:
      // https://en.wikipedia.org/wiki/Normal_distribution#Standard_deviation_and_coverage
      // set sigma = (kernelSize/2 + 1)/3 so that 99.7% is in the kernel
      var sigma = ((kernelSize >> 1) + 1)/3;
      var kernel = buildKernel(kernelSize, function(x, y) {
        return Math.exp(-(x*x + y*y)/(sigma*sigma));
      });
      // Normalize
      var kernelSum = that.convolutionKernelSum(kernel);
      for (var kz = 0; kz < kernel.data.length; ++kz) {
        kernel.data[kz] /= kernelSum;
      }
      return kernel;
    }
  };

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
          outputDataLength = outputData.length;
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
              }
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
              }
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
              }
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
              }
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
              }
            }
          }

          // Bottom Left area
          for (y = safeBottomMargin; y < imageHeight; ++y) {
            for (x = 0; x < safeLeftMargin; ++x) {
              z = x*dx + y*dy;
              xSrc = x + kx - kernelHalfWidth;
              ySrc = y + ky - kernelHalfHeight;
              zSrc = (xSrc < 0 ? 1 - xSrc : xSrc)*dx + (ySrc < imageHeight ? ySrc : 2*imageHeight - ySrc - 1)*dy;
              for (c = 0; c < channelCount; ++c) {
                tempData[z + c] += inputData[zSrc + c]*kxy;
              }
            }
          }

          // Bottom area
          for (y = safeBottomMargin; y < imageHeight; ++y) {
            for (x = safeLeftMargin; x < safeRightMargin; ++x) {
              z = x*dx + y*dy;
              xSrc = x + kx - kernelHalfWidth;
              ySrc = y + ky - kernelHalfHeight;
              zSrc = xSrc*dx + (ySrc < imageHeight ? ySrc : 2*imageHeight - ySrc - 1)*dy;
              for (c = 0; c < channelCount; ++c) {
                tempData[z + c] += inputData[zSrc + c]*kxy;
              }
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
              }
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
              }
            }
          }
        }
      }

      if (normalize) {
        kernelSum = that.convolutionKernelSum(kernel);

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
