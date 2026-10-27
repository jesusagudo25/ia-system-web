import axios from 'axios';
import { toast } from 'react-toastify';

const statusMessages = {
  401: 'Your session has expired. Please sign in again.',
  403: 'The document could not be accessed.',
  404: 'The invoice was not found.',
  429: 'Too many requests. Please wait and try again.',
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
      ? 'The server could not generate the invoice. Please try again later.'
      : 'The server did not return a valid PDF. Please try again.'
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
      toast.error('The document address is not allowed.');
      return false;
    }

    preview = window.open('about:blank', '_blank');
    if (!preview) {
      toast.error('Your browser blocked the PDF tab. Allow pop-ups for this site and click Download again.');
      return false;
    }
    preview.opener = null;
    preview.document.title = filename;
    preview.document.body.textContent = 'Loading invoice…';

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
      : 'The invoice could not be opened. Check your connection and try again.');
    return false;
  }
}
