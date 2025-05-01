import React, { useState, useEffect } from 'react';
import { X, Camera, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { Camera as CapCamera } from '@capacitor/camera';
import { createWorker } from 'tesseract.js';
import '../styles/Modal.css';

const ScannerModal = ({ onClose, onScan }) => {
  const [inputNumber, setInputNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [hasCamera, setHasCamera] = useState(true);

  // Verificar si la cámara está disponible
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const permission = await CapCamera.checkPermissions();
        if (permission.camera === 'denied') {
          const request = await CapCamera.requestPermissions();
          setHasCamera(request.camera === 'granted');
        }
      } catch (err) {
        console.error('Error checking camera:', err);
        setHasCamera(false);
      }
    };

    checkCamera();
  }, []);

  // Función para abrir la cámara y procesar la imagen
  const openCamera = async () => {
    try {
      setIsProcessing(true);
      setError('');

      // Tomar foto con la cámara
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'base64',
        source: 'CAMERA',
        promptLabelHeader: 'Escanea el número',
        promptLabelCancel: 'Cancelar',
        promptLabelPhoto: 'Tomar foto'
      });

      // Iniciar OCR con Tesseract
      processImageWithOCR(image.base64String);

    } catch (error) {
      console.error('Error al usar la cámara:', error);
      setError('Error al acceder a la cámara. Por favor, introduce el número manualmente.');
      setIsProcessing(false);
    }
  };

  // Procesar imagen con OCR
  const processImageWithOCR = async (imageData) => {
    try {
      // Crear worker de Tesseract
      const worker = await createWorker({
        logger: progress => {
          if (progress.status === 'recognizing text') {
            setOcrProgress(parseInt(progress.progress * 100));
          }
        }
      });

      // Inicializar y configurar para reconocer solo números
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
      });

      // Reconocer texto en la imagen
      const { data: { text } } = await worker.recognize(`data:image/jpeg;base64,${imageData}`);

      // Limpiar el resultado y buscar un número de 3 dígitos
      const cleanedText = text.replace(/\D/g, '');
      const matches = cleanedText.match(/\d{3}/);

      if (matches && matches.length > 0) {
        const detectedNumber = matches[0];
        setInputNumber(detectedNumber);
      } else {
        setError('No se pudo detectar un número de 3 dígitos. Intenta nuevamente o introduce el número manualmente.');
      }

      // Terminar el worker
      await worker.terminate();
      setIsProcessing(false);

    } catch (error) {
      console.error('Error en OCR:', error);
      setError('Error al procesar la imagen. Por favor, introduce el número manualmente.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!inputNumber || inputNumber.length !== 3) {
      setError('Por favor, introduce un número válido de 3 dígitos');
      return;
    }

    // Mostrar mensaje de éxito antes de cerrar
    setSuccess(true);

    // Cerrar después de un breve retraso para que el usuario vea el mensaje
    setTimeout(() => {
      onScan(inputNumber);
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Escanear número</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {success ? (
            <div className="success-message">
              <CheckCircle size={60} className="success-icon" />
              <h3>¡Número {inputNumber} añadido!</h3>
            </div>
          ) : (
            <>
              {isProcessing ? (
                <div className="camera-processing">
                  <div className="spinner"></div>
                  <p>Procesando imagen... {ocrProgress}%</p>
                </div>
              ) : (
                <div className="camera-placeholder">
                  {hasCamera ? (
                    <button
                      className="camera-button"
                      onClick={openCamera}
                      disabled={isProcessing}
                    >
                      <Camera size={40} />
                      <span>Abrir cámara para escanear</span>
                    </button>
                  ) : (
                    <div className="camera-error">
                      <AlertTriangle size={40} />
                      <p>No se puede acceder a la cámara</p>
                    </div>
                  )}
                  <p className="camera-subtitle">Escanea el número del ticket como el de la imagen:</p>
                  <div className="ticket-example">
                    <div className="ticket-number">037</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="number-form">
                <p className="input-label">O introduce el número manualmente:</p>
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength="3"
                  placeholder="037"
                  value={inputNumber}
                  onChange={(e) => {
                    // Solo permitir números
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setInputNumber(value);
                    setError('');
                  }}
                  className="number-input"
                />

                {error && <p className="error-message">{error}</p>}

                <div className="button-group full-width">
                  <button
                    type="submit"
                    className="submit-button full-width"
                    disabled={!inputNumber || inputNumber.length !== 3}
                  >
                    Añadir a mi colección
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
