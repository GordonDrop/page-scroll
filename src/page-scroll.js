;(function ($, window, document, undefined) {
  'use strict';

  var pluginName = 'pageScroll',
    defaults = {};

  var WHEEL_EVENTS = [
    'mousewheel.' + pluginName,
    'DOMMouseScroll.' + pluginName,
    'MozMousePixelScroll.' + pluginName
  ].join(',');

  var TIMEOUT = 600, SCROLL_DELAY = 600;

  // The actual plugin constructor
  function Plugin(el, options) {
    this.$el = $(el);
    this.$body = $('body');
    this.$doc = $(document);
    this.$win = $(window);
    this.$pages = this.$el.find('.page');

    // TODO: add settings uncomment
    // this.settings = $.extend({}, defaults, options);

    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function () {
      this.activeId = 0;
      this.activeSectionPosition = 0;
      this.$activeSection = $('[data-section-id="' + this.activeId + '"');
      this.vpHeight = this.$win.height();
      this.lastAnimationTimeStart = null;

      this.buildHTML();
      this.bindEvents();
    },

    buildHTML: function () {
      var plugin = this;

      this.$body.css({
        'overflow': 'hidden',
        'height': '100%'
      });

      this.$el.addClass('page-scroll-container');
      this.$el.css({ 'transition': 'all ' + TIMEOUT + 'ms ease' });

      this.$pages.each(function (i, page) {
        $(page).attr('data-section-id', i);

        if ($(page).height() > plugin.vpHeight) {
          $(page).addClass('scrollable');
        }
      });

      this.$pages
        .wrap('<div class="page-scroll-section">');

      this.$sections = $('.page-scroll-section');
      this.$sections.css({ 'height': this.vpHeight + 'px' });
    },

    bindEvents: function () {
      this.$doc.on('wheel', this.handler.bind(this));
    },

    unbindEvents: function () {
      this.$doc.off(WHEEL_EVENTS);
    },

    handler: function (e) {
      var wheelDelta = e.originalEvent.deltaY;
      var dir = this.getDirection(wheelDelta);

      if (this.isEdge(dir) || this.animationInProgress()) return;

      this.lastAnimationTimeStart = Date.now();
      this.navigate(dir);
      this.setActive(dir);
    },

    getDirection: function (wheelDelta) {
      if (wheelDelta > 0) return 'down';
      if (wheelDelta < 0) return 'up';
    },

    navigate: function (dir) {
      this.activeSectionPosition = dir === 'down' ? (
        this.activeSectionPosition + this.vpHeight
      ) : (
        this.activeSectionPosition - this.vpHeight
      );

      this.$el.css({
        'transform': 'translate3d(0px, -' + this.activeSectionPosition + 'px, 0px)'
      });
    },

    setActive: function (dir) {
      dir === 'down' ? (
        this.activeId++
      ) : (
        this.activeId--
      );
    },

    animationInProgress: function () {
      // WORKAROUND: SCROLL_DELAY added to prevent double scroll on mac trackpads
      return !this.lastAnimationTimeStart ||
             (Date.now() - this.lastAnimationTimeStart) <= TIMEOUT + SCROLL_DELAY;
    },

    isEdge: function (dir) {
      return (dir === 'up' && this.activeId === 0) ||
             (dir ==='down' && this.activeId === (this.$pages.length - 1));
    }
  });

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if ($.data(this, pluginName)) return;

      $.data(this, pluginName, new Plugin(this, options));
    });
  };

})(jQuery, window, document);