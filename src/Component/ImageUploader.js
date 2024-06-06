import React, { useState } from 'react';
import ImageViewer from './ImageViewer';

/**
 * The ImageUploader component allows users to upload NIFTI files
 * and displays the uploaded image using the ImageViewer component.
 */
function ImageUploader() {
  // State to manage the uploaded file
  const [file, setFile] = useState(null);

  /**
   * Handles the file input change event. 
   * Sets the selected file to the state.
   * 
   * @param {Event} e - The file input change event.
   */
  const handleFileChange = (e) => {
    // Get the first file from the file input
    const selectedFile = e.target.files[0];
    // Update the state with the selected file
    setFile(selectedFile);
    console.log('File selected and set inside file variable:', selectedFile);
  };

  /**
   * Handles the form submission event.
   * Prevents the default form submission behavior and logs the uploaded file.
   * 
   * @param {Event} e - The form submit event.
   */
  const handleFileSubmit = (e) => {
    // Prevent the default form submission behavior
    e.preventDefault();
    // Log the uploaded file
    console.log('File uploaded successfully', file);
  };

  return (
    <div>
      <h2>Upload NIFTI IMAGE ONLY</h2>
      {/* Form to upload the NIFTI file */}
      <form onSubmit={handleFileSubmit}>
        {/* File input field to accept NIFTI files only */}
        <input
          type="file"
          accept=".nii,.nii.gz"
          onChange={handleFileChange}
        />
        {/* Button to submit the form */}
        <button type="submit">Upload</button>
        {/* Display the ImageViewer component if a file is selected */}
        {file && <ImageViewer file={file} />}
      </form>
    </div>
  );
}

export default ImageUploader;
