/**
 * Utility to print an existing PDF URL or Blob URL via an iframe.
 * @param {string} url - The URL to print.
 * @param {boolean} revoke - Whether to revoke the object URL after printing.
 * @param {Function} [onAfterPrint] - Optional callback for when print is done.
 */
export const printIframe = (url, revoke = false, onAfterPrint = undefined) => {
    try {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '10px';
        iframe.style.bottom = '10px';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.border = 'none';
        iframe.style.opacity = '0.01';
        iframe.style.zIndex = '-1';
        iframe.src = url;

        document.body.appendChild(iframe);

        let triggered = false;
        iframe.onload = () => {
            if (triggered) return;
            triggered = true;

            setTimeout(() => {
                try {
                    let callbackCalled = false;
                    const triggerCallback = () => {
                        if (!callbackCalled) {
                            callbackCalled = true;
                            if (onAfterPrint) onAfterPrint();
                        }
                    };

                    const contentWindow = iframe.contentWindow;
                    if (!contentWindow) {
                        throw new Error("Iframe contentWindow is null");
                    }

                    contentWindow.addEventListener('afterprint', () => {
                        triggerCallback();
                        setTimeout(() => {
                            if (document.body.contains(iframe)) {
                                document.body.removeChild(iframe);
                            }
                            if (revoke) URL.revokeObjectURL(url);
                        }, 1000);
                    }, { once: true });

                    contentWindow.focus();
                    contentWindow.print();
                    
                    setTimeout(triggerCallback, 1000); 

                } catch (e) {
                    console.error("Error triggering print in iframe:", e);
                    window.open(url, '_blank');
                    if (onAfterPrint) onAfterPrint();
                }
            }, 500);
        };
    } catch (e) {
        console.error("Error creating printing iframe:", e);
        window.open(url, '_blank');
        if (onAfterPrint) onAfterPrint();
    }
};
