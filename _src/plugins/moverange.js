;
(function ($) {
    ME.plugins['moverange'] = function () {
        var me = this;
        me.commands['moverange'] = {
            execCommand:function (cmd, dir,isStart) {
                var me = this,
                    rng = me.selection.getRange();
                var address = rng.createAddress();
                try{
                    if(rng.collapsed){
                        rng.shrinkBoundary();
                        rng.startOffset = rng.startOffset + (dir == 'left' ? -1 : 1);
                        rng.setCursor(true,true)
                    }else{
                        rng.shrinkBoundary();
                        if(isStart){
                            rng.startOffset = rng.startOffset + (dir = 'left' ? 1 : -1);

                        }else{
                            rng.endOffset = rng.endOffset + (dir = 'left' ? -1 : 1);
                        }
                        rng.select();
                    }
                } catch (e) {
                    rng.moveToAddress(address).select()
                }
            },
            notNeedUndo:1
        };
    };
})(Zepto)
