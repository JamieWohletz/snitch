describe('snitch', function () {
  afterEach(function() {
    document.body.innerHTML = '';
  });

  function assertNormalized(obj) {
    assert.isObject(obj, 'return value is an object');
    assert.isString(obj.type, 'return object has a `type` property which is a string');
    assert.isString(obj.target, 'return object has a `target` property which is a string');
    assert.instanceOf(obj.timestamp, Date, 'return object has a `timestamp` property which is a Date');
    assert.isObject(obj.data, 'return object has a `data` object property');
  }
  describe('normalize()', function () {
    it('should return an object which can be stringified', function () {
      assert.equal(typeof snitch.normalize(new Event('keydown')), 'object');
      assert.equal(typeof JSON.stringify(snitch.normalize(new Event('keydown'))), 'string');
    });
    it('returns a stub object if falsy value passed', function () {
      assertNormalized(snitch.normalize(null));
      assertNormalized(snitch.normalize());
      assertNormalized(snitch.normalize(false));
      assertNormalized(snitch.normalize(''));
    });
    it('converts non-object parameters to empty objects', function () {
      assertNormalized(snitch.normalize(352));
      assertNormalized(snitch.normalize('ha ha ha'));
      assertNormalized(snitch.normalize(TypeError));
      assertNormalized(snitch.normalize(true));
    });
    it('works with Event instances', function () {
      var event = new Event('keydown');
      var ret = snitch.normalize(event);
      assertNormalized(snitch.normalize(event));
      delete ret.timestamp;
      assert.deepEqual(ret, {
        type: 'keydown',
        target: '',
        data: {}
      });
    });
    it('works with KeyboardEvent instances', function () {
      var event = new KeyboardEvent('keydown', {
        key: 'ArrowDown'
      });
      var ret = snitch.normalize(event);
      assertNormalized(snitch.normalize(event));
      delete ret.timestamp;
      assert.deepEqual(ret, {
        type: 'keydown',
        target: '',
        data: {
          key: 'ArrowDown'
        }
      });
    });
    it('works with MouseEvent instances', function () {
      var data = {
        clientX: 5,
        clientY: 5
      };
      var event = new MouseEvent('mousedown', data);
      var ret = snitch.normalize(event);
      assertNormalized(ret);
      delete ret.timestamp;
      assert.deepEqual(ret, {
        type: 'mousedown',
        target: '',
        data: {
          clientX: data.clientX,
          clientY: data.clientY
        }
      });
    });
    it('works with WheelEvent instances', function () {
      var data = {
        deltaX: 5,
        deltaY: 5,
        deltaZ: 5
      };
      var event = new WheelEvent('wheel', data);
      var ret = snitch.normalize(event);
      assertNormalized(ret);
      delete ret.timestamp;
      assert.deepEqual(ret, {
        type: 'wheel',
        target: '',
        data: data
      });
    });
  });
  describe('onError()', function () {
    it('listens for error events', function (done) {
      var handler = snitch.onError(document.body, function (normalized, error) {
        assertNormalized(normalized);
        done();
      });
      document.body.dispatchEvent(new ErrorEvent('error'));
    });
    it('returns an event handler function', function () {
      assert.isFunction(snitch.onError(function () { }));
    });
    it('returns a handler which receives the normalized error and the ErrorEvent and is bound to the ErrorEvent', function() {
      var handler = snitch.onError(function(norm, err) {
        assertNormalized(norm);
        assert.instanceOf(err, ErrorEvent);
        assert.instanceOf(this, ErrorEvent);
      });
      handler(new ErrorEvent('error'));
    });
    it('defaults to window if no target is given', function () {
      assert.doesNotThrow(snitch.onError.bind(snitch, function () { }), TypeError);
    });
    it('gives detailed error information', function (done) {
      var errEvt = {
        message: 'Oops!',
        filename: 'fakefile.js',
        lineno: 5,
        colno: 5,
        error: new TypeError()
      };
      var handler = snitch.onError(document.body, function (normalized, error) {
        assertNormalized(normalized);
        delete normalized.timestamp;
        assert.deepEqual(normalized, {
          type: 'error',
          target: 'body',
          data: {
            message: errEvt.message,
            fileName: errEvt.filename,
            lineNumber: errEvt.lineno,
            columnNumber: errEvt.colno,
            stackTrace: errEvt.error.stack
          }
        });
        done();
      });
      document.body.dispatchEvent(new ErrorEvent('error', errEvt));
    });
  });

  describe('offError()', function () {
    it('expects the handler to be a function.', function () {
      assert.throws(snitch.offError.bind(snitch, window, 'string'), TypeError);
      assert.throws(snitch.offError.bind(snitch, window, {}), TypeError);
      assert.throws(snitch.offError.bind(snitch, window, null), TypeError);
      assert.throws(snitch.offError.bind(snitch, window, 343), TypeError);
    });
    it('expects target, if provided, to be an instance of EventTarget', function () {
      assert.throws(snitch.offError.bind(snitch, 'string', function () { }), TypeError);
      assert.throws(snitch.offError.bind(snitch, null, function () { }), TypeError);
      assert.throws(snitch.offError.bind(snitch, 325, function () { }), TypeError);
      assert.throws(snitch.offError.bind(snitch, {}, function () { }), TypeError);
    });
    it('defaults target to window', function () {
      assert.doesNotThrow(snitch.offError.bind(snitch, function () { }), TypeError);
    });
  });

  describe('onInteraction()', function () {
    it('returns an event handler', function () {
      assert.isFunction(snitch.onInteraction(document.createDocumentFragment(), function () { }));
    });
    it('responds to keydown, mousedown, dblclick, and wheel', function (done) {
      var count = 0;
      var handler = snitch.onInteraction(document.body, function (normalized) {
        assertNormalized(normalized);
        count += 1;
        if (count === 4) {
          snitch.offInteraction(document.body, handler);
          done();
        }
      });
      document.body.dispatchEvent(new UIEvent('keydown'));
      document.body.dispatchEvent(new UIEvent('mousedown'));
      document.body.dispatchEvent(new UIEvent('dblclick'));
      document.body.dispatchEvent(new UIEvent('wheel'));
    });
    it('can mask event data on elements with a given class', function(done) {
      var maskClass = 'masked';
      var maskedInput = document.createElement('input');
      maskedInput.classList.add(maskClass);
      document.body.appendChild(maskedInput);
      var handler = snitch.onInteraction(maskedInput, function (normalized) {
        assert.deepEqual(normalized.data, {
          key: 'X'
        });
        snitch.offInteraction(maskedInput, handler);
        done();
      }, { maskClass: maskClass });
      maskedInput.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'a'
      }));
    });
    it('detects events on child elements', function(done) {
      var child = document.createElement('input');
      var parent = document.createElement('span');
      var grandParent = document.createElement('div');
      parent.appendChild(child);
      grandParent.appendChild(parent);
      document.body.appendChild(grandParent);

      var handler = snitch.onInteraction(grandParent, function(normalized) {
        assert.equal(normalized.target, 'input');
        snitch.offInteraction(grandParent, handler);
        done();
      });
      child.dispatchEvent(new KeyboardEvent('keydown', { 
        key: 'a',
        bubbles: true 
      }));
    });
    it('gives key for keydown events', function (done) {
      var handler = snitch.onInteraction(document.body, function (normalized) {
        assertNormalized(normalized);
        delete normalized.timestamp;
        assert.deepEqual(normalized, {
          type: 'keydown',
          target: 'body',
          data: {
            key: 'ArrowDown'
          }
        });
        snitch.offInteraction(document.body, handler);
        done();
      });
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });
    it('gives x and y for mousedown events', function (done) {
      var coords = {
        clientX: 5,
        clientY: 5
      };
      var handler = snitch.onInteraction(document.body, function (normalized) {
        assertNormalized(normalized);
        delete normalized.timestamp;
        assert.deepEqual(normalized, {
          type: 'mousedown',
          target: 'body',
          data: coords
        });
        snitch.offInteraction(document.body, handler);
        done();
      });
      document.body.dispatchEvent(new MouseEvent('mousedown', {
        clientX: coords.clientX,
        clientY: coords.clientY
      }));
    });
    it('gives deltas for wheel events', function (done) {
      var deltas = {
        deltaX: 5,
        deltaY: 5,
        deltaZ: 5
      };
      var handler = snitch.onInteraction(document.body, function (normalized) {
        assertNormalized(normalized);
        delete normalized.timestamp;
        assert.deepEqual(normalized, {
          type: 'wheel',
          target: 'body',
          data: deltas
        });
        snitch.offInteraction(document.body, handler);
        done();
      });
      document.body.dispatchEvent(new WheelEvent('wheel', deltas));
    });

    it('throws TypeErrors for invalid parameters', function() {
      assert.throws(snitch.onInteraction.bind(snitch, null), TypeError);
      assert.throws(snitch.onInteraction.bind(snitch, document.body), TypeError);
      assert.throws(snitch.onInteraction.bind(snitch, null, null), TypeError);
      assert.throws(snitch.onInteraction.bind(snitch, 46, 234), TypeError);
      assert.throws(snitch.onInteraction.bind(snitch, 'string', 'wut'), TypeError);
      assert.throws(snitch.onInteraction.bind(snitch, document.body, undefined), TypeError);
      assert.throws(snitch.onInteraction.bind(snitch, null, function(){}), TypeError);
    });

    it('returns a handler which is passed the normalized event and the event and is bound to the event', function() {
      var handler = snitch.onInteraction(document.body, function(norm, e) {
        assertNormalized(norm);
        assert.instanceOf(e, Event); 
        assert.instanceOf(this, Event);
        snitch.offInteraction(document.body, handler);
      });
      handler(new Event('mousedown'));
    });
  });

  describe('offInteraction()', function() {
    it('throws TypeErrors for invalid parameters', function() {
      assert.throws(snitch.offInteraction.bind(snitch, null), TypeError);
      assert.throws(snitch.offInteraction.bind(snitch, document.body), TypeError);
      assert.throws(snitch.offInteraction.bind(snitch, {}, 352), TypeError);
      assert.throws(snitch.offInteraction.bind(snitch, 'string', function(){}), TypeError);
    });
    it('requires that target be an EventTarget and handler be a function', function(){
      assert.doesNotThrow(snitch.offInteraction.bind(snitch, document.body, function(){}));
    });
  });
});
