;(function ($, window, document, undefined) {
  'use strict';

  // TODO: define events hash

  $.fn.swipe = swipe;

  function swipe() {
    return this.each(function (i, el) {
      var startX, startY, $el = $(el);
      var SWIPE_DISTANCE = 150;


      $el.on('mousedown', start);

      function start(e) {
        e.preventDefault();

        startX = e.pageX;
        startY = e.pageY;
        $el.on('mousemove', move);
        $el.on('mouseup', end);
      }

      function move(e) {
        var deltaX = e.pageX - startY,
            deltaY = e.pageX - startY;

        if (deltaX >= SWIPE_DISTANCE) {
          $el.trigger("swipeLeft");
        }
        if (deltaX <= -SWIPE_DISTANCE) {
          $el.trigger("swipeRight");
        }
        if (deltaY >= SWIPE_DISTANCE) {
          $el.trigger("swipeUp");
        }
        if (deltaY <= -SWIPE_DISTANCE) {
          $el.trigger("swipeDown");
        }

        if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
          $el.off('mousemove');
          $el.off('mouseup');
        }
      }

      function end(e) {
        e.preventDefault();
        $el.off('mousemove');
      }
    })
  }
})(jQuery, window, document);