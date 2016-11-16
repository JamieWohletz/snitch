import { html2canvas } from 'html2canvas';

function buster() {
  const seed = `${Number(new Date())}`.substr(-3);
  let cacheBuster = Number(seed);
  return function bust() {
    cacheBuster += 1;
    return cacheBuster;
  };
}

function buildErrorLog(error, screenshotDataURL) {
  const log = {
    message: error.message,
    fileName: error.filename,
    lineNumber: error.lineno,
    columnNumber: error.colno,
    stackTrace: (error.error || {}).stack,
    timestamp: (new Date()).toLocaleString()
  };
  if (screenshotDataURL) {
    log.screenshot = screenshotDataURL;
  }
  return log;
}

function toQueryString(paramsObject) {
  const keyValStrings = Object.keys(paramsObject).reduce((strs, key) => {
    const keyValStr = `${encodeURIComponent(key)}=${encodeURIComponent(paramsObject[key])}`;
    return strs.concat(keyValStr);
  }, []);
  return keyValStrings.join('&');
}

function selector(element) {
  if (!element) {
    return '';
  }
  const tagName = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
  return [tagName, id, classes].join('');
}

module.exports = {
  /**
   * Listen for global JavaScript errors and build a detailed error log object
   * when any are thrown.
   *
   * @param {function} onErrorThrown Called when an error is thrown. Passed the log object.
   * @param {object} opts Optional additional options to apply.
   *   Currently, only options.takeScreenshot is implemented.
   * @return {void}
   */
  listenForErrors(onErrorThrown, opts) {
    const options = opts || {};
    options.takeScreenshot = options.takeScreenshot || false;

    const handler = function reportError(err) {
      const error = err || {};
      if (!options.takeScreenshot || !html2canvas) {
        onErrorThrown(buildErrorLog(error));
        return;
      }
      html2canvas(document.body).then((canvas) => {
        const dataURL = canvas.toDataURL();
        onErrorThrown(buildErrorLog(error, dataURL));
      });
    };

    window.removeEventListener('error', handler);
    window.addEventListener('error', handler);
  },
  /**
   * Logs user events as they happen by requesting the image at `pixelPath`
   * with a query string appended to the path.
   *
   * By default, the list of "user events" is 'keydown', 'mousedown', and 'dblclick',
   * but this is configurable (see below).
   *
   * The list of currently supported options is below:
   * * `events` - Array of events (as strings) to listen to.
   *   Default: ['keydown', 'mousedown', 'dblclick'].
   * * `additionalParams` - An object containing additional query
   *   params to attach to the query string. By default, the query parameters sent are
   *   `eventType` (e.g., 'keydown') and `eventTarget` (e.g., 'div#my-div').
   * * `bookends` - Boolean controlling whether to log special
   *   'interactionStart' and 'interactionEnd' events. If true, the 'interactionStart'
   *   event is logged immediately and the `interactionEnd` event is logged on the
   *   `window` 'beforeunload' event. This is useful for tracing
   *   single-user interaction sequences in log files. Defaults to true.
   *
   * @param {string} pixelPath - Path to the 1 by 1 pixel to use for logging.
   * @param {object} opts - Hash of options. See description for this function for details.
   * @returns {void}
   */
  logUserEvents(pixelPath, opts) {
    const pixel = document.createElement('img');
    const cacheBuster = buster();
    const options = opts || {};

    options.events = options.events || ['keydown', 'mousedown', 'dblclick'];
    options.additionalParams = options.additionalParams || Object.create(null);
    options.bookends = typeof options.bookends === 'undefined' ? true : options.bookends;

    const recordEvent = function logEvent(e, props) {
      const event = e || {};
      const properties = props || {};
      const params = Object.assign({
        eventType: event.type,
        eventTarget: selector(event.target),
        cb: cacheBuster()
      }, properties, options.additionalParams);

      pixel.src = `${pixelPath}?${toQueryString(params)}`;
    };

    options.events.forEach((eventName) => {
      window.removeEventListener(eventName, recordEvent);
      window.addEventListener(eventName, recordEvent);
    });

    if (!options.bookends) {
      return;
    }
    // Bookend: start of interaction
    recordEvent(null, {
      eventType: 'interactionStart',
      eventTarget: 'window',
      referrer: document.referrer
    });
    // Bookend: end of interaction
    window.addEventListener('beforeunload', () => {
      recordEvent(null, {
        eventType: 'interactionEnd',
        eventTarget: 'window'
      });
    });
  }
};
