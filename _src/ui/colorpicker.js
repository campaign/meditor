(function ($, ui) {
    var COLORS = (
            'ffffff,000000,eeece1,1f497d,4f81bd,c0504d,9bbb59,8064a2,4bacc6,f79646,' +
            'f2f2f2,7f7f7f,ddd9c3,c6d9f0,dbe5f1,f2dcdb,ebf1dd,e5e0ec,dbeef3,fdeada,' +
            'd8d8d8,595959,c4bd97,8db3e2,b8cce4,e5b9b7,d7e3bc,ccc1d9,b7dde8,fbd5b5,' +
            'bfbfbf,3f3f3f,938953,548dd4,95b3d7,d99694,c3d69b,b2a2c7,92cddc,fac08f,' +
            'a5a5a5,262626,494429,17365d,366092,953734,76923c,5f497a,31859b,e36c09,' +
            '7f7f7f,0c0c0c,1d1b10,0f243e,244061,632423,4f6128,3f3151,205867,974806,' +
            'c00000,ff0000,ffc000,ffff00,92d050,00b050,00b0f0,0070c0,002060,7030a0').split(',');

    function _initEvents(elem, fn, eventNS) {
        eventNS = eventNS || '';
        elem.parent().on('touchstart' + eventNS, function () {
            var offset = elem.offset(), onMove = function(e){
                e.preventDefault();
                e = e.touches ? e.touches[0] : e;
                fn.call(null, e, offset);
            };
            $(document).one('touchend' + eventNS,function () {
                $(document).off('touchmove', onMove);
            }).on('touchmove', onMove);
        });
        elem.on('click' + eventNS, function (e) {
            fn.call(null, e, elem.offset());
        });
    }

    ui.define('colorpicker', {
        _options:{
            value:'',
            title:'请选择你需要的颜色'
        },

        _init:function () {
            var me = this,
                opt = this._options,
                eventNS = '.' + this.id();

            me.$super('_init');
            me.hue = 0;
            me.saturation = 0;
            me.lightness = 0;

            _initEvents(me.hCanvas, function (e, offset) {
                var delta = e.pageY - offset.top,
                    hsl = me.hsl();
                hsl.h = 360 * Math.max(0, Math.min(1, delta / offset.height));
                me.hsl(hsl);
            }, eventNS);

            _initEvents(me.slCanvas, function (e, offset) {
                var deltaY = e.pageY - offset.top,
                    deltaX = e.pageX - offset.left,
                    hsl = me.hsl();

                hsl.s = Math.max(0, Math.min(1, deltaX / offset.width));
                hsl.l = Math.max(0, Math.min(1, deltaY / offset.height));
                me.hsl(hsl);
            }, eventNS);

            me.commonDiv.hammer({tap: true}).on('h_tap', 'td', function(e){
                var a = $('a', this);
                a.length && me.hex(a.attr('title'));
            });

            me.preview.on('click', '.clearBtn', function(){
                me.trigger('clearColor');
                me.close();
                me.hex('#FFFFFF');
            });

            me.value(me.color = (opt.value || '#FFFFFF'));
            me.on('confirm', function (e) {
                me.color = me.hex();
            });
        },

        _create:function () {
            var me = this,
                opt = me._options,
                preview = me.preview = $('<div class="preview">' +
                    '<div class="color"><span class="new"></span><span class="old"></span></div>' +
                    '<div class="text">' +
                        '<p>HEX: <span class="hex"></span></p>' +
                        '<p>RGB: <span class="rgb"></span></p>' +
                        '<p>HSL: <span class="hsl"></span></p>' +
                    '</div><div class="clearBtn">清除颜色</div>' +
                    '</div> ');

            me.tabs = ui.tabs({
                items:{
                    '常用颜色':me._createCommon(opt),
                    '自定义颜色':me._createAdvance(opt)
                },
                swipe: false
            }).on('animateComplete', function () {
                    me.refresh();
                });

            opt.content = me.tabs.root().addClass('mui-colorpicker');
            preview.insertAfter($('.mui-viewport', opt.content));
            this.oldV = $('.preview .old', preview);
            this.newV = $('.preview .new', preview);
            this.hexT = $('.preview .hex', preview);
            this.rgbT = $('.preview .rgb', preview);
            this.hslT = $('.preview .hsl', preview);

            return me.$super('_create');
        },

        _createCommon:function (opt) {
            var html = '<table cellspacing="0" cellpadding="0">', rows, rowIndex = 0, i, color, colors = COLORS.concat();

            html += '<tr class="title"><th colspan="10">主题颜色</th></tr>';
            do {
                rows = colors.splice(0, 10);
                html += '<tr class="the'+rowIndex+'throw">';
                for(i = 0; i< 10; i++){
                    html += '<td>';
                    color = rows[i];
                    html += color ? '<a title="#'+color+'" style="background:#'+color+'"></a>' : '&nbsp;';
                    html += '</td>';
                }
                html += '</tr>';
                if(rowIndex === 5){
                    html += '<tr class="title"><th colspan="10">标准颜色</th></tr>';
                }
                rowIndex ++;
            } while(colors.length);
            return this.commonDiv = $('<div class="mui-cp-common">'+html+'</div>');
        },

        _createAdvance:function (opt) {
            var div = this.advanceDiv = $('<div class="mui-cp-advance mui-watchrender"><div class="wheel-wrap">' +
                '<div class="slwheel"><canvas width="255" height="255"></canvas><span class="cursor"></span></div>' +
                '<div class="hwheel"><canvas width="19" height="255"></canvas><span class="cursor"></span></div>' +
                '</div>' +
                '</div>');

            this.hCanvas = $('.hwheel canvas', div);
            this.slCanvas = $('.slwheel canvas', div);
            return div;
        },

        _drawH:function () {
            var gradient, canvas, context, start, end, i;

            if (this.hDrawed)return;

            canvas = this.hCanvas.get(0);
            context = canvas.getContext('2d');
            start = canvas.offsetWidth / 2;
            end = canvas.offsetHeight;
            if (!end)return;

            gradient = context.createLinearGradient(start, 0, start, end);
            for (i = 0; i <= 1; i += 0.1) {
                gradient.addColorStop(i, "hsl(" + Math.round(i * 360) + ", 100%, 50%)");
            }
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.offsetWidth, end);

            this.hDrawed = true;
        },

        _drawSL:function () {
            var canvas, context, gradient, i, step, height, width;

            if (this.slDrawed)return;

            canvas = this.slCanvas.get(0);
            context = canvas.getContext('2d');
            height = canvas.offsetHeight;
            width = canvas.offsetWidth;
            if (!height)return;
            step = 1 / height;
            for (i = 0; i < 1; i += step) {
                gradient = context.createLinearGradient(0, height * i, width, height * (i + step));
                gradient.addColorStop(0, "hsl(" + this.hue + ", 0%, " + (i * 100) + "%)");
                gradient.addColorStop(0.5, "hsl(" + this.hue + ", 50%, " + (i * 100) + "%)");
                gradient.addColorStop(1, "hsl(" + this.hue + ", 100%, " + (i * 100) + "%)");
                context.fillStyle = gradient;
                context.fillRect(0, width * i, height, height * step);
            }
            this.slDrawed = true;
        },

        _updateHP:function () {
            var canvas = this.hCanvas.get(0),
                cursor = this.hCanvas.next('.cursor');

            cursor.css('top', this.hue * canvas.offsetHeight / 360 + 'px');
        },

        _updateSLP:function () {
            var canvas = this.slCanvas.get(0),
                cursor = this.slCanvas.next('.cursor');

            cursor.css({
                top:this.lightness * canvas.offsetHeight,
                left:this.saturation * canvas.offsetWidth
            });
        },

        refresh:function () {
            var args = $.slice(arguments), hex, rgb, hsl, round = Math.round;

            this._drawH();
            this._drawSL();
            this._updateHP();
            this._updateSLP();
            this.oldV.css('background-color', this.color);
            this.newV.css('background-color', hex = this.hex());
            this.hexT.text(hex);
            rgb = this.rgb();
            this.rgbT.text('rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')');
            hsl = this.hsl();
            this.hslT.text('hsl(' + round(hsl.h) + ', ' + round(hsl.s * 100) + '%, ' + round(hsl.l * 100) + '%)');

            args.unshift('refresh');
            return this.$super.apply(this, args);
        },

        hsl:function (val) {
            var setter = !$.isUndefined(val);
            if (setter) {
                val = clampHSL(val);
                val.h !== this.hue && (this.slDrawed = false);
                this.hue = val.h;
                this.saturation = val.s;
                this.lightness = val.l;
                this.refresh();
            } else {
                val = { h:this.hue, s:this.saturation, l:this.lightness};
            }
            return setter ? this : val;
        },

        rgb:function (val) {
            var setter = !$.isUndefined(val);
            return setter ? this.hsl(rgb2hsl(val)) : hsl2rgb(this.hsl());
        },

        hex:function (val) {
            var setter = !$.isUndefined(val);
            return setter ? this.hsl(rgb2hsl(hex2rgb(val))) : rgb2hex(hsl2rgb(this.hsl()));
        },

        value:function (val) {
            var setter = !$.isUndefined(val);
            if (setter) {
                this.format = typeof val === "string" ? "hex" : "h" in val ? "hsl" : "rgb";
                return this[this.format](val);
            }
            return this[this.format || 'hex']();
        }


    }, 'dialog');

    //utils
    function hsl2rgb(val) {
        var chroma, hprime, x, r1 = 0, g1 = 0, b1 = 0, m, ret, round = Math.round;

        ret = {};
        val = clampHSL(val);
        chroma = (1 - Math.abs(2 * val.l - 1)) * val.s;
        hprime = val.h / 60;
        x = chroma * (1 - Math.abs((hprime % 2) - 1));
        if (hprime < 1) {
            r1 = chroma;
            g1 = x;
            b1 = 0;
        }
        else if (hprime < 2) {
            r1 = x;
            g1 = chroma;
            b1 = 0
        }
        else if (hprime < 3) {
            r1 = 0;
            g1 = chroma;
            b1 = x;
        }
        else if (hprime < 4) {
            r1 = 0;
            g1 = x;
            b1 = chroma;
        }
        else if (hprime < 5) {
            r1 = x;
            g1 = 0;
            b1 = chroma;
        }
        else if (hprime < 6) {
            r1 = chroma;
            g1 = 0;
            b1 = x;
        }
        m = val.l - (0.5 * chroma);
        ret.r = round((r1 + m) * 255);
        ret.g = round((g1 + m) * 255);
        ret.b = round((b1 + m) * 255);
        return clampRGB(ret);
    }

    function rgb2hsl(val) {
        var normalizedRed, normalizedGreen, normalizedBlue, max, min, chroma, ret, hprime;

        val = clampRGB(val);
        ret = {};
        normalizedRed = val.r / 255.0;
        normalizedGreen = val.g / 255.0;
        normalizedBlue = val.b / 255.0;

        max = Math.max(normalizedRed, normalizedGreen, normalizedBlue);
        min = Math.min(normalizedRed, normalizedGreen, normalizedBlue);
        chroma = max - min;
        ret.l = (max + min) / 2;
        if (chroma == 0.0) {
            ret.s = 0;
            ret.h = 0;
        }
        else {
            if (max == normalizedRed) {
                hprime = ((normalizedGreen - normalizedBlue) / chroma) % 6;
            }
            else if (max == normalizedGreen) {
                hprime = ((normalizedBlue - normalizedRed) / chroma) + 2;
            }
            else {
                hprime = ((normalizedRed - normalizedGreen) / chroma) + 4;
            }
            ret.h = hprime * 60;
            ret.s = chroma / (1 - Math.abs(2 * ret.l - 1));
        }
        return clampHSL(ret);
    }

    function rgb2hex(r, g, b) {
        var ret;
        if (typeof r == 'object') {
            g = r.g;
            b = r.b;
            r = r.r;
        }
        if (r > 255 || g > 255 || b > 255 || r < 0 || g < 0 || b < 0)
            throw "Invalid color object";
        ret = ((r << 16) | (g << 8) | b).toString(16).toUpperCase();
        while(ret.length<6){
            ret = '0'+ret;
        }
        return '#' + ret;
    }

    function hex2rgb(hex) {
        var r, g, b;
        if (!/^#([a-z0-9]{2})([a-z0-9]{2})([a-z0-9]{2})$/i.test(hex)) {
            throw "Invalid color hex";
        }
        r = parseInt(RegExp.$1, 16);
        g = parseInt(RegExp.$2, 16);
        b = parseInt(RegExp.$3, 16);
        return {
            r:r,
            g:g,
            b:b
        }
    }


    function clampHSL(val) {
        val.h = Math.min(360, Math.max(0, val.h % 360));
        val.s = Math.min(1, Math.max(0, val.s));
        val.l = Math.min(1, Math.max(0, val.l));
        return val;
    }

    function clampRGB(val) {
        val.r = Math.min(255, Math.max(0, val.r));
        val.g = Math.min(255, Math.max(0, val.g));
        val.b = Math.min(255, Math.max(0, val.b));
        return val;
    }
})(Zepto, ME.ui);