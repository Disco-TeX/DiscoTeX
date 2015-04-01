DiscoTeX.addPackage({
    Cmd: {
        'DiscoTeX' : '\\(\\mathrm{Disco\\hspace{-1.7pt}\\TeX}\\)',

        'ifdisco' : { args : 'NN',
            fn : function(args){
                //FIXME make it so the second parameter's errors are ignored
                //Maybe do this with a coroutine and suspending warning logs between the second parameter?
                return args[0];
            }
        },

        'dtcollapse' : { args : '',
            fn : function(){
                this.state.setEnvironmentData(this.state.getEnvironmentID(), 'collapsible');
                return '';
            }
        },

        'dtnocollapse' : '', //FIXME

        'dtstartcollapsed' : { args : '',
            fn : function(){
                this.state.setEnvironmentData(this.state.getEnvironmentID(), 'start-collapsed');
                return '';
            }
        },
    },
    Env: {
    },
    Classes: {
    }
});
