ME.plugins['moverange'] = function(){
    var me = this;
    me.commands['moverange'] = {
        execCommand : function( cmd,dir ) {
            var me = this,
                rng = me.selection.getRange();
            rng.shrinkBoundary();
            var address = rng.createAddress();
            try{
                if(rng.collapsed){
                    rng.shrinkBoundary();
                    rng.startOffset = rng.startOffset + (dir == 'left' ? -1 : 1);
                    rng.collapse(true);
                    rng.select();
                }else{
                    rng.shrinkBoundary();
                    if(dir == 'left'){
                        rng.startOffset = rng.startOffset -1;
                    }else{
                        rng.endOffset = rng.endOffset +1;
                    }
                    rng.select();
                }
            }catch(e){
                rng.moveToAddress(address).select()
            }
        },
        notNeedUndo:1
    };
};

