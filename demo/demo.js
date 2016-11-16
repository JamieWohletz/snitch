(function (window) {
  var eventArea = document.getElementById('event-area');
  var eventLog = document.getElementById('event-log');
  var errorLog = document.getElementById('error-log');
  window.throwRandomError = function () {
    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min;
    }
    var errorConstructors = [ReferenceError, TypeError, RangeError, SyntaxError];
    var ErrorConstructor = errorConstructors[getRandomInt(0, errorConstructors.length)];
    throw new ErrorConstructor('Oops, this button threw an error!');
  };

  function listItem(text) {
    var li = document.createElement('li');
    li.innerHTML = text;
    return li;
  }

  snitch.onInteraction(eventArea, function (normalized) {
    var li = listItem([
      normalized.type,
      ' at ',
      normalized.timestamp.toLocaleTimeString(),
      '; data = ',
      JSON.stringify(normalized.data)
    ].join(''));
    eventLog.appendChild(li);
  }, { maskClass: 'mask' });

  snitch.onError(function (normalized) {
    var li = listItem([
      '"',
      normalized.data.message,
      '"', 
      ' at ', 
      normalized.timestamp.toLocaleTimeString(),
      '; ',
      normalized.data.fileName,
      ':',
      normalized.data.lineNumber,
      ':',
      normalized.data.columnNumber
    ].join(''));
    errorLog.appendChild(li); 
  });
} (window));