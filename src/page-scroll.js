;(function ($, window, document, undefined) {
  'use strict';

  var pluginName = 'pageScroll',
    defaults = {};

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
    this.bindEvents();
  }

  $.extend(Plugin.prototype, {
    init: function () {
      var plugin = this;

      this.activePage = 0;
      this.vpHeight = this.$win.height();

      this.$body.css({
        'overflow': 'hidden',
        'height': '100%'
      });

      this.$el.addClass('page-scroll-section');

      this.$pages.each(function (i, page) {
        $(page).attr('data-id', i);

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

    }
  });

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if ($.data(this, pluginName)) return;

      $.data(this, pluginName, new Plugin(this, options));
    });
  };

})(jQuery, window, document);