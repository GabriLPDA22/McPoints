import React, { useState, useEffect } from 'react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { createWorker } from 'tesseract.js';
import { X, Camera, CheckCircle, ChevronRight, AlertTriangle } from 'lucide-react';

const ScannerModal = ({ onClose, onScan }) => {
  const [inputNumber, setInputNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
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

  // Función mejorada para abrir la cámara y procesar la imagen
  const openCamera = async () => {
    try {
      setIsProcessing(true);
      setError('');

      // Verificar y solicitar permisos
      const cameraPermissions = await CapCamera.checkPermissions();
      if (cameraPermissions.camera !== 'granted') {
        await CapCamera.requestPermissions({ permissions: ['camera'] });
      }

      // Tomar foto con mejor configuración
      const image = await CapCamera.getPhoto({
        quality: 100,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 1600, // Mayor resolución para mejor OCR
        correctOrientation: true,
        promptLabelHeader: 'Escanea el número',
        promptLabelCancel: 'Cancelar',
        promptLabelPhoto: 'Tomar foto'
      });

      // Procesar con OCR mejorado
      await processImageWithOCR(image.base64String);
    } catch (error) {
      console.error('Error al usar la cámara:', error);
      setError('Error al acceder a la cámara. Por favor, introduce el número manualmente.');
      setIsProcessing(false);
    }
  };

  // Función mejorada de OCR para números de 4 dígitos
  const processImageWithOCR = async (imageData) => {
    try {
      // Crear worker de Tesseract con configuración optimizada para números
      const worker = await createWorker({
        logger: progress => {
          if (progress.status === 'recognizing text') {
            setOcrProgress(parseInt(progress.progress * 100));
          }
        }
      });

      // Cargar y configurar Tesseract para reconocimiento de números
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        tessjs_create_hocr: '0',
        tessjs_create_tsv: '0',
        tessedit_ocr_engine_mode: '1',
        // Mejorar precisión para dígitos
        tessjs_create_box: '0',
        tessjs_create_unlv: '0',
        tessjs_create_osd: '0'
      });

      // Procesamiento de la imagen con mejor detección
      const { data: { text } } = await worker.recognize(`data:image/jpeg;base64,${imageData}`);

      // Limpiar el resultado y buscar un número de 4 dígitos
      const cleanedText = text.replace(/\D/g, '');
      const matches = cleanedText.match(/\d{4}/);

      if (matches && matches.length > 0) {
        const detectedNumber = matches[0];
        setInputNumber(detectedNumber);
      } else {
        setError('No se pudo detectar un número de 4 dígitos. Intenta nuevamente o introduce el número manualmente.');
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

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setInputNumber(value);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!inputNumber || inputNumber.length !== 4) {
      setError('Por favor, introduce un número válido de 4 dígitos');
      return;
    }

    // Mostrar mensaje de éxito antes de cerrar
    setSuccess(true);

    // Cerrar después de un breve retraso para que el usuario vea el mensaje
    setTimeout(() => {
      onScan(inputNumber);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-800">
        {/* Header futurista */}
        <div className="relative bg-gradient-to-r from-purple-900 to-fuchsia-900 p-6">
          {/* Elementos decorativos - glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-fuchsia-600 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600 rounded-full blur-3xl opacity-20"></div>

          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative z-10">
            <h2 className="text-white text-xl font-bold mt-1">Escanear número</h2>
            <p className="text-fuchsia-200 text-sm mt-1">Añade un nuevo número a tu colección</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(192,38,211,0.5)]">
                <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¡Número añadido!</h3>
              <p className="text-zinc-400 mb-8 text-center">
                El número <span className="font-bold text-fuchsia-500">{inputNumber}</span> ha sido añadido a tu colección
              </p>
              <button
                onClick={() => onScan(inputNumber)}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(192,38,211,0.3)] hover:shadow-[0_0_20px_rgba(192,38,211,0.5)] transition-all"
              >
                Volver a la colección
                <ChevronRight className="ml-1 h-5 w-5" />
              </button>
            </div>
          ) : (
            <>
              {/* Cámara con diseño futurista */}
              <div className="mb-6">
                {isProcessing ? (
                  <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full border-2 border-zinc-700 border-t-fuchsia-500 animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-2 border-zinc-700 border-b-purple-500 animate-spin animation-delay-150"></div>
                    </div>
                    <p className="text-white font-medium">Procesando imagen... {ocrProgress}%</p>
                    <p className="text-zinc-500 text-sm mt-1">Buscando números...</p>
                  </div>
                ) : (
                  <button
                    onClick={openCamera}
                    disabled={!hasCamera || isProcessing}
                    className="w-full bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-fuchsia-500/50 transition-all rounded-xl p-8 flex flex-col items-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-900 to-fuchsia-900 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(192,38,211,0.3)]">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-white font-medium">Escanear con la cámara</p>
                    <p className="text-zinc-500 text-sm mt-1">Toma una foto del número</p>
                  </button>
                )}
              </div>

              {/* Separador neón */}
              <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-zinc-700"></div>
                <span className="flex-shrink mx-4 text-fuchsia-500 text-sm font-medium">o introduce manualmente</span>
                <div className="flex-grow border-t border-zinc-700"></div>
              </div>

              {/* Input manual con estilo futurista */}
              <form onSubmit={handleSubmit} className="mb-6">
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
                  <label className="block text-sm text-zinc-300 mb-2 font-medium">
                    Número promocional de 4 dígitos:
                  </label>
                  <input
                    type="text"
                    value={inputNumber}
                    onChange={handleInputChange}
                    placeholder="0000"
                    maxLength="4"
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-fuchsia-500 text-center text-2xl font-bold tracking-widest py-4 rounded-lg text-white focus:outline-none"
                  />
                  {error && (
                    <p className="flex items-center mt-2 text-red-500 text-sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {error}
                    </p>
                  )}
                </div>

                {/* Ejemplo visual */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 mt-4">
                  <p className="text-sm text-zinc-400 text-center mb-2">Ejemplo de número promocional:</p>
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg py-2 px-4 flex justify-center">
                    <span className="text-xl font-bold tracking-widest text-white">1234</span>
                  </div>
                </div>

                {/* Botón de acción */}
                <button
                  type="submit"
                  disabled={inputNumber.length !== 4}
                  className={`w-full py-4 mt-6 rounded-xl font-bold flex items-center justify-center
                    ${inputNumber.length === 4
                      ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.3)] hover:shadow-[0_0_20px_rgba(192,38,211,0.5)]'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    } transition-all`}
                >
                  Añadir a mi colección
                  <ChevronRight className="ml-1 h-5 w-5" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
