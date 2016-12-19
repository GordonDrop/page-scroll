;(function ($, window, document, undefined) {
  'use strict';

  // DO i need it? check on testing
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

  var SWIPE_EVENT = 'swipe.' + pluginName;
  var CLICK_EVENT = 'click.' + pluginName;
  var SCROLL_EVENT = 'scroll.' + pluginName;

  var SCROLLABLE_CLASS = 'page-scroll-scrollable';
  var SWIPABLE_CLASS = 'page-scroll-swipeable';

  var ANIMATION_TIMEOUT = 600, SCROLL_DELAY = helpers.isMac() ? 600 : 0;

  var SECTION_TEMPLATE =
    '<section class="page-scroll-section baron baron__root baron__clipper _macosx">' +
      '<div class="baron__scroller">' +
        '<div class="container page"></div>' +
      '</div>' +

      '<div class="baron__track">' +
        '<div class="baron__free">' +
          '<div class="baron__bar"></div>' +
        '</div>' +
      '</div>' +
    '</section>';

  var SECTION_CLASS = 'page-scroll-section';

  var BARON_CONFIG = {
    root: '.baron',
    scroller: '.baron__scroller',
    bar: '.baron__bar',
    scrollingCls: '_scrolling'
  };

  var BARON_CONTROLS_CONFIG = {
    track: '.baron__track'
  };

  // The actual plugin constructor
  function Plugin(el, options) {
    this.$el = $(el);
    this.$body = $('body');
    this.$win = $(window);
    this.$pages = this.$el.find('.page');

    // this.settings = $.extend({}, defaults, options);

    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function () {
      this.activeId = 0;
      this.vpHeight =  window.innerHeight ? window.innerHeight : this.$win.height(); // iOS workaround
      this.lastAnimationTimeStart = 0;
      this.lastScrollPoistion = 0;

      this.buildHTML();
      this.buildNav();
      this.bindEvents();
    },

    buildHTML: function () {
      this.$body.css({'overflow': 'hidden'});

      this.$el.addClass('page-scroll-container');
      this.addAnimation();

      this.buildSections();
      this.initSections();

      this.$sections
        .baron(BARON_CONFIG);
    },

    buildSections: function () {
      this.$pages.each(function (_i, page) {
        var sectionNode = $(SECTION_TEMPLATE),
          content = $(page).html();

        sectionNode.find('.page')
          .addClass($(page).attr('class'))
          .html(content);

        $(page).replaceWith(sectionNode);
      }, this);

      this.$sections = $('.page-scroll-section');
    },

    initSections: function () {
      this.$sections.each(function (i, section) {
        var $section = $(section);
        var sectionClass = $section.find('.page').height() > this.vpHeight ? SCROLLABLE_CLASS : SWIPABLE_CLASS;

        $section
          .addClass(sectionClass)
          .css({ 'height': this.vpHeight + 'px' })
          .attr('data-section-id', i);
      }.bind(this));
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

    bindEvents: function() {
      this.bindNavEvents();
      this.$win.on('resize', this.resizeHandler.bind(this));
      this.$nav.find('.page-scroll-nav-link').on(CLICK_EVENT, this.navHandler.bind(this));
    },

    bindNavEvents: function () {
      this.$el.find('.' + SWIPABLE_CLASS).on(WHEEL_EVENTS, this.scrollHandler.bind(this));
      this.$el.find('.' + SWIPABLE_CLASS).on(SWIPE_EVENT, this.scrollHandler.bind(this));
      this.$el.find('.' + SCROLLABLE_CLASS + ' .baron__scroller').on(SCROLL_EVENT, this.sectionScrollHandler.bind(this));
    },

    unbindNavEvents: function () {
      this.$el.find('.' + SWIPABLE_CLASS).off(WHEEL_EVENTS);
      this.$el.find('.' + SWIPABLE_CLASS).off(SWIPE_EVENT);
      this.$el.find('.' + SCROLLABLE_CLASS + ' .baron__scroller').off(SCROLL_EVENT);
    },

    scrollHandler: function (e) {
      var wheelDelta = (e.originalEvent && e.originalEvent.deltaY) || e.swipeDeltaY,
          dir = this.getWheelDirection(wheelDelta),
          nextId;

      if (this.isEdge(dir) || this.animationInProgress()) return;

      this.lastAnimationTimeStart = Date.now();
      nextId = dir === 'up' ? this.activeId - 1 : this.activeId + 1;

      this.moveTo(nextId);
    },

    sectionScrollHandler: function (e) {
      var activePage = e.target,
          dir = this.getScrollDirection(activePage.scrollTop),
          nextId;

      if (this.animationInProgress()) return;
      if (this.isSectionEdge(dir) && !this.isEdge(dir)) {
        this.lastAnimationTimeStart = Date.now();
        nextId = dir === 'up' ? this.activeId - 1 : this.activeId + 1;
        this.moveTo(nextId);
      }
    },

    navHandler: function (e) {
      if (!$(e.target).is('a')) return;

      e.preventDefault();
      var id = parseInt($(e.target).attr('data-section-id'));

      this.moveTo(id);
    },

    resizeHandler: function (e) {
      this.unbindNavEvents();

      this.vpHeight =  window.innerHeight ? window.innerHeight : this.$win.height(); // iOS workaround
      this.$sections.removeClass([SCROLLABLE_CLASS, SWIPABLE_CLASS].join(' '));

      this.initSections();
      this.bindNavEvents();
      this.removeAnimation();
      this.moveTo(this.activeId);

      setTimeout(this.addAnimation.bind(this), 0);
    },

    getWheelDirection: function (wheelDelta) {
      if (wheelDelta > 0) return 'down';
      if (wheelDelta < 0) return 'up';
    },

    addAnimation: function () {
      this.$el.css({ 'transition': 'all ' + ANIMATION_TIMEOUT + 'ms ease' });
    },

    removeAnimation: function () {
      this.$el.css({ 'transition': 'none' });
    },

    getScrollDirection: function (scrollPosition) {
      var dir;
      if (this.lastScrollPoistion > scrollPosition) {
        dir = 'up';
      } else {
        dir = 'down';
      }
      this.lastScrollPoistion = scrollPosition;
      return dir;
    },

    moveTo: function (id) {
      this.activeId = id;

      var newPosition = this.vpHeight * this.activeId;
      this.$el.css({
        'transform': 'translate3d(0px, -' + newPosition + 'px, 0px)'
      });

      this.$nav.find('.active').removeClass('active');
      this.$nav.find('[data-section-id=' + this.activeId  + ']').addClass('active');
    },

    animationInProgress: function () {
      // WORKAROUND: SCROLL_DELAY added to prevent double scroll on mac trackpads
      return (Date.now() - this.lastAnimationTimeStart) <= ANIMATION_TIMEOUT + SCROLL_DELAY;
    },

    isSectionEdge: function (dir) {
      var active = this.getActiveSection().find('.baron__scroller')[0];

      return (dir === 'down' && active.scrollTop === (active.scrollHeight - active.offsetHeight)) ||
        (dir === 'up' && active.scrollTop === 0);
    },

    isEdge: function (dir) {
      return (dir === 'up' && this.activeId === 0) ||
             (dir ==='down' && this.activeId === (this.$pages.length - 1));
    },

    getActiveSection: function () {
      return this.$el.find('[data-section-id="' + this.activeId + '"]');
    }
  });

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if ($.data(this, pluginName)) return;

      $.data(this, pluginName, new Plugin(this, options));
    });
  };

})(jQuery, window, document);