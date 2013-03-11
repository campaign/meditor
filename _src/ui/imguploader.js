/**
 * Created with JetBrains PhpStorm.
 * User: zhoumeimei
 * Date: 13-3-7
 * Time: 下午12:56
 * To change this template use File | Settings | File Templates.
 */
(function ($, ui) {
    var id = 0;
    ui.define('imguploader', {
        _options: {
            url: '',
            content: '',
            type: {
                local: '本地上传',
                remote: '远程图片'
            },
            filter: function (files) {
                var fileArr = [], i, file;
                for (i = 0; file = files[i]; i++) {
                    if (file.type.indexOf("image") == 0 || (!file.type && /\.(?:jpg|png|gif)$/.test(file.name))) {
                        fileArr.push(file);
                    } else {
                        alert('请选择图片上传');
                    };
                }
                return fileArr;
            },
            select: null,
            progress: null,
            success: null,
            failure: null
        },
        _files: [],
        _create: function () {
            var me = this;

            !me.option('content') && (me.option('content', $('<div class="mui-imguploader-tabs"></div>').append((me._tabs = ui.tabs({
                items: me._createTab()
            })).root())));

            return me.$super('_create');
        },
        _init: function () {
            var me = this,
                opts = me._options;

            me.$super('_init');
            (me._$fileInput = opts.content.find('.mui-imguploader-ipt')).length && me._$fileInput.on('change', $.proxy(me._imgEventHandler, me)).attr('multiple', 'multiple'),
            me._$thumbnails = $('<div class="mui-imguploader-thumbnails"></div>');
            me._$uploadBtn = $('<button class="mui-imguploader-uploadBtn">上传</button>').on('click', $.proxy(me._imgEventHandler, me));
            me._$waiting = $('<div class="mui-imguploader-waiting">读取中...</div>');

            return me;
        },
        _createTab: function () {
            var me = this,
                opts = me._options,
                content = {};

            $.isObject(opts.type)&& $.each(opts.type,
                function (key, val) {
                    switch (key) {
                        case 'local':
                            content[val] = '<div class="mui-imguploader-iptWrap"><span class="mui-imguploader-add">添加图片</span><input class="mui-imguploader-ipt" type="file"/></div>';
                            break;
                        case 'remote':
                            break;
                    }
                });

            return content;
        },

        _imgEventHandler: function (e) {
            var me = this,
                target = e.target, thisFiles;

            switch (e.type) {
                case 'change':
                    me._$waiting.show().css('opacity', '1').appendTo(me._tabs._getPanel());
                    thisFiles = me.option('filter').call(me, target.files);
                    me._files = me._files.concat(thisFiles);
                    me._createThumbnails(thisFiles).trigger('select', [thisFiles]);
                    break;
                case 'click':
                    me._uploadFiles(me._files);
                    break;
            }
        },

        _createThumbnails: function (files) {
            var me = this,
                len = files.length;
            $.each(files, function (i, file) {
                var reader = new FileReader();
                file.id = id++;
                reader.onload = reader.onerror =function (e) {
                    me._renderThumbnail(e, i, len, file);
                };
                reader.readAsDataURL(file);
            });

            return this;
        },

        _renderThumbnail: function (e, i, len, file) {
            var me = this,
                html = {
                    'load': '<div class="mui-imguploader-file"><img id="image' + file.id + '" src="' + e.target.result + '" /></div>',
                    'error': '<div class="mui-imguploader-file">error</div>'
                },
                $thumbnails = me._$thumbnails.show(),
                tabs = me._tabs;

            $thumbnails.append(html[e.type]);
            if (i == len - 1) {
                me._$waiting.css('opacity', 0);
                tabs._getPanel().append($thumbnails).append(me._$uploadBtn.show().prop('disabled', false).removeClass('mui-state-disable'));
                tabs.refresh();
            }
        },

        _uploadFiles:function (files) {
            var me = this,
                $uploadBtn = me._$uploadBtn,
                len = files.length, i, file, progressEvent, sucessEvent, failureEvent;

            for (i = 0; file = files[i]; i++) {
                (function (file, i) {
                    var xhr = new XMLHttpRequest(),
                        $prg = $('<div class="mui-imguploader-prg"></div>');
                    if (xhr.upload) {
                        xhr.upload.onprogress = function (e) {
                            progressEvent = $.Event('progress');
                            me.trigger(progressEvent, [file, e]);
                            if (progressEvent.preventDefault()) return me;
                            $('#image' + file.id).parent('.mui-imguploader-file').append($prg.html((e.loaded / e.total * 100).toFixed(2) + '%'));
                        };

                        xhr.onreadystatechange = function (e) {
                            if (xhr.readyState == 4) {
                                if (xhr.status == 200) {
                                    sucessEvent = $.Event('success');
                                    me.trigger(sucessEvent, [file, e]);
                                    if (sucessEvent.preventDefault()) return me;
                                    if (i == len - 1) {
                                        $uploadBtn.prop('disabled', true).addClass('mui-state-disable');
                                        me._files = [];
                                    }
                                    $('#image' + file.id).data('url', xhr.responseText);

                                } else {
                                    failureEvent = $.Event('failure');
                                    me.trigger(failureEvent, [file, e]);
                                    if (failureEvent.preventDefault()) return me;
                                    $('#image' + file.id).data('failed', 'failed');
                                }
                            }
                        };
                        xhr.open("POST", me.option('url'), true);
                        xhr.setRequestHeader("X_FILENAME", file.name);
                        xhr.send(file);
                    }
                })(file, i);
            }
        },
        value: function () {
            return $.map(this._tabs._getPanel().find('.mui-imguploader-file img'), function (img, k) {
                return $(img).data('url');
            }) || [];
        },
        clear: function () {
            this._$thumbnails.empty().hide();
            this._$uploadBtn.hide();
            this._$waiting.hide();
            return this;
        }
    }, 'dialog')
})(Zepto, ME.ui);
