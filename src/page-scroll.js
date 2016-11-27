;(function ($, window, document, undefined) {
  'use strict';

  var pluginName = 'pageScroll',
    defaults = {};

  // The actual plugin constructor
  function Plugin(el, options) {
    this.$el = el;

    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function () {
      console.log('init');
    }
  });

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) return;

      $.data(this, "plugin_" + pluginName, new Plugin(this, options));
    });
  };

})(jQuery, window, document);