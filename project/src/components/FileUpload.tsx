import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2, Camera, Trash2, RefreshCw, Image, FileQuestion, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileProcess: (file: File, invoiceData?: any, error?: string) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcess, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [fileSource, setFileSource] = useState<'upload' | 'camera' | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 16 * 1024 * 1024; // 16MB

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or PDF file');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 16MB');
      return false;
    }

    setError('');
    
    // Create preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDF files, show a generic preview
      setPreviewUrl(null);
    }
    
    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setFileSource('upload');
      }
    }
  };
  
  const handleCameraCapture = () => {
    // This would typically open the device camera
    // For demo purposes, we'll just show a file picker that accepts images from camera
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use the environment-facing camera
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        if (validateFile(file)) {
          setSelectedFile(file);
          setFileSource('camera');
        }
      }
    };
    
    input.click();
  };

  const handleProcess = async () => {
    if (selectedFile) {
      setError("");
      try {
        // Animated feedback is handled by parent via isProcessing
        const formData = new FormData();
        formData.append('file', selectedFile);
        const response = await fetch('http://localhost:5000/api/analyze', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.error || 'Failed to analyze invoice.');
          onFileProcess(selectedFile, undefined, result.error || 'Failed to analyze invoice.');
          return;
        }
        onFileProcess(selectedFile, result, undefined);
      } catch (err) {
        setError('Network or server error.');
        onFileProcess(selectedFile, undefined, 'Network or server error.');
      }
    }
  };

  const resetFile = () => {
    setSelectedFile(null);
    setError('');
    setPreviewUrl(null);
    setFileSource(null);
  };
  
  const getFileIcon = () => {
    if (!selectedFile) return <FileQuestion className="w-6 h-6 text-white" />;
    
    if (selectedFile.type.includes('pdf')) {
      return <FileText className="w-6 h-6 text-white" />;
    } else {
      return <Image className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/20 transition-colors duration-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Transform Your Invoice Processing with AI</h2>
          <p className="text-gray-600 dark:text-gray-300">Upload invoices to auto-extract data, predict tax, and export instantly</p>
        </div>
        
        {/* File Source Selection */}
        {!selectedFile && (
          <div className="flex justify-center space-x-4 mb-6">
            <button 
              onClick={() => document.getElementById('file-input')?.click()}
              className="flex-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm hover:shadow"
            >
              <Upload className="w-5 h-5" />
              <span>Upload File</span>
            </button>
            <button 
              onClick={handleCameraCapture}
              className="flex-1 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm hover:shadow"
            >
              <Camera className="w-5 h-5" />
              <span>Use Camera</span>
            </button>
          </div>
        )}
        
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/30'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Drag & Drop or Click to Upload Invoice
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Supported formats: JPG, PNG, PDF — Max Size: 16MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full shadow-sm">
                  {getFileIcon()}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    File Selected
                  </h4>
                  <div className="flex items-center">
                    <p className="text-gray-600 dark:text-gray-300 mr-2 truncate max-w-xs">{selectedFile.name}</p>
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-medium">
                      {fileSource === 'camera' ? 'Camera' : 'Upload'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={resetFile}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Preview for image files */}
            {previewUrl && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-auto max-h-64 object-contain bg-gray-50 dark:bg-gray-800"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs font-medium">
                    Preview
                  </div>
                </div>
              </div>
            )}
            
            {/* PDF indicator if it's a PDF file */}
            {selectedFile && selectedFile.type === 'application/pdf' && (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center shadow-sm">
                <div className="animate-pulse">
                  <FileText className="w-16 h-16 text-blue-500 mx-auto mb-3" />
                </div>
                <p className="text-gray-700 dark:text-gray-200 font-medium">PDF Document</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Preview not available</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="relative">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <div className="absolute inset-0 border-t-2 border-blue-200 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    <span>Process Invoice</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => document.getElementById('file-input')?.click()}
                className="px-6 py-3 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center space-x-2 shadow-sm hover:shadow"
                disabled={isProcessing}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Change</span>
              </button>
              
              <button
                onClick={resetFile}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 shadow-sm hover:shadow"
                disabled={isProcessing}
              >
                <Trash2 className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center space-x-3 shadow-sm animate-fadeIn">
            <div className="text-red-500 flex-shrink-0">
              <div className="relative">
                <AlertCircle className="w-5 h-5" />
                <div className="absolute inset-0 text-red-500 animate-ping opacity-30">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 shadow-sm border border-blue-100 dark:border-blue-800/30">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Processing Instructions
        </h4>
        <ol className="text-blue-800 dark:text-blue-300 space-y-3 text-sm">
          <li className="flex items-start bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg shadow-sm">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-sm">1</span>
            <div>
              <p className="font-medium">Upload your invoice image (JPG, PNG) or PDF file</p>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">Drag & drop or use the file selector</p>
            </div>
          </li>
          <li className="flex items-start bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg shadow-sm">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-sm">2</span>
            <div>
              <p className="font-medium">Our OCR engine extracts text and identifies key fields</p>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">Advanced AI recognizes invoice structure</p>
            </div>
          </li>
          <li className="flex items-start bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg shadow-sm">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-sm">3</span>
            <div>
              <p className="font-medium">AI analyzes items and predicts appropriate GST rates</p>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">Automatic tax categorization and calculation</p>
            </div>
          </li>
          <li className="flex items-start bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg shadow-sm">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-sm">4</span>
            <div>
              <p className="font-medium">Download results as JSON or Excel for further use</p>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">Export in multiple formats for your convenience</p>
            </div>
          </li>
        </ol>
      </div>
      {isProcessing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          {/* TODO: Add animated upload feedback here (spinner, progress, etc.) */}
        </div>
      )}
    </div>
  );
};

export default FileUpload;