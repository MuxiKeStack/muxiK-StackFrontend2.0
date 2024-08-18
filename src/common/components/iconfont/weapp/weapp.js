Component({
  properties: {
    // lujing | a-zu200 | kejianxing-bukejian | kejianxing-kejian | wenhaoxiao | touxiang | weitongguo | yitongguo | iconfontdianhua | iconfontdianhua-copy | dingxiang | kaiguan-kai | nvsheng-copy | boy | a-zu81 | a-rongqi8 | a-rongqi10 | a-rongqi1 | a-rongqi5 | a-rongqi7 | a-rongqi3 | a-rongqi6 | a-rongqi9 | a-rongqi4 | a-rongqi2 | wxbpinpaibao | huo | club | fabu | icon | wodeqianbao | wodedingdan | tuiguang | zhaopian | tuiguanghuodong | sousuo | xiaoxi | icon-cutting-edgewe | pinpai | renshu | tiyuyundong | wode | renshu1 | shouye | chuqin | dengji | wh-hdjm | huodongjilu | rili | xuexijiaoliu | zongrenshu | index-active | yaoqingruzhu | shangdian | huodongrili | yaoqingruzhu1 | s-report | a-xinxitixing | shangjiaruzhu | a-bianzu283x | xiaoyouquan | julebu-mian | guanggaohuodongbaogao
    name: {
      type: String,
    },
    // string | string[]
    color: {
      type: null,
      observer: function (color) {
        this.setData({
          colors: this.fixColor(),
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
    colors: '',
    svgSize: 18,
    quot: '"',
    isStr: true,
  },
  methods: {
    fixColor: function () {
      var color = this.data.color;
      var hex2rgb = this.hex2rgb;

      if (typeof color === 'string') {
        return color.indexOf('#') === 0 ? hex2rgb(color) : color;
      }

      return color.map(function (item) {
        return item.indexOf('#') === 0 ? hex2rgb(item) : item;
      });
    },
    hex2rgb: function (hex) {
      var rgb = [];

      hex = hex.substr(1);

      if (hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
      }

      hex.replace(/../g, function (color) {
        rgb.push(parseInt(color, 0x10));
        return color;
      });

      return 'rgb(' + rgb.join(',') + ')';
    },
  },
});
