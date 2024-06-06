import React, { useState, useEffect } from 'react';
import * as nifti from 'nifti-reader-js';

/**
 * The ImageViewer component handles the upload, processing, and visualization
 * of NIFTI files. It uses the nifti-reader-js library to read and interpret 
 * the NIFTI file format.
 */
function ImageViewer({ file }) {
  // State to manage the current slider position
  const [slider, setSlider] = useState(0);

  
  // State to manage the list of image URLs generated from the NIFTI file slices
  const [imageUrls, setImageUrls] = useState([]);

  /**
   * useEffect hook to process the uploaded file whenever the file prop changes.
   * This ensures the file is processed as soon as it is uploaded.
   */
  useEffect(() => {
    const processFile = async () => {
      try {
        // Check if a file is provided
        if (!file) {
          console.error('No file provided');
          return;
        }

        // Read the file as an array buffer
        const data = await file.arrayBuffer();
        let niftiHeader = null;
        let niftiImage = null;
        let niftiExt = null;

        let decompressedData = data;
        // Decompress the data if it is compressed
        if (nifti.isCompressed(decompressedData)) {
          decompressedData = nifti.decompress(decompressedData);
        }

        // Check if the file is a valid NIFTI file
        if (nifti.isNIFTI(decompressedData)) {
          // Read the header and image data from the NIFTI file
          niftiHeader = nifti.readHeader(decompressedData);
          console.log(niftiHeader);
          niftiImage = nifti.readImage(niftiHeader, decompressedData);

          // Check for and read any extensions in the NIFTI file
          if (nifti.hasExtension(niftiHeader)) {
            niftiExt = nifti.readExtensionData(niftiHeader, decompressedData);
          }

          // Convert the NIFTI image data to URLs for visualization
          const urls = convertNiftiImageToUrls(niftiImage, niftiHeader);
          setImageUrls(urls);
        } else {
          console.error('The provided file is not a valid NIFTI file');
        }
      } catch (error) {
        console.error('Error processing the NIFTI file:', error);
      }
    };

    // Call the processFile function to start processing the file
    processFile();
  }, [file]);

  /**
   * Converts the NIFTI image data into an array of URLs, each representing a 
   * slice of the image. This function handles normalization of pixel values 
   * to ensure the image is properly displayed.
   * 
   * @param {ArrayBuffer} niftiImage - The image data from the NIFTI file.
   * @param {Object} niftiHeader - The header information from the NIFTI file.
   * @returns {Array} An array of URLs, each representing a slice of the image.
   */
  const convertNiftiImageToUrls = (niftiImage, niftiHeader) => {
    // Extract dimensions from the NIFTI header
    const width = niftiHeader.dims[1];
    const height = niftiHeader.dims[2];
    const numSlices = niftiHeader.dims[3];
    const sliceSize = width * height;
    const urls = [];
  
    for (let z = 0; z < numSlices; z++) {
      // Extract the slice data for the current slice
      const sliceData = new Uint16Array(niftiImage, z * sliceSize * 2, sliceSize);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(width, height);

      // Normalize pixel values to the range [0, 255]
      let min = Math.min(...sliceData);
      let max = Math.max(...sliceData);
  
      for (let i = 0; i < sliceSize; i++) {
        let value = ((sliceData[i] - min) / (max - min)) * 255;
        imageData.data[i * 4] = value;     // Red channel
        imageData.data[i * 4 + 1] = value; // Green channel
        imageData.data[i * 4 + 2] = value; // Blue channel
        imageData.data[i * 4 + 3] = 255;   // Alpha channel
      }
  
      // Put the image data on the canvas and convert it to a data URL
      ctx.putImageData(imageData, 0, 0);
      urls.push(canvas.toDataURL());
    }
  
    return urls;
  };

  /**
   * Handles the slider change event to update the current slice being displayed.
   * 
   * @param {Event} e - The slider change event.
   */
  const handleSliderChange = (e) => {
    setSlider(e.target.value);
  };

  return (
    <>
  
    <div>
        {imageUrls.length > 0 && <img src={imageUrls[slider]} alt="NIfTI slice" />}
      </div>
      <div>
        <input
          type="range"
          min={0}
          max={imageUrls.length - 1}
          value={slider}
          onChange={handleSliderChange}
        />
      </div>
    </>
  );
}

export default ImageViewer;
