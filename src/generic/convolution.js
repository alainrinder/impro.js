(function(that) {
  that.convolutionBorderPolicies = that.enum([
    'LeaveBlack', // Set pixels black in areas near image borders
    'LeaveWhite', // Set pixels white in areas near image borders
    'LeavePristine', // Keep input pixels in areas near image borders
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
      {name: 'BorderPolicy', types: [that.convolutionBorderPolicy], default: that.convolutionBorderPolicies.SquashKernel, connectable: false, configurable: true}
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
          outputData = outputImage.data;

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
          kx  = 0, // x on kernel
          ky  = 0, // y on kernel
          kdx = 1, // dx on kernel
          kdy = kernelWidth, // dy on kernel
          kxy = 0, // value at x,y on kernel
          z   = 0, // index in data array matching (x,y) location
          zOffset = 0; // index offset in data array between (x,y) and (x+kx, y+ky) locations (assuming (0,0) on kernel is at its center)

      var t = 0, tt = 0, tSrc = 0;

      var srcX = 0, srcY = 0;

      for (ky = 0; ky < kernelHeight; ++ky) {
        for (kx = 0; kx < kernelWidth; ++kx) {
          kxy = kernel.data[ky*kdy + kx*kdx];

          if (kxy === 0) continue;

          zOffset = (kx - kernelHalfWidth)*dx + (ky - kernelHalfHeight)*dy;

          // Top Left area
          for (y = 0; y < safeTopMargin; ++y) {
            for (x = 0; x < safeLeftMargin; ++x) {
              srcX = x + kx - kernelHalfWidth;
              srcY = y + ky - kernelHalfHeight;
              tSrc = x*dx + y*dy;
              t = (srcX < 0 ? 1 - srcX : srcX)*dx + (srcY < 0 ? 1 - srcY : srcY)*dy;
              tempData[tSrc] += inputData[t]*kxy;
              tempData[tSrc + 1] += inputData[t + 1]*kxy;
              tempData[tSrc + 2] += inputData[t + 2]*kxy;
            }
          }

          // Top area
          for (y = 0; y < safeTopMargin; ++y) {
            for (x = safeLeftMargin; x < safeRightMargin; ++x) {
              srcX = x + kx - kernelHalfWidth;
              srcY = y + ky - kernelHalfHeight;
              tSrc = x*dx + y*dy;
              t = (srcX < 0 ? 1 - srcX : srcX)*dx + (srcY < 0 ? 1 - srcY : srcY)*dy;
              tempData[tSrc] += inputData[t]*kxy;
              tempData[tSrc + 1] += inputData[t + 1]*kxy;
              tempData[tSrc + 2] += inputData[t + 2]*kxy;
            }
          }

          // Bottom strip: G + H
          for (y = safeBottomMargin; y < imageHeight; ++y) {
            for (x = 0; x < safeRightMargin; ++x) {
              srcX = x + kx - kernelHalfWidth;
              srcY = y + ky - kernelHalfHeight;
              tSrc = x*dx + y*dy;
              t = (srcX < 0 ? 1 - srcX : srcX)*dx + (srcY < imageHeight ? srcY : 2*imageHeight - srcY - 1)*dy;
              tempData[tSrc] += inputData[t]*kxy;
              tempData[tSrc + 1] += inputData[t + 1]*kxy;
              tempData[tSrc + 2] += inputData[t + 2]*kxy;
            }
          }

          // Left strip: D
          for (y = safeTopMargin; y < safeBottomMargin; ++y) {
            for (x = 0; x < safeLeftMargin; ++x) {
              srcX = x + kx - kernelHalfWidth;
              srcY = y + ky - kernelHalfHeight;
              tSrc = x*dx + y*dy;
              t = (srcX < 0 ? 1 - srcX : srcX)*dx + (srcY < 0 ? 1 - srcY : srcY)*dy;
              tempData[tSrc] += inputData[t]*kxy;
              tempData[tSrc + 1] += inputData[t + 1]*kxy;
              tempData[tSrc + 2] += inputData[t + 2]*kxy;
            }
          }

          // Right strip: C + F
          for (y = 0; y < safeBottomMargin; ++y) {
            for (x = safeRightMargin; x < imageWidth; ++x) {
              srcX = x + kx - kernelHalfWidth;
              srcY = y + ky - kernelHalfHeight;
              tSrc = x*dx + y*dy;
              t = (srcX < imageWidth ? srcX : 2*imageWidth - srcX - 1)*dx + (srcY < 0 ? 1 - srcY : srcY)*dy;
              tempData[tSrc] += inputData[t]*kxy;
              tempData[tSrc + 1] += inputData[t + 1]*kxy;
              tempData[tSrc + 2] += inputData[t + 2]*kxy;
            }
          }

          // Bottom right corner: I
          for (y = safeBottomMargin; y < imageHeight; ++y) {
            for (x = safeRightMargin; x < imageWidth; ++x) {
              srcX = x + kx - kernelHalfWidth;
              srcY = y + ky - kernelHalfHeight;
              tSrc = x*dx + y*dy;
              t = (srcX < imageWidth ? srcX : 2*imageWidth - srcX - 1)*dx + (srcY < imageHeight ? srcY : 2*imageHeight - srcY - 1)*dy;
              tempData[tSrc] += inputData[t]*kxy;
              tempData[tSrc + 1] += inputData[t + 1]*kxy;
              tempData[tSrc + 2] += inputData[t + 2]*kxy;
            }
          }
        }
      }

      // Center: E
      for (ky = 0; ky < kernelHeight; ++ky) {
        for (kx = 0; kx < kernelWidth; ++kx) {
          kxy = kernel.data[ky*kdy + kx*kdx];
          zOffset = (kx - kernelHalfWidth)*dx + (ky - kernelHalfHeight)*dy;
          for (y = safeTopMargin; y < safeBottomMargin; ++y) {
            for (x = safeLeftMargin; x < safeRightMargin; ++x) {
              z = y*dy + x*dx;
              tempData[z    ] += inputData[z + zOffset    ]*kxy;
              tempData[z + 1] += inputData[z + zOffset + 1]*kxy;
              tempData[z + 2] += inputData[z + zOffset + 2]*kxy;
            }
          }
        }
      }

      if (normalize) {
        var kernelSum = 0;
        for (t = 0, tt = kernel.length; t < tt; ++t) {
          kernelSum += kernel.data[t];
        }

        if (kernelSum === 0) { // Set 0 at 128
          for (t = 0, tt = tempData.length; t < tt; t += tempImage.dx) {
            tempData[t    ] += 0x80;
            tempData[t + 1] += 0x80;
            tempData[t + 2] += 0x80;
          }
        } else {
          for (t = 0, tt = tempData.length; t < tt; t += tempImage.dx) {
            tempData[t    ] /= kernelSum;
            tempData[t + 1] /= kernelSum;
            tempData[t + 2] /= kernelSum;
          }
        }
      }

      // Conversion
      for (t = 0, tt = tempData.length; t < tt; t += tempImage.dx) {
        outputData[t    ] = Math.round(tempData[t    ]);
        outputData[t + 1] = Math.round(tempData[t + 1]);
        outputData[t + 2] = Math.round(tempData[t + 2]);
        outputData[t + 3] = 0xff;
      }

      return [outputImage];
    }
  );
})(ImPro);
