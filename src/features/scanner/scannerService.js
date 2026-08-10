import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { analyzeTicket } from '@/core/detection/engine.js';
import { DEFAULT_DOMAIN, DEFAULT_RULES } from '@/core/detection/rules.js';

let MlKit = null;

async function loadMlKit() {
  if (MlKit) return MlKit;
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const mod = await import('@pantrist/capacitor-plugin-ml-kit-text-recognition');
    MlKit = mod.CapacitorPluginMlKitTextRecognition;
    return MlKit;
  } catch (e) {
    console.warn('ML Kit not available', e);
    return null;
  }
}

/** Dimensiones reales de la captura, necesarias para normalizar la geometría del OCR. */
function readImageSize(base64, format = 'jpeg') {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') return resolve(null);
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = `data:image/${format};base64,${base64}`;
  });
}

/**
 * ML Kit devuelve rectángulos en píxeles. En iOS el eje Y va al revés que en
 * Android, así que se ordenan los extremos en vez de fiarse de qué campo se
 * llama `top`.
 */
function toNormalizedBox(rect, size) {
  if (!rect || !size?.width || !size?.height) return null;

  const top = Math.min(rect.top, rect.bottom) / size.height;
  const bottom = Math.max(rect.top, rect.bottom) / size.height;
  const left = Math.min(rect.left, rect.right) / size.width;
  const right = Math.max(rect.left, rect.right) / size.width;

  return { top, left, width: right - left, height: bottom - top };
}

/** Caja neutra idéntica para todos los bloques cuando no hay geometría utilizable. */
const NEUTRAL_BOX = { top: 0.5, left: 0.1, width: 0.8, height: 0.03 };

/**
 * Aplana la jerarquía del plugin a la lista de líneas que consume el motor.
 *
 * Se usa el nivel de línea, no el de bloque: ML Kit agrupa en un mismo bloque
 * la etiqueta y el número, y necesitamos medir la distancia entre ambos.
 *
 * Si el plugin no devuelve geometría, todas las líneas reciben la MISMA caja
 * neutra. Es deliberado: inventar posiciones distintas por índice de línea, como
 * hacía la versión anterior, crea señales de posición y tamaño falsas que el
 * ranking se cree.
 */
export function flattenRecognition(result, size) {
  const lines = [];
  let hasGeometry = false;

  for (const blockItem of result?.blocks ?? []) {
    const children = blockItem.lines?.length ? blockItem.lines : [blockItem];

    for (const line of children) {
      if (!line?.text) continue;
      const boundingBox = toNormalizedBox(line.boundingBox, size);
      if (boundingBox) hasGeometry = true;

      lines.push({
        text: line.text,
        boundingBox: boundingBox ?? NEUTRAL_BOX,
        recognizedLanguage: line.recognizedLanguage ?? null,
      });
    }
  }

  if (lines.length === 0 && result?.text) {
    for (const text of result.text.split('\n').filter(Boolean)) {
      lines.push({ text, boundingBox: NEUTRAL_BOX, recognizedLanguage: null });
    }
  }

  return { lines, hasGeometry };
}

/** Pasa una captura en base64 por el OCR y el motor de análisis. */
async function recognize(base64, format, domain, rules) {
  const mlkit = await loadMlKit();
  let lines = [];
  let hasGeometry = false;

  if (mlkit && base64) {
    try {
      const [result, size] = await Promise.all([
        mlkit.detectText({ base64Image: base64, rotation: 0 }),
        readImageSize(base64, format),
      ]);
      ({ lines, hasGeometry } = flattenRecognition(result, size));
    } catch (e) {
      console.warn('ML Kit OCR failed', e);
    }
  }

  const analysis = analyzeTicket(lines, domain, rules);

  return { ...analysis, blocks: lines, hasGeometry };
}

/**
 * Pide el permiso de cámara. Se llama al abrir el escáner, no al disparar:
 * si el diálogo del sistema apareciera al pulsar el botón, la pantalla se
 * quedaría en negro sin explicar por qué.
 */
export async function ensureCameraPermission() {
  const permission = await Camera.checkPermissions();
  if (permission.camera === 'granted') return true;

  const req = await Camera.requestPermissions({ permissions: ['camera'] });
  return req.camera === 'granted';
}

/**
 * Arranca la vista previa a pantalla completa por detrás del WebView. El HTML
 * queda por delante (`toBack`), así que la pantalla del escáner debe volverse
 * transparente mientras esté activa.
 */
export async function startCameraPreview() {
  if (!Capacitor.isNativePlatform()) return false;

  const { CameraPreview } = await import('@capacitor-community/camera-preview');

  // Un preview anterior que no se cerró bien (navegación rápida, recarga en
  // caliente) impide arrancar el siguiente.
  try {
    const started = await CameraPreview.isCameraStarted();
    if (started?.value) await CameraPreview.stop();
  } catch {
    /* sin preview previo */
  }

  await CameraPreview.start({
    position: 'rear',
    toBack: true,
    disableAudio: true,
    lockAndroidOrientation: true,
    width: window.screen.width,
    height: window.screen.height,
  });

  return true;
}

export async function stopCameraPreview() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { CameraPreview } = await import('@capacitor-community/camera-preview');
    await CameraPreview.stop();
  } catch {
    /* ya estaba parado */
  }
}

/** Dispara sobre la vista previa ya activa, sin salir de la app. */
export async function captureFromPreview(domain = DEFAULT_DOMAIN, rules = DEFAULT_RULES) {
  const { CameraPreview } = await import('@capacitor-community/camera-preview');
  const photo = await CameraPreview.capture({ quality: 90 });

  return recognize(photo.value, 'jpeg', domain, rules);
}

/**
 * Camino alternativo cuando no hay vista previa (navegador, o el plugin no
 * arrancó): abre la cámara del sistema y analiza la foto resultante.
 */
export async function captureAndRecognize(domain = DEFAULT_DOMAIN, rules = DEFAULT_RULES) {
  if (!(await ensureCameraPermission())) {
    throw new Error('PERMISSION_DENIED');
  }

  const image = await Camera.getPhoto({
    quality: 90,
    resultType: CameraResultType.Base64,
    source: CameraSource.Camera,
    width: 1600,
    correctOrientation: true,
    promptLabelHeader: 'Escanea el ticket completo',
    promptLabelCancel: 'Cancelar',
    promptLabelPhoto: 'Capturar',
  });

  return recognize(image.base64String, image.format, domain, rules);
}

export async function triggerHaptic(type = 'success') {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
    if (type === 'success') {
      await Haptics.notification({ type: NotificationType.Success });
    } else {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  } catch {
    /* opcional */
  }
}

export { DEFAULT_DOMAIN, DEFAULT_RULES };
