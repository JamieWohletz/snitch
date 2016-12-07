/*!
 * Snitchjs, by Jamie Wohletz.
 * Error logging and event tracking in the browser.
 * MIT License.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["snitch"] = factory();
	else
		root["snitch"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _uniqueSelector = __webpack_require__(1);

	var _uniqueSelector2 = _interopRequireDefault(_uniqueSelector);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var INTERACTION_EVENTS = ['mousedown', 'keydown', 'dblclick', 'wheel'];

	function isFunc(f) {
	  return typeof f === 'function';
	}

	function isObject(o) {
	  return o !== null && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object';
	}

	function assert(condition) {
	  var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Error!';
	  var ErrorConstructor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Error;

	  if (!condition) {
	    throw new ErrorConstructor(message);
	  }
	}

	function selector(element) {
	  if (!element || !(element instanceof HTMLElement)) {
	    return '';
	  }
	  return (0, _uniqueSelector2.default)(element);
	}

	function dataWrap(obj) {
	  return {
	    data: obj
	  };
	}

	function maskData(normalizedEvent) {
	  function mask(obj) {
	    var masked = {};
	    Object.keys(obj).forEach(function (key) {
	      masked[key] = 'X';
	    });
	    return masked;
	  }

	  var maskedData = mask(normalizedEvent.data);
	  return Object.assign({}, normalizedEvent, dataWrap(maskedData));
	}

	function normalizeEvent() {
	  var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	  var event = e;
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

	function normalizeErrorEvent() {
	  var error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	  var errorObj = error;
	  if (!isObject(error)) {
	    errorObj = {};
	  }
	  var base = normalizeEvent(errorObj);
	  return Object.assign(base, dataWrap({
	    message: errorObj.message,
	    fileName: errorObj.filename,
	    lineNumber: errorObj.lineno,
	    columnNumber: errorObj.colno,
	    stackTrace: (errorObj.error || {}).stack
	  }));
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
	function normalizeUIEvent() {
	  var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	  var event = e;

	  if (!isObject(e)) {
	    event = {};
	  }

	  var base = normalizeEvent(event);
	  if (event instanceof WheelEvent) {
	    return Object.assign(base, dataWrap({
	      deltaX: event.deltaX,
	      deltaY: event.deltaY,
	      deltaZ: event.deltaZ
	    }));
	  }
	  if (event instanceof MouseEvent) {
	    return Object.assign(base, dataWrap({
	      clientX: e.clientX,
	      clientY: e.clientY
	    }));
	  }
	  if (event instanceof KeyboardEvent) {
	    return Object.assign(base, dataWrap({
	      key: event.key
	    }));
	  }
	  return base;
	}

	function normalize() {
	  var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	  var eventObj = isObject(event) && event instanceof Event ? event : {};
	  if (eventObj instanceof ErrorEvent) {
	    return normalizeErrorEvent(eventObj);
	  } else if (eventObj instanceof UIEvent) {
	    return normalizeUIEvent(eventObj);
	  }
	  return normalizeEvent(eventObj);
	}

	function onError(target, callback) {
	  var tgt = target;
	  var cb = callback;
	  if (isFunc(target) && !callback) {
	    tgt = window;
	    cb = target;
	  }
	  assert(tgt instanceof EventTarget, 'target must be an instance of EventTarget!', TypeError);
	  assert(isFunc(cb), 'callback must be a function!', TypeError);
	  var handler = function errorHandler(errorEvent) {
	    cb.call(errorEvent, normalize(errorEvent), errorEvent);
	  };
	  tgt.removeEventListener('error', handler);
	  tgt.addEventListener('error', handler);
	  return handler;
	}

	function offError(target, handler) {
	  var tgt = target;
	  var hndlr = handler;
	  if (isFunc(target) && !handler) {
	    tgt = window;
	    hndlr = target;
	  }
	  assert(tgt instanceof EventTarget, 'target must be an instance of EventTarget!', TypeError);
	  assert(isFunc(hndlr), 'handler must be a function!', TypeError);
	  tgt.removeEventListener('error', hndlr);
	}

	function onInteraction(target, callback) {
	  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { maskClass: null };

	  assert(target instanceof EventTarget, 'target must be an instance of EventTarget!', TypeError);
	  assert(isFunc(callback), 'callback must be a function!', TypeError);
	  var handler = function interactionHandler() {
	    var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    var evtTarget = event.target || {};
	    var normalized = normalize(event);
	    if (evtTarget instanceof EventTarget && evtTarget.classList && evtTarget.classList.contains(options.maskClass)) {
	      normalized = maskData(normalized);
	    }
	    callback.call(event, normalized, event);
	  };
	  INTERACTION_EVENTS.forEach(function (eventType) {
	    target.removeEventListener(eventType, handler);
	    target.addEventListener(eventType, handler);
	  });
	  return handler;
	}

	function offInteraction(target, handler) {
	  assert(target instanceof EventTarget, 'target must be an instance of EventTarget!', TypeError);
	  assert(isFunc(handler), 'handler must be a function!', TypeError);
	  INTERACTION_EVENTS.forEach(function (eventType) {
	    target.removeEventListener(eventType, handler);
	  });
	}

	module.exports = {
	  normalize: normalize,
	  onError: onError,
	  offError: offError,
	  onInteraction: onInteraction,
	  offInteraction: offInteraction
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = unique;

	var _getID = __webpack_require__(2);

	var _getClasses = __webpack_require__(3);

	var _getAttributes = __webpack_require__(4);

	var _getNthChild = __webpack_require__(5);

	var _getTag = __webpack_require__(7);

	var _isUnique = __webpack_require__(8);

	var _getParents = __webpack_require__(9);

	/**
	 * Returns all the selectors of the elmenet
	 * @param  { Object } element
	 * @return { Object }
	 */
	function getAllSelectors(el, selectors, attributesToIgnore) {
	  var funcs = {
	    'Tag': _getTag.getTag,
	    'NthChild': _getNthChild.getNthChild,
	    'Attributes': function Attributes(elem) {
	      return (0, _getAttributes.getAttributes)(elem, attributesToIgnore);
	    },
	    'Class': _getClasses.getClassSelectors,
	    'ID': _getID.getID
	  };

	  return selectors.reduce(function (res, next) {
	    res[next] = funcs[next](el);
	    return res;
	  }, {});
	}

	/**
	 * Tests uniqueNess of the element inside its parent
	 * @param  { Object } element
	 * @param { String } Selectors
	 * @return { Boolean }
	 */
	/**
	 * Expose `unique`
	 */

	function testUniqueness(element, selector) {
	  var parentNode = element.parentNode;

	  var elements = parentNode.querySelectorAll(selector);
	  return elements.length === 1 && elements[0] === element;
	}

	/**
	 * Checks all the possible selectors of an element to find one unique and return it
	 * @param  { Object } element
	 * @param  { Array } items
	 * @param  { String } tag
	 * @return { String }
	 */
	function getUniqueCombination(element, items, tag) {
	  var combinations = getCombinations(items);
	  var uniqCombinations = combinations.filter(testUniqueness.bind(this, element));
	  if (uniqCombinations.length) return uniqCombinations[0];

	  if (Boolean(tag)) {
	    var _combinations = items.map(function (item) {
	      return tag + item;
	    });
	    var _uniqCombinations = _combinations.filter(testUniqueness.bind(this, element));
	    if (_uniqCombinations.length) return _uniqCombinations[0];
	  }

	  return null;
	}

	/**
	 * Returns a uniqueSelector based on the passed options
	 * @param  { DOM } element
	 * @param  { Array } options
	 * @return { String }
	 */
	function getUniqueSelector(element, selectorTypes, attributesToIgnore) {
	  var foundSelector = void 0;

	  var elementSelectors = getAllSelectors(element, selectorTypes, attributesToIgnore);

	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;

	  try {
	    for (var _iterator = selectorTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var selectorType = _step.value;
	      var ID = elementSelectors.ID,
	          Tag = elementSelectors.Tag,
	          Classes = elementSelectors.Class,
	          Attributes = elementSelectors.Attributes,
	          NthChild = elementSelectors.NthChild;

	      switch (selectorType) {
	        case 'ID':
	          if (Boolean(ID) && testUniqueness(element, ID)) {
	            return ID;
	          }
	          break;

	        case 'Tag':
	          if (Boolean(Tag) && testUniqueness(element, Tag)) {
	            return Tag;
	          }
	          break;

	        case 'Class':
	          if (Boolean(Classes) && Classes.length) {
	            foundSelector = getUniqueCombination(element, Classes, Tag);
	            if (foundSelector) {
	              return foundSelector;
	            }
	          }
	          break;

	        case 'Attributes':
	          if (Boolean(Attributes) && Attributes.length) {
	            foundSelector = getUniqueCombination(element, Attributes, Tag);
	            if (foundSelector) {
	              return foundSelector;
	            }
	          }
	          break;

	        case 'NthChild':
	          if (Boolean(NthChild)) {
	            return NthChild;
	          }
	      }
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator.return) {
	        _iterator.return();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }

	  return '*';
	}

	/**
	 * Returns all the possible selector combinations
	 */
	function getCombinations(items) {
	  items = items ? items : [];
	  var result = [[]];
	  var i = void 0,
	      j = void 0,
	      k = void 0,
	      l = void 0,
	      ref = void 0,
	      ref1 = void 0;

	  for (i = k = 0, ref = items.length - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
	    for (j = l = 0, ref1 = result.length - 1; 0 <= ref1 ? l <= ref1 : l >= ref1; j = 0 <= ref1 ? ++l : --l) {
	      result.push(result[j].concat(items[i]));
	    }
	  }

	  result.shift();
	  result = result.sort(function (a, b) {
	    return a.length - b.length;
	  });
	  result = result.map(function (item) {
	    return item.join('');
	  });

	  return result;
	}

	/**
	 * Generate unique CSS selector for given DOM element
	 *
	 * @param {Element} el
	 * @return {String}
	 * @api private
	 */

	function unique(el) {
	  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	  var _options$selectorType = options.selectorTypes,
	      selectorTypes = _options$selectorType === undefined ? ['ID', 'Class', 'Tag', 'NthChild'] : _options$selectorType,
	      _options$attributesTo = options.attributesToIgnore,
	      attributesToIgnore = _options$attributesTo === undefined ? ['id', 'class', 'length'] : _options$attributesTo;

	  var allSelectors = [];
	  var parents = (0, _getParents.getParents)(el);

	  var _iteratorNormalCompletion2 = true;
	  var _didIteratorError2 = false;
	  var _iteratorError2 = undefined;

	  try {
	    for (var _iterator2 = parents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	      var elem = _step2.value;

	      var selector = getUniqueSelector(elem, selectorTypes, attributesToIgnore);
	      if (Boolean(selector)) {
	        allSelectors.push(selector);
	      }
	    }
	  } catch (err) {
	    _didIteratorError2 = true;
	    _iteratorError2 = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion2 && _iterator2.return) {
	        _iterator2.return();
	      }
	    } finally {
	      if (_didIteratorError2) {
	        throw _iteratorError2;
	      }
	    }
	  }

	  var selectors = [];
	  var _iteratorNormalCompletion3 = true;
	  var _didIteratorError3 = false;
	  var _iteratorError3 = undefined;

	  try {
	    for (var _iterator3 = allSelectors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	      var it = _step3.value;

	      selectors.unshift(it);
	      var _selector = selectors.join(' > ');
	      if ((0, _isUnique.isUnique)(el, _selector)) {
	        return _selector;
	      }
	    }
	  } catch (err) {
	    _didIteratorError3 = true;
	    _iteratorError3 = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion3 && _iterator3.return) {
	        _iterator3.return();
	      }
	    } finally {
	      if (_didIteratorError3) {
	        throw _iteratorError3;
	      }
	    }
	  }

	  return null;
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getID = getID;
	/**
	 * Returns the Tag of the element
	 * @param  { Object } element
	 * @return { String }
	 */
	function getID(el) {
	  return '#' + el.getAttribute('id');
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getClasses = getClasses;
	exports.getClassSelectors = getClassSelectors;
	/**
	 * Get class names for an element
	 *
	 * @pararm { Element } el
	 * @return { Array }
	 */
	function getClasses(el) {
	  var classNames = void 0;

	  try {
	    classNames = el.classList.toString().split(' ');
	  } catch (e) {
	    if (!el.hasAttribute('class')) {
	      return [];
	    }

	    var className = el.getAttribute('class');

	    // remove duplicate and leading/trailing whitespaces
	    className = className.trim().replace(/\s+/g, ' ');

	    // split into separate classnames
	    classNames = className.split(' ');
	  }

	  return classNames;
	}

	/**
	 * Returns the Class selectors of the element
	 * @param  { Object } element
	 * @return { Array }
	 */
	function getClassSelectors(el) {
	  var classList = getClasses(el).filter(Boolean);
	  return classList.map(function (cl) {
	    return '.' + cl;
	  });
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getAttributes = getAttributes;

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	/**
	 * Returns the Attribute selectors of the element
	 * @param  { DOM Element } element
	 * @param  { Array } array of attributes to ignore
	 * @return { Array }
	 */
	function getAttributes(el) {
	  var attributesToIgnore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['id', 'class', 'length'];
	  var attributes = el.attributes;

	  var attrs = [].concat(_toConsumableArray(attributes));

	  return attrs.reduce(function (sum, next) {
	    if (!(attributesToIgnore.indexOf(next.nodeName) > -1)) {
	      sum.push('[' + next.nodeName + '="' + next.value + '"]');
	    }
	    return sum;
	  }, []);
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getNthChild = getNthChild;

	var _isElement = __webpack_require__(6);

	/**
	 * Returns the selectors based on the position of the element relative to its siblings
	 * @param  { Object } element
	 * @return { Array }
	 */
	function getNthChild(element) {
	  var counter = 0;
	  var k = void 0;
	  var sibling = void 0;
	  var parentNode = element.parentNode;


	  if (Boolean(parentNode)) {
	    var childNodes = parentNode.childNodes;

	    var len = childNodes.length;
	    for (k = 0; k < len; k++) {
	      sibling = childNodes[k];
	      if ((0, _isElement.isElement)(sibling)) {
	        counter++;
	        if (sibling === element) {
	          return ':nth-child(' + counter + ')';
	        }
	      }
	    }
	  }
	  return null;
	}

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	exports.isElement = isElement;
	/**
	 * Determines if the passed el is a DOM element
	 */
	function isElement(el) {
	  var isElem = void 0;

	  if ((typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === 'object') {
	    isElem = el instanceof HTMLElement;
	  } else {
	    isElem = !!el && (typeof el === 'undefined' ? 'undefined' : _typeof(el)) === 'object' && el.nodeType === 1 && typeof el.nodeName === 'string';
	  }
	  return isElem;
	}

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getTag = getTag;
	/**
	 * Returns the Tag of the element
	 * @param  { Object } element
	 * @return { String }
	 */
	function getTag(el) {
	  return el.tagName.toLowerCase();
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isUnique = isUnique;
	/**
	 * Checks if the selector is unique
	 * @param  { Object } element
	 * @param  { String } selector
	 * @return { Array }
	 */
	function isUnique(el, selector) {
	  if (!Boolean(selector)) return false;
	  var elems = el.ownerDocument.querySelectorAll(selector);
	  return elems.length === 1 && elems[0] === el;
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getParents = getParents;

	var _isElement = __webpack_require__(6);

	/**
	 * Returns all the element and all of its parents
	 * @param { DOM Element }
	 * @return { Array of DOM elements }
	 */
	function getParents(el) {
	  var parents = [];
	  var currentElement = el;
	  while ((0, _isElement.isElement)(currentElement)) {
	    parents.push(currentElement);
	    currentElement = currentElement.parentNode;
	  }

	  return parents;
	}

/***/ }
/******/ ])
});
;