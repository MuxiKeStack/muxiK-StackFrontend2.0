Component({
  properties: {
    // guanfangbanben | tiwen | comment | like | wechat | yanjing | yanjing1 | xiaxue
    name: {
      type: String,
    },
    // string | string[]
    color: {
      type: null,
      observer: function (color) {
        this.setData({
          isStr: typeof color === 'string',
        });
      },
    },
    size: {
      type: Number,
      value: 18,
      observer: function (size) {
        this.setData({
          svgSize: size,
        });
      },
    },
  },
  data: {
    svgSize: 18,
    quot: '"',
    isStr: true,
  },
});
