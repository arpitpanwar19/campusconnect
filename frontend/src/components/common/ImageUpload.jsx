import React, { useRef, useState } from 'react';
import { uploadToCloudinary } from '../../lib/cloudinary';

export const ImageUpload = ({
  value = '',
  onChange,
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMB = 5,
  label = 'Upload Image',
  placeholder = 'Drag & drop an image here, or click to browse',
}) => {
  const inputRef = useRef(null);

  const [preview, setPreview] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;

    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be smaller than ${maxSizeMB} MB.`);
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      setIsUploading(true);

      const result = await uploadToCloudinary(file);

      // Replace local preview with permanent Cloudinary URL
      setPreview(result.url);

      // Send URL back to parent component
      onChange?.(result.url);
    } catch (err) {
      setError(err.message || 'Image upload failed.');
      setPreview(value || '');
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  const removeImage = () => {
    setPreview('');
    setError('');

    if (inputRef.current) {
      inputRef.current.value = '';
    }

    onChange?.('');
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`
          relative w-full rounded-xl border-2 border-dashed
          transition-all duration-200 cursor-pointer overflow-hidden
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${isUploading ? 'cursor-wait' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-72 object-contain bg-gray-100"
            />

            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3" />
                <p className="text-sm font-medium">Uploading...</p>
              </div>
            )}

            {!isUploading && (
              <div className="absolute inset-x-0 bottom-0 bg-black/60 px-4 py-3 flex items-center justify-between">
                <span className="text-white text-sm">
                  Click to replace image
                </span>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeImage();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white text-red-600 text-sm font-medium hover:bg-gray-100"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 015.828 0L20 17m-2-2l-1.586-1.586a2 2 0 00-2.828 0L12 17m-8 1V6a2 2 0 012-2h11a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2z"
                />
              </svg>
            </div>

            <p className="text-sm font-medium text-gray-700">
              {placeholder}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              PNG, JPG or WebP · Max {maxSizeMB} MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};