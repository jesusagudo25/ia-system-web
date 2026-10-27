import axios from 'axios';
import { toast } from 'react-toastify';
import palette from '../theme/palette';
import typography from '../theme/typography';

// about:blank has no React styles. Reuse the current light theme's tokens and
// Card spacing/radius (8px spacing, shape.borderRadius 6 doubled by MuiCard).
function showDocumentLoading(preview) {
  const doc = preview.document;
  doc.documentElement.lang = 'es';
  doc.documentElement.style.colorScheme = 'light';
  const viewport = doc.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = 'width=device-width, initial-scale=1';
  const styles = doc.createElement('style');
  styles.textContent = `
    @keyframes smi-pdf-spin { to { transform: rotate(360deg); } }
    .smi-pdf-wait { min-height: 100vh; min-height: 100svh; display: grid; place-items: center; padding: 24px; box-sizing: border-box; }
    .smi-pdf-spinner { animation: smi-pdf-spin 1.4s linear infinite; }
    @media (prefers-reduced-motion: reduce) { .smi-pdf-spinner { animation: none; } }
  `;
  doc.head.appendChild(viewport);
  doc.head.appendChild(styles);
  Object.assign(doc.body.style, {
    margin: '0', backgroundColor: palette.background.default,
    color: palette.text.primary, fontFamily: typography.fontFamily,
  });

  const main = doc.createElement('main');
  main.className = 'smi-pdf-wait';
  const status = doc.createElement('section');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  status.setAttribute('aria-labelledby', 'smi-pdf-heading');
  status.setAttribute('aria-describedby', 'smi-pdf-explanation');
  Object.assign(status.style, {
    width: '100%', maxWidth: '420px', boxSizing: 'border-box', padding: '32px 24px',
    borderRadius: '12px', border: `1px solid ${palette.divider}`,
    backgroundColor: palette.background.paper, textAlign: 'center',
  });
  const spinner = doc.createElement('div');
  spinner.className = 'smi-pdf-spinner';
  spinner.setAttribute('aria-hidden', 'true');
  Object.assign(spinner.style, {
    width: '40px', height: '40px', boxSizing: 'border-box', margin: '0 auto 24px',
    borderRadius: '50%', border: `4px solid ${palette.grey[200]}`,
    borderTopColor: palette.primary.main,
  });
  const heading = doc.createElement('h1');
  heading.id = 'smi-pdf-heading';
  heading.textContent = 'Preparando documento';
  Object.assign(heading.style, {
    margin: '0 0 8px', fontSize: typography.h6.fontSize,
    fontWeight: typography.h6.fontWeight, lineHeight: typography.h6.lineHeight,
  });
  const explanation = doc.createElement('p');
  explanation.id = 'smi-pdf-explanation';
  explanation.textContent = 'El PDF se abrirá aquí cuando esté listo';
  Object.assign(explanation.style, {
    margin: '0', color: palette.text.secondary, fontSize: typography.body2.fontSize,
    lineHeight: typography.body2.lineHeight,
  });
  status.appendChild(spinner);
  status.appendChild(heading);
  status.appendChild(explanation);
  main.appendChild(status);
  doc.body.replaceChildren(main);
}

const statusMessages = {
  401: 'Tu sesión ha caducado. Inicia sesión de nuevo.',
  403: 'No se pudo acceder al documento.',
  404: 'No se encontró el documento.',
  429: 'Hay demasiadas solicitudes. Espera y vuelve a intentarlo.',
};

// Decode JSON blobs for classification only. Never display server exception text,
// request URLs, credentials or HTML in the UI.
async function errorMessage(response) {
  let message;
  try {
    const data = response?.data;
    const parsed = data instanceof Blob ? JSON.parse(await data.slice(0, 4096).text()) : data;
    message = parsed?.message;
  } catch {
    // HTML, binary and malformed JSON use a controlled message below.
  }
  if (message === 'Unauthenticated.') return statusMessages[401];
  return statusMessages[response?.status] || (
    response?.status >= 500
      ? 'No se pudo generar el documento. Vuelve a intentarlo más tarde.'
      : 'No se recibió un PDF válido. Vuelve a intentarlo.'
  );
}

// Call directly from onClick: the window must be reserved before any await.
// Uses the same Axios singleton configured in App.js, including its Bearer interceptor.
export async function openAuthenticatedDocument(path, filename) {
  let preview;
  let objectUrl;
  let closeTimer;
  const release = () => {
    if (closeTimer) window.clearInterval(closeTimer);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = undefined;
    }
  };

  try {
    const destination = new URL(path, axios.defaults.baseURL);
    const backend = new URL(axios.defaults.baseURL);
    if (destination.origin !== backend.origin || destination.protocol !== 'https:' || destination.search) {
      toast.error('La dirección del documento no está permitida.');
      return false;
    }

    preview = window.open('about:blank', '_blank');
    if (!preview) {
      toast.error('El navegador bloqueó la pestaña del PDF. Permite las ventanas emergentes de este sitio y vuelve a abrir el documento.');
      return false;
    }
    preview.opener = null;
    preview.document.title = filename;
    showDocumentLoading(preview);

    const response = await axios.get(destination.href, {
      responseType: 'blob',
      timeout: 60000,
      headers: { Accept: 'application/pdf' },
    });
    if (preview.closed) return false;

    const pdf = response.data;
    const type = (response.headers?.['content-type'] || pdf?.type || '').split(';')[0].trim().toLowerCase();
    if (response.status !== 200 || !(pdf instanceof Blob) || type !== 'application/pdf' ||
        (await pdf.slice(0, 5).text()) !== '%PDF-') {
      const message = await errorMessage(response);
      preview.close();
      toast.error(message);
      return false;
    }
    if (preview.closed) return false;

    objectUrl = URL.createObjectURL(new File([pdf], filename, { type: 'application/pdf' }));
    const frame = preview.document.createElement('iframe');
    frame.title = filename;
    frame.src = objectUrl;
    frame.style.cssText = 'width:100%;height:100%;border:0;';
    preview.document.body.style.cssText = 'margin:0;height:100vh;';
    preview.document.body.replaceChildren(frame);

    // Do not revoke on load or on an arbitrary timeout: printing/saving may happen
    // much later. Release when the containing tab is closed or leaves this page.
    preview.addEventListener('pagehide', release, { once: true });
    closeTimer = window.setInterval(() => {
      if (preview.closed) release();
    }, 1000);
    return true;
  } catch (error) {
    release();
    if (preview && !preview.closed) preview.close();
    toast.error(error.response
      ? await errorMessage(error.response)
      : 'No se pudo abrir el documento. Revisa tu conexión y vuelve a intentarlo.');
    return false;
  }
}
