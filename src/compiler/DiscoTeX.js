(function(DT){
    /* Local private functions */
    var DefaultCmd = function(name){
        return {
            args: [],
            fn: function(args){
                this.logError('Unknown command "' + name + '"');
                return '<dt-bad-cmd name="' + name + '"></dt-bad-cmd>';
            }
        };
    };

    var DefaultEnv = function(name){
        return { args: [],
            align: function(){ return ' & '; }, //Calm the compiler. This is probably not what we want to do
            begin: function(args){
                this.logError('Unknown environment "' + name + '"');
                return '<dt-bad-env name="' + name + '">';
            },

            end: function(){
                return '</dt-bad-env>';
            }
        };
    };

    DT.getCmd = function(tk){
        var cmd = DT.Cmd[tk];
        if(typeof(cmd) === 'undefined'){
            cmd = DefaultCmd(tk);
        }

        return cmd;
    };

    DT.getEnv = function(tk){
        var env= DT.Env[tk];
        if(typeof(env) === 'undefined'){
            env = DefaultEnv(tk);
        }
        return env;
    }

    DT.addPackage = function(pkg){
        for(cmd in pkg.Cmd){
            if(typeof(DT.Cmd[cmd]) !== 'undefined'){
                console.error('There already exists a command called "' + cmd + '".');
            }
            DT.Cmd[cmd] = pkg.Cmd[cmd];
        }
        for(env in pkg.Env){
            if(typeof(DT.Env[env]) !== 'undefined'){
                console.error('There already exists an environment called "' + env + '".');
            }
            DT.Env[env] = pkg.Env[env];
        }
        for(cls in pkg.Classes){
            if(typeof(DT.Classes[cls]) !== 'undefined'){
                console.error('There already exists a command called "' + cmd + '".');
            }
            DT.Classes[cls] = pkg.Classes[cls];
        }

    };

    DT.Classes = {
        'article' : '<!--TOC-->\n<div class="col-md-6" role="main">\n<!--DOCUMENT-->\n</div>'
    };

})(window.DiscoTeX = window.DiscoTeX || {});
