import { describe, it, expect } from 'vitest';
import { buildDatasetExport, sanitizeOcrText } from './export.js';
import { createSighting } from '../storage/schema.js';
import { CLASSIFICATION_ORIGIN } from '../taxonomy/constants.js';

describe('sanitizeOcrText', () => {
  it('elimina importes, identificadores fiscales y números largos', () => {
    const text = ['McDonalds', 'KIOSCO', 'PEDIDO', '2323', 'TOTAL 9,80 €', 'CIF A12345678', 'Ticket: 847291'].join('\n');

    expect(sanitizeOcrText(text)).toBe('McDonalds\nKIOSCO\nPEDIDO\n2323');
  });

  it('conserva el número de pedido aunque tenga cuatro dígitos', () => {
    expect(sanitizeOcrText('PEDIDO\n2323')).toBe('PEDIDO\n2323');
  });

  it('elimina las tarjetas enmascaradas', () => {
    expect(sanitizeOcrText('VISA ****1234')).toBe('');
  });
});

describe('buildDatasetExport', () => {
  const sightings = [
    createSighting({
      rawNumber: '2323',
      source: { value: 'KIOSK', confidence: 0.8 },
      fulfillment: { value: 'EAT_IN', confidence: 0.5 },
      evidence: { keywords: ['KIOSCO'], rulesVersion: 1, ocrText: 'KIOSCO\nPEDIDO\n2323\n9,80 €' },
    }),
    createSighting({
      rawNumber: '48',
      source: { value: 'DRIVE_THRU', origin: CLASSIFICATION_ORIGIN.USER_SELECTED },
    }),
  ];

  it('marca como verificado solo lo que decidió la persona', () => {
    const { records } = buildDatasetExport(sightings);

    expect(records[0].verifiedByUser).toBe(false);
    expect(records[0].autoClassified).toBe(true);
    expect(records[1].verifiedByUser).toBe(true);
    expect(records[1].autoClassified).toBe(false);
  });

  it('deja fuera imágenes y declara que la hipótesis no está aplicada', () => {
    const output = buildDatasetExport(sightings);

    expect(output.containsImages).toBe(false);
    expect(output.hypothesisApplied).toBe(false);
    expect(output.records.every((r) => r.interpretation === null)).toBe(true);
  });

  it('sanea el texto OCR que sale de la app', () => {
    const { records } = buildDatasetExport(sightings);

    expect(records[0].ocrText).not.toContain('9,80');
    expect(records[0].ocrText).toContain('2323');
  });

  it('conserva el número tal cual, sin rellenar ni recortar', () => {
    const { records } = buildDatasetExport(sightings);

    expect(records.map((r) => r.rawNumber)).toEqual(['2323', '48']);
  });
});
