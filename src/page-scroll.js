;(function ($, window, document, undefined) {
  'use strict';

  // TODO: responsiveness and normal scroll elements
  // TODO: mobile support
  // TODO: - webpack it
  // TODO: add settings

  var helpers = {
    isMac: function () {
      return navigator.platform.toUpperCase().indexOf('MAC')>=0;
    }
  };

  var pluginName = 'pageScroll',
      defaults = {};

  var WHEEL_EVENTS = [
    'mousewheel.' + pluginName,
    'DOMMouseScroll.' + pluginName,
    'MozMousePixelScroll.' + pluginName
  ].join(',');

  var ANIMATION_TIMEOUT = 600, SCROLL_DELAY = helpers.isMac() ? 600 : 0;

  // The actual plugin constructor
  function Plugin(el, options) {
    this.$el = $(el);
    this.$body = $('body');
    this.$doc = $(document);
    this.$win = $(window);
    this.$pages = this.$el.find('.page');

    // this.settings = $.extend({}, defaults, options);

    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function () {
      this.activeId = 0;
      this.$activeSection = $('[data-section-id="' + this.activeId + '"');
      this.vpHeight = this.$win.height();
      this.lastAnimationTimeStart = 0;

      this.buildHTML();
      this.buildNav();
      this.bindEvents();
    },

    buildHTML: function () {
      var plugin = this;

      this.$body.css({'overflow': 'hidden'});

      this.$el.addClass('page-scroll-container');
      this.$el.css({ 'transition': 'all ' + ANIMATION_TIMEOUT + 'ms ease' });

      this.$pages.each(function (i, page) {
        $(page)
          .css({'min-height': this.vpHeight})
          .attr('data-section-id', i);

        if ($(page).height() > plugin.vpHeight) {
          $(page).addClass('scrollable');
        }
      }.bind(this));

      this.$pages
        .wrap('<div class="page-scroll-section">');

      this.$sections = $('.page-scroll-section');
      this.$sections.css({ 'height': this.vpHeight + 'px' });
    },

    buildNav: function () {
      var plugin = this;
      this.$nav = $('<ul class="page-scroll-nav">');
      this.$pages.each(function (i) {
        var navItem = $('<li class="page-scroll-nav-item">');
        var navLink = $('<a class="page-scroll-nav-link">');
        navLink
          .attr('data-section-id', i)
          .text('Section ' + ++i);

        navItem.append(navLink);
        plugin.$nav.append(navItem);
      });

      this.$nav.find('a').first().addClass('active');
      this.$body.append(this.$nav);
    },

    bindEvents: function () {
      this.$doc.on(WHEEL_EVENTS, this.scrollHandler.bind(this));
      this.$el.swipeEvents().on('swipe', this.scrollHandler.bind(this));
      this.$nav.find('.page-scroll-nav-link').on('click', this.navHandler.bind(this))
    },

    scrollHandler: function (e) {
      var wheelDelta = (e.originalEvent && e.originalEvent.deltaY) || e.swipeDeltaY,
          dir = this.getDirection(wheelDelta),
          idToMove;

      if (this.isEdge(dir) || this.animationInProgress()) return;

      this.lastAnimationTimeStart = Date.now();
      idToMove = dir === 'up' ? this.activeId - 1 : this.activeId + 1;
      this.moveTo(idToMove);
    },

    navHandler: function (e) {
      if (!$(e.target).is('a')) return;

      e.preventDefault();
      var id = parseInt($(e.target).attr('data-section-id'));
      this.moveTo(id);

      this.$nav.find('.active').removeClass('active');
      this.$activeSection.addClass('active');
    },

    getDirection: function (wheelDelta) {
      if (wheelDelta > 0) return 'down';
      if (wheelDelta < 0) return 'up';
    },

    moveTo: function (id) {
      this.activeId = id;
      this.$activeSection = $('[data-section-id="' + this.activeId + '"]');

      var newPosition = this.vpHeight * this.activeId;
      this.$el.css({
        'transform': 'translate3d(0px, -' + newPosition + 'px, 0px)'
      });

      this.$nav.find('.active').removeClass('active');
      this.$activeSection.addClass('active');
    },

    animationInProgress: function () {
      // WORKAROUND: SCROLL_DELAY added to prevent double scroll on mac trackpads
      return (Date.now() - this.lastAnimationTimeStart) <= ANIMATION_TIMEOUT + SCROLL_DELAY;
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