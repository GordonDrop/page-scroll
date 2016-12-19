;(function ($, window, document, undefined) {
  'use strict';

  var pluginName = 'swipeEvents';
  var TOUCHSTART = 'touchstart.'  + pluginName,
      TOUCHEND = 'touchend.'  + pluginName,
      TOUCHMOVE = 'touchmove.'  + pluginName,
      TOUCHCANCEL = 'touchcancel.'  + pluginName;

  var abs = Math.abs;

  jQuery.event.special.swipe = {
    setup: function () {
      $(this)
        .on(TOUCHSTART, start)
        .on(TOUCHCANCEL, end)
        .on(TOUCHEND, end);
    },

    handle: function (event, data) {
      event.pageX = data.pageX;
      event.pageY = data.pageY;
      event.swipeDeltaX = data.swipeDeltaX;
      event.swipeDeltaY = data.swipeDeltaY;

      event.handleObj.handler.call(this, event);
    },

    remove: function () {
      $(this)
        .removeData('swipe')
        .off(TOUCHSTART)
        .off(TOUCHCANCEL)
        .off(TOUCHMOVE)
        .off(TOUCHEND);
    }
  };

  function start(e) {
    if (e.touches.length === 1) e.preventDefault();
    $(this).on(TOUCHMOVE, move);

    var touch = e.originalEvent.touches[0];

    $(this).data('swipe', {
      startX: touch.pageX,
      startY: touch.pageY
    });
  }

  function move(e) {
    var touch = e.originalEvent.changedTouches[0];
    var data = $(this).data('swipe');
    var deltaX = touch.pageX - data.startX,
        deltaY = touch.pageY - data.startY;

    if (abs(deltaY) > 0 || abs(deltaY) > 0) {
      $(this).triggerHandler('swipe', {
        pageX: touch.pageX,
        pageY: touch.pageY,
        swipeDeltaX: -deltaX,
        swipeDeltaY: -deltaY,
        originalEvent: e.originalEvent
      });
    }
  }

  function end(e) {
    e.preventDefault();
    $(this).off(TOUCHMOVE);
  }
})(jQuery, window, document);