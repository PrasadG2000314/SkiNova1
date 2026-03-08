'use client'

import { useState, useRef, useEffect } from 'react'
import { PredictionResult } from './types'

declare global {
  interface Window {
    tmImage: any
    tf: any
  }
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [libsReady, setLibsReady] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const modelRef = useRef<any>(null)

  // Load external libraries dynamically
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        // Load TensorFlow first
        if (!(window as any).tf) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.7.4/dist/tf.min.js'
            script.async = false
            script.onload = resolve
            script.onerror = () => reject(new Error('Failed to load TensorFlow'))
            document.head.appendChild(script)
          })
        }

        // Then load Teachable Machine
        if (!(window as any).tmImage) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.4/dist/teachablemachine-image.min.js'
            script.async = false
            script.onload = resolve
            script.onerror = () => reject(new Error('Failed to load Teachable Machine'))
            document.head.appendChild(script)
          })
        }

        // Now initialize the model
        await initializeModel()
        setLibsReady(true)
      } catch (err) {
        console.error('Error loading libraries:', err)
        setError(`Failed to load ML libraries: ${(err as any).message}`)
      }
    }

    loadLibraries()
  }, [])

  const initializeModel = async () => {
    try {
      const TMImage = (window as any).tmImage
      if (!TMImage) {
        throw new Error('Teachable Machine not available')
      }
      const model = await TMImage.load('/model/model.json', '/model/metadata.json')
      modelRef.current = model
    } catch (err) {
      console.error('Model loading error:', err)
      throw new Error(`Failed to load model: ${(err as any).message}`)
    }
  }

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
      setFileName(file.name)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files[0]) {
      handleImageSelect(files[0])
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleImageSelect(files[0])
    }
  }

  const handlePredict = async () => {
    if (!image || !modelRef.current) return

    setLoading(true)
    setError('')
    try {
      const img = new Image()
      img.src = image
      await new Promise((resolve) => {
        img.onload = resolve
      })

      const predictions = await modelRef.current.predict(img)
      
      // Find the prediction with highest probability
      const maxPred = predictions.reduce((max: any, pred: any) => 
        pred.probability > max.probability ? pred : max
      )

      const result: PredictionResult = {
        classification: maxPred.className,
        confidence: maxPred.probability,
        allPredictions: predictions.map((p: any) => ({
          class: p.className,
          probability: p.probability,
        })),
      }
      setResult(result)
    } catch (err) {
      setError('Failed to analyze image. Please try again.')
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setImage(null)
    setFileName('')
    setResult(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getResultColor = (classification: string) => {
    return classification.toLowerCase().includes('melanoma') ? 'melanoma' : 'normal'
  }

  const getResultIcon = (classification: string) => {
    return classification.toLowerCase().includes('melanoma') ? '⚠️' : '✅'
  }

  const getDisplayName = (classification: string) => {
    return classification.toLowerCase().includes('melanoma') ? 'Melanoma Risk Detected' : 'Not Melanoma'
  }

  return (
    <main>
      <h1>🔬 Melanoma Detection</h1>

      <div className="container">
        {/* Upload Section */}
        <div className="upload-section">
          <div
            className={`upload-area ${isDragOver ? 'dragover' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
            />
            <div className="upload-icon">📷</div>
            <div className="upload-text">Click to upload or drag and drop</div>
            <div className="upload-hint">PNG, JPG, GIF up to 10MB</div>
          </div>

          {image && (
            <>
              <img src={image} alt="Selected" className="preview" />
              <div style={{ color: '#666', fontSize: '0.9em' }}>
                📄 {fileName}
              </div>
            </>
          )}

          {error && <div className="error">{error}</div>}

          <div className="button-group">
            <button
              className="btn-predict"
              onClick={handlePredict}
              disabled={!image || loading || !libsReady}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Analyzing...
                </>
              ) : !libsReady ? (
                'Loading Model...'
              ) : (
                'Analyze Image'
              )}
            </button>
            {image && (
              <button className="btn-clear" onClick={handleClear}>
                Clear
              </button>
            )}
          </div>

          <div className="model-info">
            <div className="model-info-title">ℹ️ Model Information</div>
            <div>MobileNetV2 - Teachable Machine</div>
            <div>Input: 224×224 RGB images</div>
            <div>Classes: Not Melanoma, Melanoma</div>
          </div>

          <div className="disclaimer">
            <div className="disclaimer-title">⚠️ Important Disclaimer</div>
            <div>
              This tool is for educational purposes only. It should not be used for medical diagnosis. Always consult a qualified dermatologist for skin concerns.
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {!result && !loading && (
            <div className="placeholder">
              Upload an image to begin analysis
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Analyzing image...</p>
            </div>
          )}

          {result && (
            <>
              <div className={`result ${getResultColor(result.classification)}`}>
                <div className="result-title">
                  <span className="result-icon">
                    {getResultIcon(result.classification)}
                  </span>
                  {getDisplayName(result.classification)}
                </div>

                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{
                      width: `${result.confidence * 100}%`,
                    }}
                  >
                    {(result.confidence * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="result-details">
                  <div className="detail-row">
                    <span className="detail-label">Confidence:</span>
                    <span className="detail-value">
                      {(result.confidence * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Classification:</span>
                    <span className="detail-value">
                      {getDisplayName(result.classification)}
                    </span>
                  </div>
                </div>
              </div>

              {result.allPredictions && (
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ marginBottom: '15px', color: '#333' }}>
                    All Classifications
                  </h3>
                  {result.allPredictions.map((pred) => (
                    <div
                      key={pred.class}
                      style={{
                        marginBottom: '10px',
                        padding: '10px',
                        backgroundColor: '#f8f9ff',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>
                          {pred.class}
                        </span>
                        <span style={{ color: '#667eea', fontWeight: 'bold' }}>
                          {(pred.probability * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: '#e0e0e0',
                          borderRadius: '3px',
                          marginTop: '5px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pred.probability * 100}%`,
                            height: '100%',
                            backgroundColor:
                              pred.class.toLowerCase().includes('melanoma') ? '#ff6b6b' : '#51cf66',
                            transition: 'width 0.6s ease',
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
