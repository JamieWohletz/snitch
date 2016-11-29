import uniqueSelector from 'unique-selector';

const INTERACTION_EVENTS = ['mousedown', 'keydown', 'dblclick', 'wheel'];

function isFunc(f) {
  return typeof f === 'function';
}

function isObject(o) {
  return o !== null && typeof o === 'object';
}

function assert(condition, message = 'Error!', ErrorConstructor = Error) {
  if (!condition) {
    throw new ErrorConstructor(message);
  }
}

function selector(element) {
  if (!element || !(element instanceof HTMLElement)) {
    return '';
  }
  return uniqueSelector(element);
}

function dataWrap(obj) {
  return {
    data: obj
  };
}

function maskData(normalizedEvent) {
  function mask(obj) {
    const masked = {};
    Object.keys(obj).forEach((key) => {
      masked[key] = 'X';
    });
    return masked;
  }
  const maskedData = mask(normalizedEvent.data);
  return Object.assign({}, normalizedEvent, dataWrap(maskedData));
}

function normalizeEvent(e = {}) {
  let event = e;
  if (!isObject(event)) {
    event = {};
  }
  return {
    type: event.type || '',
    target: selector(event.target),
    timestamp: new Date(),
    data: {}
  };
}

function normalizeErrorEvent(error = {}) {
  let errorObj = error;
  if (!isObject(error)) {
    errorObj = {};
  }
  const base = normalizeEvent(errorObj);
  return Object.assign(base,
    dataWrap({
      message: errorObj.message,
      fileName: errorObj.filename,
      lineNumber: errorObj.lineno,
      columnNumber: errorObj.colno,
      stackTrace: (errorObj.error || {}).stack
    })
  );
}

/**
 * Builds an object with information related to the
 * given event. The given event must be an instance of
 * UIEvent at the very least. Detailed information will be
 * given for instances of MouseEvent, KeyboardEvent, and WheelEvent.
 * @param {Event} e Event instance.
 * @param {Boolean} mask Whether to mask the event-specific data.
 * @returns {Object} An object containing event-specific data.
 */
function normalizeUIEvent(e = {}) {
  let event = e;

  if (!isObject(e)) {
    event = {};
  }

  const base = normalizeEvent(event);
  if (event instanceof WheelEvent) {
    return Object.assign(base,
      dataWrap({
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ
      })
    );
  }
  if (event instanceof MouseEvent) {
    return Object.assign(base,
      dataWrap({
        x: e.clientX,
        y: e.clientY
      })
    );
  }
  if (event instanceof KeyboardEvent) {
    return Object.assign(base,
      dataWrap({
        key: event.key
      })
    );
  }
  return base;
}

function normalize(event = {}) {
  const eventObj = isObject(event) && event instanceof Event ? event : {};
  if (eventObj instanceof ErrorEvent) {
    return normalizeErrorEvent(eventObj);
  } else if (eventObj instanceof UIEvent) {
    return normalizeUIEvent(eventObj);
  }
  return normalizeEvent(eventObj);
}

function onError(target, callback) {
  let tgt = target;
  let cb = callback;
  if (isFunc(target) && !callback) {
    tgt = window;
    cb = target;
  }
  assert(tgt instanceof EventTarget, 'target must be an instance of EventTarget!', TypeError);
  assert(isFunc(cb), 'callback must be a function!', TypeError);
  const handler = function errorHandler(errorEvent) {
    cb.call(errorEvent, normalize(errorEvent), errorEvent);
  };
  tgt.removeEventListener('error', handler);
  tgt.addEventListener('error', handler);
  return handler;
}

function offError(target, handler) {
  let tgt = target;
  let hndlr = handler;
  if (isFunc(target) && !handler) {
    tgt = window;
    hndlr = target;
  }
  assert(tgt instanceof EventTarget, 'target must be an instance of EventTarget!', TypeError);
  assert(isFunc(hndlr), 'handler must be a function!', TypeError);
  tgt.removeEventListener('error', hndlr);
}

function onInteraction(target, callback, options = { maskClass: null }) {
  assert(target instanceof EventTarget, 'target must be an instance of EventTarget!', TypeError);
  assert(isFunc(callback), 'callback must be a function!', TypeError);
  const handler = function interactionHandler(event = {}) {
    const evtTarget = event.target || {};
    let normalized = normalize(event);
    if (evtTarget instanceof EventTarget && evtTarget.classList.contains(options.maskClass)) {
      normalized = maskData(normalized);
    }
    callback.call(event, normalized, event);
  };
  INTERACTION_EVENTS.forEach((eventType) => {
    target.removeEventListener(eventType, handler);
    target.addEventListener(eventType, handler);
  });
  return handler;
}

function offInteraction(target, handler) {
  assert(target instanceof EventTarget, 'target must be an instance of EventTarget!', TypeError);
  assert(isFunc(handler), 'handler must be a function!', TypeError);
  INTERACTION_EVENTS.forEach((eventType) => {
    target.removeEventListener(eventType, handler);
  });
}

module.exports = {
  normalize,
  onError,
  offError,
  onInteraction,
  offInteraction
};
