(function($, ns){
    var ui = ns.ui;

    ns.registerUI('fontfamily fontsize', function (editor,cmdName) {
        var cmd = cmdName.toLowerCase(),
            opts = editor.options[cmd],
            fn = null, combox, btn, title, isBind;

        switch (cmd) {
            case 'fontfamily':
                fn = function (i) {
                    return i < opts.length && '<div class="mui-combox-' + cmd + '" style="font-family:' + opts[i].val + '" value="' + opts[i].val + '" >' + opts[i].val.split(',')[0] + '</div>';};
                title = '字体';
                break;
            case 'fontsize':
                fn = function (i) {
                    return i < opts.length && '<div class="mui-combox-' + cmd + '" style="font-size:' + opts[i] + 'px;" value="' + opts[i] + 'px" >' + opts[i]+ '</div>';};
                title = '字体大小';
                break;
            case 'default':
                break;
        };

        btn = ui.button({
            name: cmdName,
            click: function () {
                combox = combox || ui.combox({
                    container: $('.mui-toolbar'),
                    title: title,
                    renderFn: fn,
                    select: function (e, index, value) {
                        this.singleSelect(index).hide();
                        editor.execCommand(cmd, value);
                    },
                    show: function () {
                        if (!isBind) {
                            editor.on('touchstart', function () {
                                combox.hide();
                            });
                            isBind = true;
                        }
                    }
                });
                combox.toggle(this.root());
            }
        });

        return btn;
    })
})(Zepto, ME);

//表情
(function($, ns){
    var ui = ns.ui;

    function getEmotion(editor){
        var pop;
        return pop = ui.emotion({
            container: $('.mui-toolbar'),
            items: [
                {
                    cls: 'bubble',
                    url: 'http://img.baidu.com/hi/face/i_f##.gif',
                    size: 25,
                    items: [
                        '微笑', '亲吻', '调皮', '惊讶', '耍酷', '发火', '害羞', '汗水', '大哭', '得意', '鄙视', '困', '夸奖', '晕倒', '疑问', '媒婆', '狂吐', '青蛙', '发愁', '亲吻', '', '爱心', '心碎', '玫瑰', '礼物', '哭', '奸笑', '可爱', '得意', '呲牙', '暴汗', '楚楚可怜', '困', '哭', '生气', '惊讶', '口水', '彩虹', '夜空', '太阳', '钱钱', '灯泡', '咖啡', '蛋糕', '音乐', '爱', '胜利', '赞', '鄙视', 'OK'
                    ]
                },
                {
                    cls: 'lvdouwa',
                    url: 'http://img.baidu.com/hi/bobo/B_####.gif',
                    size: 35,
                    items: [
                        'HI', 'KISS', '不说', '不要', '扯花', '大心', '顶', '大惊', '飞吻', '鬼脸', '害羞', '口水', '狂哭', '来', '泪眼', '流泪', '生气', '吐舌', '喜欢', '旋转', '再见', '抓狂', '汗', '鄙视', '拜', '吐血', '嘘', '打人', '蹦跳', '变脸', '扯肉', '吃To', '吃花', '吹泡泡糖', '大变身', '飞天舞', '回眸', '可怜', '猛抽', '泡泡', '苹果', '亲', '', '骚舞', '烧香', '睡', '套娃娃', '捅捅', '舞倒', '西红柿', '爱慕', '摇', '摇摆', '杂耍', '招财', '被殴', '被球闷', '大惊', '理想', '欧打', '呕吐', '碎', '吐痰'
                    ]
                },
                {
                    cls: 'bobo',
                    url: 'http://img.baidu.com/hi/ldw/w_####.gif',
                    size: 35,
                    items: [
                        '大笑', '瀑布汗~', '惊讶', '臭美', '傻笑', '抛媚眼', '发怒', '我错了', 'money', '气愤', '挑逗', '吻', '怒', '胜利', '委屈', '受伤', '说啥呢？', '闭嘴', '不', '逗你玩儿', '飞吻', '眩晕', '魔法', '我来了', '睡了', '我打', '闭嘴', '打', '打晕了', '刷牙', '爆揍', '炸弹', '倒立', '刮胡子', '邪恶的笑', '不要不要', '爱恋中', '放大仔细看', '偷窥', '超高兴', '晕', '松口气', '我跑', '享受', '修养', '哭', '汗', '啊~', '热烈欢迎', '打酱油', '俯卧撑', '?'
                    ]
                }
            ],
            confirm: function(){
                var html = '',
                    urls = this.value();

                $.each(urls, function(){
                    html += '<img src="'+this+'" />';
                });
                editor.execCommand( 'inserthtml', html );
                pop.hide();
            }
        });
    }

    ns.registerUI(
        ['emotion'], function(editor,cmdName){
            var pop,
                btn = ui.button({
                name : cmdName,
                click:function(){
                    pop = pop || getEmotion(editor);
                    pop.toggle(btn.root());
                },
                title:cmdName
            });

            btn.root().on('click', function(){
                editor.focus();
                document.activeElement.blur();
            });

            return btn;
        }
    )
})(Zepto,ME);