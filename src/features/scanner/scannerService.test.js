import { describe, it, expect, vi } from 'vitest';

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }));
vi.mock('@capacitor/camera', () => ({
  Camera: { checkPermissions: vi.fn(), requestPermissions: vi.fn(), getPhoto: vi.fn() },
  CameraResultType: { Base64: 'base64' },
  CameraSource: { Camera: 'CAMERA' },
}));

import { flattenRecognition, withTimeout, ScanError, SCAN_ERROR } from './scannerService.js';

const size = { width: 1000, height: 2000 };

function mlKitLine(text, rect) {
  return { text, boundingBox: rect, recognizedLanguage: 'es', cornerPoints: null };
}

describe('flattenRecognition', () => {
  it('aplana al nivel de línea y normaliza la geometría a 0-1', () => {
    const result = {
      text: 'PEDIDO\n2323',
      blocks: [
        {
          text: 'PEDIDO\n2323',
          boundingBox: { left: 100, top: 200, right: 900, bottom: 600 },
          lines: [
            mlKitLine('PEDIDO', { left: 100, top: 200, right: 500, bottom: 260 }),
            mlKitLine('2323', { left: 100, top: 400, right: 900, bottom: 600 }),
          ],
        },
      ],
    };

    const { lines, hasGeometry } = flattenRecognition(result, size);

    expect(hasGeometry).toBe(true);
    expect(lines.map((l) => l.text)).toEqual(['PEDIDO', '2323']);
    expect(lines[0].boundingBox).toEqual({ top: 0.1, left: 0.1, width: 0.4, height: 0.03 });
    // el número ocupa más alto: es la señal de tamaño que usa el ranking
    expect(lines[1].boundingBox.height).toBeGreaterThan(lines[0].boundingBox.height);
  });

  it('ordena los extremos, así que el eje Y invertido de iOS no rompe la caja', () => {
    const result = {
      blocks: [{ text: '2323', boundingBox: { left: 100, top: 600, right: 900, bottom: 400 } }],
    };

    const [line] = flattenRecognition(result, size).lines;

    expect(line.boundingBox.top).toBe(0.2);
    expect(line.boundingBox.height).toBeCloseTo(0.1);
  });

  it('usa el bloque cuando no trae líneas', () => {
    const result = {
      blocks: [{ text: '2323', boundingBox: { left: 0, top: 0, right: 1000, bottom: 200 } }],
    };

    expect(flattenRecognition(result, size).lines).toHaveLength(1);
  });

  it('sin dimensiones de imagen no inventa posiciones: todas las líneas comparten caja neutra', () => {
    const result = {
      blocks: [
        { text: 'PEDIDO', boundingBox: { left: 100, top: 200, right: 500, bottom: 260 } },
        { text: '2323', boundingBox: { left: 100, top: 400, right: 900, bottom: 600 } },
      ],
    };

    const { lines, hasGeometry } = flattenRecognition(result, null);

    expect(hasGeometry).toBe(false);
    expect(lines[0].boundingBox).toEqual(lines[1].boundingBox);
  });

  it('cae al texto plano si el plugin no devuelve bloques', () => {
    const { lines, hasGeometry } = flattenRecognition({ text: 'PEDIDO\n2323', blocks: [] }, size);

    expect(lines.map((l) => l.text)).toEqual(['PEDIDO', '2323']);
    expect(hasGeometry).toBe(false);
  });
});

describe('withTimeout', () => {
  it('devuelve el valor si la promesa termina a tiempo', async () => {
    await expect(withTimeout(Promise.resolve(42), 50, SCAN_ERROR.OCR_FAILED)).resolves.toBe(42);
  });

  it('rechaza con ScanError y su código si la promesa nunca se resuelve', async () => {
    vi.useFakeTimers();
    const pending = withTimeout(new Promise(() => {}), 1000, SCAN_ERROR.CAPTURE_FAILED);
    const assertion = expect(pending).rejects.toMatchObject({
      name: 'ScanError',
      code: SCAN_ERROR.CAPTURE_FAILED,
    });
    vi.advanceTimersByTime(1000);
    await assertion;
    vi.useRealTimers();
  });

  it('propaga el error original si la promesa falla antes del tope', async () => {
    const boom = new Error('boom');
    await expect(withTimeout(Promise.reject(boom), 50, SCAN_ERROR.OCR_FAILED)).rejects.toBe(boom);
    expect(boom).not.toBeInstanceOf(ScanError);
  });
});
