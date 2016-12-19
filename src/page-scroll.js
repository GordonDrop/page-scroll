;(function ($, window, document, undefined) {
  'use strict';

  // TODO: responsiveness and normal scroll elements
  // TODO: mobile support
  // TODO: - webpack it
  // TODO: add settings

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

  var SCROLLABLE_CLASS = 'page-scroll-scrollable';
  var SWIPABLE_CLASS = 'page-scroll-swipeable';

  var ANIMATION_TIMEOUT = 600, SCROLL_DELAY = helpers.isMac() ? 600 : 0;

  var SECTION_TEMPLATE =
    '<section class="page-scroll-section baron baron__root baron__clipper _macosx">' +
      '<div class="baron__scroller page">' +
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
    scrollingCls: '_scrolling',
    draggingCls: '_dragging'
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
      this.vpHeight = this.$win.height();
      this.lastAnimationTimeStart = 0;
      this.lastScrollPoistion = 0;

      this.buildHTML();
      this.buildNav();
      this.bindEvents();
    },

    buildHTML: function () {
      var plugin = this;

      this.$body.css({'overflow': 'hidden'});

      this.$el.addClass('page-scroll-container');
      this.$el.css({ 'transition': 'all ' + ANIMATION_TIMEOUT + 'ms ease' });

      this.$pages.each(function (_i, page) {
        var sectionNode = $(SECTION_TEMPLATE),
            content = $(page).html();

        sectionNode.find('.page')
          .addClass($(page).attr('class'))
          .html(content);

        $(page).replaceWith(sectionNode);
      }, this);

      this.$sections = $('.page-scroll-section');

      this.$sections.each(function (i, section) {
        var $section = $(section);
        var sectionClass = $section.height() > plugin.vpHeight ? SCROLLABLE_CLASS : SWIPABLE_CLASS;

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

    bindEvents: function () {
      this.$el.find('.' + SWIPABLE_CLASS).on(WHEEL_EVENTS, this.scrollHandler.bind(this));
      this.$el.find('.' + SWIPABLE_CLASS).on('swipe', this.scrollHandler.bind(this));
      this.$el.find('.' + SCROLLABLE_CLASS).on('scroll', this.sectionScrollHandler.bind(this));
      this.$nav.find('.page-scroll-nav-link').on('click', this.navHandler.bind(this))
    },

    unbindEvents: function () {

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

    sectionScrollHandler: function () {
      var active = this.getActiveSection(),
          dir = this.getScrollDirection(active[0].scrollTop),
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

    getWheelDirection: function (wheelDelta) {
      if (wheelDelta > 0) return 'down';
      if (wheelDelta < 0) return 'up';
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
      var active = this.getActiveSection();
      return (dir === 'down' && active[0].scrollTop ===
        (active[0].scrollHeight - active.height())) ||
        (dir === 'up' && active[0].scrollTop === 0);
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