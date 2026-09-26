/**
 * Reliable utility to download images and videos directly to the user's local Downloads folder.
 * Works across all browsers and handles CORS, Blob URLs, Base64 Data URLs, and remote URLs.
 */

/**
 * Saves a Blob directly to the user's Downloads folder
 */
export const saveBlobToDisk = (blob, fileName = "ai-download.jpg") => {
  // Convert blob to an application/octet-stream to ensure the browser forces download rather than preview
  const binaryBlob =
    blob.type === "application/octet-stream"
      ? blob
      : new Blob([blob], { type: "application/octet-stream" });

  const blobUrl = window.URL.createObjectURL(binaryBlob);
  const link = document.createElement("a");

  // Keep link offscreen
  link.style.position = "fixed";
  link.style.left = "-99999px";
  link.style.top = "-99999px";
  link.href = blobUrl;
  link.download = fileName;
  link.setAttribute("download", fileName);

  document.body.appendChild(link);

  // Dispatch standard click event
  try {
    const evt = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    link.dispatchEvent(evt);
  } catch {
    link.click();
  }

  // Cleanup after 60s so the browser finishes file creation
  setTimeout(() => {
    try {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Cleanup error in saveBlobToDisk:", err);
    }
  }, 60000);
};

/**
 * Converts a Base64 Data URL to a Blob
 */
export const dataUrlToBlob = (dataUrl) => {
  const parts = dataUrl.split(";base64,");
  const contentType = parts[0].split(":")[1] || "image/jpeg";
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

/**
 * Main function to download any media URL to the Downloads folder
 * 
 * @param {string} mediaUrl - The URL of the image or video (remote, local, or data URL)
 * @param {string} defaultFileName - The desired file name (e.g. 'ai-image-123.jpg')
 * @returns {Promise<boolean>}
 */
export const downloadMedia = async (mediaUrl, defaultFileName = "ai-generated-image.jpg") => {
  if (!mediaUrl) {
    throw new Error("No media URL provided for download.");
  }

  const fileName = defaultFileName || `ai-download-${Date.now()}.jpg`;

  // Strategy 1: Base64 Data URL
  if (typeof mediaUrl === "string" && mediaUrl.startsWith("data:")) {
    try {
      const blob = dataUrlToBlob(mediaUrl);
      saveBlobToDisk(blob, fileName);
      return true;
    } catch (err) {
      console.warn("Base64 download failed, continuing...", err);
    }
  }

  // Strategy 2: Direct Fetch (works for same-origin, local assets, and CORS-enabled servers)
  try {
    const response = await fetch(mediaUrl, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
    });

    if (response.ok) {
      const blob = await response.blob();
      saveBlobToDisk(blob, fileName);
      return true;
    }
  } catch (err) {
    console.warn("Direct fetch failed, trying proxy and canvas methods...", err);
  }

  // Strategy 3: HTML5 Canvas Export with crossOrigin
  try {
    const canvasBlob = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width || 800;
          canvas.height = img.naturalHeight || img.height || 600;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (b) => {
              if (b) resolve(b);
              else reject(new Error("Canvas toBlob returned null"));
            },
            "image/jpeg",
            0.98
          );
        } catch (canvasErr) {
          reject(canvasErr);
        }
      };
      img.onerror = (e) => reject(e);
      img.src = mediaUrl;
    });

    if (canvasBlob) {
      saveBlobToDisk(canvasBlob, fileName);
      return true;
    }
  } catch (err) {
    console.warn("Canvas export failed, trying image proxy...", err);
  }

  // Strategy 4: High-speed Cloudflare image proxy (images.weserv.nl)
  try {
    const cleanUrl = mediaUrl.replace(/^https?:\/\//, "");
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&output=jpg`;
    const response = await fetch(proxyUrl, {
      method: "GET",
      mode: "cors",
    });

    if (response.ok) {
      const blob = await response.blob();
      saveBlobToDisk(blob, fileName);
      return true;
    }
  } catch (err) {
    console.warn("Weserv proxy failed, trying AllOrigins...", err);
  }

  // Strategy 5: AllOrigins CORS proxy
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(mediaUrl)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const blob = await response.blob();
      saveBlobToDisk(blob, fileName);
      return true;
    }
  } catch (err) {
    console.warn("AllOrigins proxy failed, trying corsproxy...", err);
  }

  // Strategy 6: CorsProxy.io
  try {
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(mediaUrl)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const blob = await response.blob();
      saveBlobToDisk(blob, fileName);
      return true;
    }
  } catch (err) {
    console.warn("CorsProxy.io failed...", err);
  }

  // Strategy 7: Fallback direct link trigger
  const fallbackLink = document.createElement("a");
  fallbackLink.href = mediaUrl;
  fallbackLink.download = fileName;
  fallbackLink.setAttribute("download", fileName);
  fallbackLink.target = "_blank";
  document.body.appendChild(fallbackLink);
  fallbackLink.click();
  setTimeout(() => {
    try {
      document.body.removeChild(fallbackLink);
    } catch {}
  }, 5000);

  return true;
};

export default {
  saveBlobToDisk,
  dataUrlToBlob,
  downloadMedia,
};
