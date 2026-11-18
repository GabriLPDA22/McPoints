import { Capacitor } from '@capacitor/core';

/**
 * Guarda un JSON para que el usuario se lo lleve fuera de la app.
 *
 * En Android, la WebView de Capacitor ignora `<a download>` con URLs blob:
 * el botón de exportar "funcionaba" pero el archivo nunca aparecía. Ahí se
 * escribe en la caché de la app y se abre la hoja de compartir del sistema
 * (Drive, Archivos, WhatsApp, correo…), que además deja elegir dónde guardarlo.
 * En web se mantiene la descarga normal.
 *
 * @returns {Promise<'shared'|'downloaded'|'cancelled'>}
 */
export async function saveJsonFile(data, filename, { dialogTitle } = {}) {
  const json = JSON.stringify(data, null, 2);

  if (!Capacitor.isNativePlatform()) {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    // Revocar en el siguiente tick: hacerlo en el mismo tick cancela la descarga en algunos navegadores.
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return 'downloaded';
  }

  const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ]);

  const { uri } = await Filesystem.writeFile({
    path: filename,
    data: json,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });

  try {
    await Share.share({ title: filename, files: [uri], dialogTitle });
    return 'shared';
  } catch (e) {
    // Cerrar la hoja de compartir sin elegir destino no es un error.
    if (/cancel/i.test(String(e?.message ?? e))) return 'cancelled';
    throw e;
  }
}
