(function(DT){
    var escapeString = function(s){
        return (s + '').replace(/([\"])/g,'\\$1');
    };

    var accentBuilder = function(entityNumber){
        return { args: 'N',
            fn: function(args){
                if(args[0].length == 0){
                    return ''; //FIXME
                }
                return args[0][0] + '&#' + entityNumber + ';' + args[0].slice(1);
            }
        };
    };
/*    var accentFunctionBuilder = function(htmlEntityName, characterOptions, charCode){
        return { args: 'N', fn: function(args){
            var ch = args[0][0];
            for(var i = 0; i < characterOptions.length; ++i){
                if(ch === characterOptions[i]){
                    if(typeof(charCode) === 'undefined'){
                        return '&' + ch + htmlEntityName + ';' + args[0].slice(1);
                    }
                    else{
                        return '&#' + charCode[i] + ';' + args[0].slice(1);
                    }
                }
            }

            this.logError('Cannot accent character "' + args[0] + '"');
            return args;
        } };
    };*/

   var translateDistance = function(dist){
       var unit = dist.match(/[^\d]+/)[0];
       var num = parseInt(dist);

       if(unit === 'em' || unit === 'ex'){
           return num.toString() + unit;
       }
      
       /* fixed widths. convert them all to 'pt' */
       if(unit === 'pt'){ /* do nothing */ }
       else if(unit === 'mm'){ num *= 2.84; }
       else if(unit === 'cm'){ num *= 28.4; }
       else if(unit === 'in'){ num *= 72.27; }
       else if(unit === 'bp'){ num *= 1.00375; }
       else if(unit === 'pc'){ num *= 12; }
       else if(unit === 'dd'){ num *= 1.07; }
       else if(unit === 'cc'){ num *= 12.84; }
       else if(unit === 'sp'){ num *= 0.000015; }
       else{
           this.logError('"' + unit + '" is not a valid LaTeX unit.');
           return '1pt';
       }

       return num.toString() + 'pt';
   };

    var spanClassBuilder = function(className){
        return { args: 'N', fn: function(args){
            return '<span class="' + className + '">' + args[0] + '</span>';
        } };
    };


    var setVariable = function(varName){
        return { args: 'N', fn: function(args){
            this.state.vars[varName] = args[0];
            return '';
        } };
    };

    var ignore = function(msg){ 
        return function(){
            if(typeof(msg) !== 'undefined'){
                this.logWarning(msg);
            }
            return ''; };
    };

    var wrap = function(tag){
        return { args: 'N', fn: function(args){
            return '<' + tag + '>' + args[0] + '</' + tag + '>';
        } };
    };

    /* Built-in commands
     *
     * args - an array specifying the types of arguments
     * it takes and the order they come in
     * "O" denotes an optional argument
     * "N" denotes normal
     *
     * fn - the javascript function to be called with the given
     * arguments
     */
    DT.Cmd = {
        /* Font styles (5.1) */
        'textrm' : spanClassBuilder('dt-rm'),
        'textit' : wrap('em'),
        'emph' : wrap('em'),
        'textmd' : spanClassBuilder('dt-md'),
        'textbf' : wrap('strong'),
        'textup' : spanClassBuilder('dt-up'),
        'textsl' : spanClassBuilder('dt-sl'),
        'textsf' : spanClassBuilder('dt-sf'),
        'textsc' : spanClassBuilder('dt-sc'),
        'texttt' : spanClassBuilder('dt-tt'),
        'textnormal' : spanClassBuilder('dt-normal'),

        'bf' : { args: '',
            fn: function(){
                this.state.addDefer('</strong>');
                return '<strong>';
            }
        },

        'em' : { args: '',
            fn: function(){
                this.state.addDefer('</em>');
                return '<em>';
            }
        },

        'rm' : { args: '',
            fn: function(){
                this.state.addDefer('</span>');
                return '<span class="dt-rm">';
            }
        },

        'sc' : { args: '',
            fn: function(){
                this.state.addDefer('</span>');
                return '<span class="dt-sc">';
            }
        },

        'sf' : { args: '',
            fn: function(){
                this.state.addDefer('</span>');
                return '<span class="dt-sf">';
            }
        },

        'sl' : { args: '',
            fn: function(){
                this.state.addDefer('</span>');
                return '<span class="dt-sl">';
            }
        },

        'tt' : { args: '',
            fn: function(){
                this.state.addDefer('</span>');
                return '<span class="dt-tt">';
            }
        },

        /* Document classes (4) */
        'documentclass' : { args: 'ON',
            fn: function(args){
                var cls = DT.Classes[args[1]];
                if(typeof(cls) === 'undefined'){
                    this.logError('Unknown document class. Proceeding with document class "article".');
                    cls = DT.Classes['article'];
                }

                this.state.documentClass = cls;
                return '';
            }
        },

        'usepackage' : { args: 'ON',//FIXME
            fn: function(args){
                //console.log('I need to load package "' + args[1] + '"' + (typeof(args[0]) === 'undefined' ? '' : ' with options ' + args[1]));
                return '';
            }
        },

        /* Font sizes (5.2) */ //FIXME do this

        /* Low-level font commands (5.3) */ //FIXME do this

        /* Layout (6) */
        'onecolumn' : '', // This is intentionally ignored, because two-column layouts are not supported by DiscoTeX
        'twocolumn' : { args: 'O',
            fn: function(args){
                this.logWarning('Multiple column layouts are not supported by DiscoTeX.');
                return '';
            }
        },
        'columnsep' : { args: '',
            fn: function(){
                this.logWarning('Multiple column layouts are not supported by DiscoTeX.');
                return '';
            }
        },
        'columnseprule' : { args: '',
            fn: function(){
                this.logWarning('Multiple column layouts are not supported by DiscoTeX.');
                return '';
            }
        },
        'columnsepwidth' : { args: '',
            fn: function(){
                this.logWarning('Multiple column layouts are not supported by DiscoTeX.');
                return '';
            }
        },
        'dbltopfraction' : { args: '',
            fn: function(){
                this.logWarning('Multiple column layouts are not supported by DiscoTeX.');
                return '';
            }
        },
        'dblfloatpagefraction' : { args: '',
            fn: function(){
                this.logWarning('Multiple column layouts are not supported by DiscoTeX.');
                return '';
            }
        },
        'dblfloatsep' : { args: '',
            fn: function(){
                this.logWarning('Multiple column layouts are not supported by DiscoTeX.');
                return '';
            }
        },
        'dbltextfloatsep' : { args: '',
            fn: function(){
                this.logWarning('Multiple column layouts are not supported by DiscoTeX.');
                return '';
            }
        },
        'flushbottom' : { args: '',
            fn: function(){
                this.logWarning('"flushbottom" command is intentionally not supported by DiscoTeX. Consider wrapping this in an "ifdisco" command.');
                return '';
            }
        },
        'raggedbottom' : { args: '',
            fn: function(){
                this.logWarning('"raggedbottom" command is intentionally not supported by DiscoTeX. Consider wrapping this in an "ifdisco" command.');
                return '';
            }
        },
        
        /* Sectioning (7) */
        'section' : {
            args: function(){
                var ign = this.state.paragraph.ignore;
                this.state.paragraph.ignore = true;

                var arg1 = this.getNormalArgument();
                if(arg1 !== '*'){
                    this.state.paragraph.ignore = ign;
                    return [undefined, arg1];
                }
                arg2 = this.getNormalArgument();
                this.state.paragraphs.ignore = ign;

                return [arg1, arg2];
            },
            inParagraph: false,
            fn: function(args){
                this.state.pushSectionLabel(); //autoincrements section counter

                return '<dt-section section-title="' + escapeString(args[1]) + '"' + (args[0] === '*' ? '' : ' number = "' + this.state.counter['section'] + '"') + '<!--lbl:sec:' + this.state.getSectionString(0) + '-->></dt-section>';
            }
        },

        'subsection' : {
            args: function(){
                var ign = this.state.paragraph.ignore;
                this.state.paragraph.ignore = true;

                var arg1 = this.getNormalArgument();
                if(arg1 !== '*'){
                    this.state.paragraph.ignore = ign;
                    return [undefined, arg1];
                }
                arg2 = this.getNormalArgument();
                this.state.paragraphs.ignore = ign;

                return [arg1, arg2];
            },
            inParagraph: false,
            fn: function(args){
                this.state.pushSubsectionLabel(); //autoincrementns subsection counter
                return '<dt-subsection section-title="' + escapeString(args[1]) + '" ' + (args[0] === '*' ? '' : 'number = "1"') + '<!--lbl:sec:' + this.state.getSectionString(1) + '-->></dt-subsection>';
            }
        },

        'subsubsection' : {
            args: function(){
                var ign = this.state.paragraph.ignore;
                this.state.paragraph.ignore = true;

                var arg1 = this.getNormalArgument();
                if(arg1 !== '*'){
                    this.state.paragraph.ignore = ign;
                    return [undefined, arg1];
                }
                arg2 = this.getNormalArgument();
                this.state.paragraphs.ignore = ign;

                return [arg1, arg2];
            },
            inParagraph: false,
            fn: function(args){
                this.state.pushSubsubsectionLabel(); //autoincrements subsubsection counter
                return '<dt-subsubsection section-title="' + escapeString(args[1]) + '" ' + (args[0] === '*' ? '' : 'number = "1"') + '<!--lbl:sec:' + this.state.getSectionString(2) + '-->></dt-subsubsection>';
            }
        },

        //FIXME Only in book/report classes
        'part': { args: 'N', fn: ignore() }, //FIXME
        'chapter': { args: 'N', fn: ignore() }, //FIXME

        'paragraph': { args: 'N', fn: ignore() }, //FIXME
        'subparagraph': { args: 'N', fn: ignore() }, //FIXME


        /* Cross-references (8) */
        'label' : { args: 'N',
            fn: function(args){
                this.state.registerLabel(args[0]);
                return ''
            }
        },
        'pageref' : { args: 'N',
            fn: function(args){
                this.logWarning('Page references are intentionally not supported by DiscoTeX. Consider wrapping this in an "ifdisco" command.');
                return '';
            }
        },

        'ref' : { args: 'N',
            fn: function(args){
                return '<dt-ref label="' + args[0] + '"></dt-ref>';
            }
        },

        'eqref' : { args: 'N',
            fn: function(args){
                return '<dt-eqref label="' + args[0] + '"></dt-eqref>';
            }
        },

        /* Environments (9) */
        'begin': { args: 'N',
            fn: function(args){
                /* This function takes a single normal parameter representing
                 * the name of the environment to be begun. We then look at
                 * this environment and get more parameters depending on the
                 * arguments it asks for.
                 */
                var env = DT.getEnv(args[0])

                /* This is the variable we use to output HTML with. */
                var output = '';

                /* By default, environments should end paragraphs. This seems
                 * to be the most common functionality with theorem-like
                 * environments, proofs, tables, figures, etc. If you really
                 * want, you can change this by setting the flag in the
                 * enironment definition 'resetParagraph' to 'false'. Currently
                 * checking this functionality has not been implemented. FIXME
                */
                if(this.state.paragraph.inside){
                    output += this.endParagraph();
                }

                /* The parameter internalParagraphs (default value is true)
                 * tells the engine whether we should have paragraphs at all
                 * inside this environment.
                 *
                 * This is probably something to be put on state stack, rather
                 * than just a global. FIXME
                 */
                if(env.internalParagraphs === false){
                    this.state.paragraph.ignore = true;
                }

                /* Push a new environment onto the environment stack. Implicitly,
                 * this also registers a new environment and gives it an ID
                 * (saved in the variable 'eid') so that we can come back later
                 * and fill in options that TeX provides with later commands.
                 */
                this.state.pushEnvironment(args[0], env);
                var eid = this.state.getEnvironmentID();

                /* Now we can compute the necessary arguments to provide to the
                 * environment. They will either be normal or optional, and are
                 * explained in determined the same way they are for any other
                 * command call.
                 */
                var argList = this.getAllArguments('begin{' + args[0] + '}', env.args || '');

                /* There are two ways we allow environments to be defined. First,
                 * and most common, is that the environment has a begin() function
                 * and an end() function which are called at the appropriate times.
                 * If an environment implements a begin function, these will be
                 * called. With the prescribed arguments.
                 */
                if(typeof(env.begin) !== 'undefined'){
                    return output + env.begin.call(this, eid, argList);
                }
                /* The other way to define an environment is to give the environment
                 * complete control over everything it reads. In general this is a
                 * bad idea, and should be avoided at pretty much all costs. With this
                 * method, you are on your own to leverage the TeXStream object to spit
                 * out the correct tokens based on category codes. Your resulting code
                 * will probably be inconsistent at best, and completely unusable at
                 * worst.
                 *
                 * Nevertheless, if you think you know what you're doing, godspeed.
                 * You can achieve this by having one function named 'parse' which
                 * takes three arguments:
                 *   eid      -  the environment ID that was computed above,
                 *   args     -  the arguments to the environment as above
                 *   content  -  the raw TeX content of the environment.
                 */
                 output += env.parse.call(this, eid, argList, this.readUntil('\\\\end{' + args[0].replace(/\*/g,'\\*') + '}').slice(0, -(args[0].length + 6)) );
                 //then do all the end-env cleanup

                //listing environments
                var e = this.state.environmentStack.pop();

                //FIXME
                if(env.internalParagraphs === false){
                    this.state.paragraph.ignore = false;
                }
                return output;
            }
        },

        'end' : { args: 'N',
            fn: function(args){
                var env = DT.getEnv(args[0]);


                //listing environments
                var e = this.state.environmentStack.pop();

                if(e.name !== args[0]){
                    this.logError('You attempted to end a "' + args[0] + '" environment, but the current top-level environment is "' + e.name + '".');
                }

                //FIXME
                if(env.internalParagraphs === false){
                    this.state.paragraph.ignore = false;
                }

                if(typeof(env.end) !== 'undefined' && env.end.constructor.name === 'GeneratorFunction'){
                    var output = '';
                    var gen = env.end.call(this);
                    var next;
                    do{
                        next = gen.next();
                        output += next.value;
                    } while(!next.done);

                    return output + this.endParagraph();
                }

                return this.endParagraph() + env.end.call(this, e.eid);
            }
        },

        /* Line-breaking: (10) */
        '\\' : {
            args: function(){
                /* The asterisk tells LaTeX not to start a new page
                 * on the PDF, so we ignore it. We don't even send
                 * it to the command function.
                 */
                if(this.stream.peek() === '*'){
                    this.getNormalArgument(); //ignore the asterisk
                }

                return [this.getOptionalArgument()];
            },
            fn: function(args){
                if(typeof(args[0]) === 'undefined'){
                    return '<br/>';
                }
                return '<div style="height:' + translateDistance(args[0]) + ';"></div>';
            }
        },

        'obeycr' : {
            args: '',
            fn: function(){
                this.state.obeycr = true;
                return '';
            }
        },

        'restorecr' : {
            args: '',
            fn: function(){
                this.state.obeycr = false;
                return '';
            }
        },

        'newline' : '<br/>',

        /* The following commands are intentionally ignore()d
         * because they don't make sense on the web and can
         * be effectively ignore()d.
         */
        '-' : '', 'fussy' : '', 'sloppy' : '', 'hyphenation' : '', 

        'linebreak' : { args: 'O', fn: function(){ return '<br/>'; } },
        'nolinebreak' : { args: 'O', fn: ignore() }, //FIXME This may be worth ignoring

        /* Page breaking (11) */

        'cleardoublepage' : '', // <-- irrelevant on web
        'clearpage' : '', // <-- irrelevant on web
        'newpage' :	'', // <-- irrelevant on web
        'enlargethispage' : '', // <-- irrelevant on web
        'pagebreak' : '', // <-- irrelevant on web
        'nopagebreak' : '', // <-- irrelevant on web

        /* Footnotes (12) */
        'footnote' : { args: 'ON',
            fn: function(args){
                if(typeof(args[0]) === 'undefined'){
                    return '<dt-footnote>' + args[1] + '</dt-footnote>';
                }
                return '<dt-footnote number="' + args[0] + '">' + args[1] + '</dt-footnote>';
            }
        },

        'footnotemark' : { args: 'O', fn: ignore() }, //FIXME
        'footnotetext' : { args: 'ON', fn: ignore() }, //FIXME
        'fnsymbol' : '', //FIXME
        'footnoterule' : '', //FIXME
        'footnotesep' : '', //FIXME

        /* Definitions (13) */ 
        'newcommand': '', //FIXME
        'renewcommand': '', //FIXME
        'newcounter': '', //FIXME
        'newlength': '', //FIXME
        'newsavebox': '', //FIXME
        'newenvironment': '', //FIXME
        'renewenvironment': '', //FIXME
        'newtheorem': '', //FIXME
        'newfont': '', //FIXME
        'protect': '', //FIXME

        /* Counters (14) */ //FIXME

        /* Lengths (15) */ //FIXME

        /* Making Paragraphs (16) */ //FIXME

        /* Math Formulas (17) */ //FIXME

        /* Modes (18) ... nothing here */

        /* Page styles (19) */
        'maketitle': {args: '', //FIXME redo this
            fn: function(){
                var title = this.getVariable('title');
                var author = this.getVariable('author');
                var date = this.getVariable('date');

                var output = '<dt-heading>';
                if(typeof(title) !== 'undefined'){
                    output += '\n<h1>' + title + '</h1>';
                }

                if(typeof(author) !== 'undefined'){
                    output += '\n<h3>' + author + '</h3>';
                }

                if(typeof(date) !== 'undefined'){
                    output += '\n<h5>' + date + '</h5>';
                }

                output += '\n</dt-heading>';
                return output;
            }
        },
        'author': setVariable('author'),
        'date': setVariable('date'),
        'thanks': setVariable('thanks'),
        'title': setVariable('title'),


        'pagenumbering' : { args: 'N', fn: ignore() }, //FIXME
        'pagestyle' : { args: 'N', fn: ignore() }, //FIXME
        'thispagestyle' : { args: 'N', fn: ignore() }, //FIXME

        /* Spaces (20) */
        'hspace' : '', //FIXME
        'hfill' : '', //FIXME
        'SPACE' : '', //FIXME
        '@' : '', //FIXME
        'thinspace' : '', //FIXME
        '/' : '', //FIXME
        'hrulefill' : '', //FIXME
        'dotfill' : '', //FIXME

        /* Boxes (21) */
        'mbox' : '', //FIXME
        'fbox' : { args: 'OON',
            fn: function(args){
                return '<span class="fbox">' + args[2] + '</span>';
            }
        },
        'framebox' : { args: 'OON',
            fn: function(args){
                return '<span class="fbox">' + args[2] + '</span>';
            }
        },
        'lrbox' : '', //FIXME
        'makebox' : '', //FIXME
        'parbox' : '', //FIXME
        'raisebox' : '', //FIXME
        'savebox' : '', //FIXME
        'sbox' : '', //FIXME
        'usebox' : '', //FIXME


        /* Reserved characters (22.1) */
        '#' : '#',
        '$' : '$',
        '%' : '%',
        '&' : '&amp;',
        '_' : '_',
        '{' : '{',
        '}' : '}',

        /* Symbols (22.2) */
        'copyright' : '&copy;',
        'dag' : '&dagger;',
        'ddag' : '&Dagger;',
        'LaTeX' : '\\(\\mathrm{\\LaTeX}\\)',
        'dots' : '&hellip;',
        'ldots' : '&hellip;', 
        'textellipsis' : '&hellip;',
        'lq' : '&lsquo;', 
        'P' : '&para;',
        'textparagraph' : '&para;',
        'rq' : '&rsquo;',
        'S' : '&sect;',
        'TeX' : '\\(\\mathrm{\\TeX}\\)',
        'textasciicircum' : '^',
        'textasciitilde' : '~',
        'textasteriskcentered' : '*',
        'textbar' : '|',
        'textbardbl' : '&#8214;',
        'textbigcircle' : '&#9675;',
        'textbraceleft' : '{',
        'textbraceright' : '}',
        'textbullet' : '&bull;',
        'textcircled' : { args: 'N',
            fn: function(args){
                //FIXME this is not ideal, but for now it's good enough
                return '<span class="circled">' + (args[0].length === 0 ? '&nbsp;' : args[0][0]) + '</span>' + args[0].slice(1);
            }
        },
        'textcompwordmark' : '&#8291;', //This command is used to separate ligatures
        'textcapitalwordmark' : '&#8291;', //This command is used to separate ligatures
        'textascenderwordmark' : '&#8291;', //This command is used to separate ligatures
        'textdagger' : '&dagger;',
        'textdaggerdbl' : '&Dagger;',
        'textdollar' : '$',
        'textemdash' : '&mdash;',
        'textendash' : '&ndash;',
        'textexclamdown' : '&iexcl;',
        'textgreater' : '&gt;',
        'textless' : '&lt;',
        'textleftarrow' : '&larr;',
        'textordfeminine' : '&ordf;',
        'textordmasculine' : '&ordm;',
        'textquestiondown' : '&iquest;',
        'textquotedblleft' : '&ldquo;',
        'textquotedblright' : '&rdquo;',
        'textquoteleft' : '&lsquo;',
        'textquoteright' : '&rsquo;',
        'textregistered' : '&reg;',
        'texttrademark' : '&trade;',
        'textunderscore' : '_',
        'textvisiblespace' : '&blank;',

        /* Accented characters (22.3) */
        '`' : accentBuilder(768),
        '\'' : accentBuilder(769),
        '^' : accentBuilder(770),
        '~' : accentBuilder(771),
        '=' : accentBuilder(772),
        'u' : accentBuilder(774),
        '.' : accentBuilder(775),
        '"' : accentBuilder(776),
        'r' : accentBuilder(778),
        'H' : accentBuilder(779),
        'v' : accentBuilder(780),
        'd' : accentBuilder(803), //FIXME in a group, displays in the middle
        'c' : accentBuilder(807),
        //'k' : accentBuilder(808), //not supported in standard TeX
        'b' : accentBuilder(817), //FIXME In a group, displays in the middle
        't' : accentBuilder(865), //FIXME doesn't display properly

        /* Non-english characters (22.4) */
        'AA' : '&Aring;',
        'aa' : '&aring;',
        'AE' : '&AElig;',
        'ae' : '&aelig;',
        'IJ' : '&IJlig;',
        'ij' : '&ijlig;',
        'l' : { args: 'N', fn: function(){ return '&#321'; } },
        'L' : { args: 'N', fn: function(){ return '&#322'; } },
        'O' : '&Oslash;',
        'o' : '&oslash;',
        'OE' : '&OElig;',
        'oe' : '&oelig;',
        'ss' : '&szlig;',
        'SS' : 'SS',

        /* Rules (22.5 & 22.6) */
        'rule' : { args: 'ONN', //FIXME
            fn: function(){
                return '<hr/>';
            }
        },

        'today' : { args: '',
            fn: function(){
                /* Returns the date the document was modified */
                return this.state.lastModified.toLocaleString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
            }
        },

        /* Splitting the input (23) */
        'include' : { args: 'N', fn: ignore() }, //FIXME
        'includeonly' : { args: 'N', fn: ignore() }, //FIXME
        'input' : { args: 'N', fn: ignore() }, //FIXME

        /* Front/Back Matter (24) */
        'addcontentsline' : { args: 'NNN', fn: ignore() }, //FIXME
        'addcontents' : { args: 'NN', fn: ignore() }, //FIXME
        'glossary' : { args: 'N', fn: ignore() }, //FIXME
        'makeindex' : '', //FIXME
        'index' : { args: 'N', fn: ignore() }, //FIXME
        'indexentry' : { args: 'NN', fn: ignore() }, //FIXME
        'tableofcontents' : { args: '', fn: function(){ this.state.hasTOC = true; return ''; } },

            /* Letters (25) */ //FIXME

        /* Terminal I/O (26) */ //FIXME

        /* Command line (27) */ //FIXME




        /* Everything else */
        'bibitem' : { args: 'N',
            fn: function(args){
                return '<dt-bibitem label="' + args[0] + '"></dt-bibitem>';
            }
        },

        'bibliographystyle': {args: 'N', fn: ignore() }, //FIXME

        'caption' : { args: 'N',
            fn: function(args){
                return '<p class="caption">' + args[0] + '</p>'
            }
        },

        'centering' : { args: '',
            fn: function(){
                this.state.addDefer('</div>');
                return '<div class="centering">';
            }
        },

        'cite' : { args: 'N',
            fn: function(args){
                return '<dt-cite label="' + args[0] + '"></dt-cite>'
            }
        },


        'href' : { args: 'NN',
            fn: function(args){
                return '<a href="' + args[0] + '">' + args[1] + '</a>';
            }
        },

        'includegraphics' : { args: 'ON',
            fn: function(args){
                //FIXME work with all options

                var opts = args[0].split(',');
                var htmlOptions = '';
                opts.forEach(function(el){
                    var option = el.split('=');
                    if(option[0] === 'scale'){
                        var scale = Math.round(parseFloat(option[1]) * 100);
                        htmlOptions += ' width="' + scale + '%"';
                    }
                })

                return '<img ' + htmlOptions + 'src="' + args[1] + '" />';
            }
        },

        'item' : { args: '',
            inParagraph: false,
            fn: function(){
                var e = this.state.environmentStack[this.state.environmentStack.length - 1];
                if(typeof(e.environment.item) !== 'undefined'){
                    return e.environment.item.call(this, ++e.itemCount);
                }

                this.logError('"item" command used outside of a listing environment');
                return '';
            }
        },

        'title' : setVariable('title'),

        'url' : { args: 'N',
            fn: function(args){
                return '<a href="' + args[0] + '">' + args[0] + '</a>';
            }
        },

        'verb' : {
            args: function(){
                var ccdb = this.state.catcodeDB;
                //set to default
                this.state.resetCatcodes();
                //then make everything a letter
                this.state.setCatcode(['\\', '{', '}', '$', '\n', '#', '^', '_', ' ', '\t', '~', '%', '`', '\'', '"', '[', ']'], DT.CATCODE.LETTER);

                var args = [];
                var nextArg = '';
                var endVerb;

                var ast = false;
                var asteriskOrFirst = this.getNormalArgument();
                if(asteriskOrFirst === '*'){
                    ast = true;
                    endVerb = this.getNormalArgument();
                }
                else{
                    endVerb = asteriskOrFirst;
                }

                while(nextArg !== endVerb){
                    args.push(nextArg);
                    nextArg = this.getNormalArgument();
                }

                this.state.catcodeDB = ccdb;

                return [ast, args.join('')];
            },
            fn: function(args){
                if(args[0]){
                    return '<code>' + args[1].replace(/ /g,'&blank;') + '</code>';
                }
                else{
                    return '<code>' + args[1] + '</code>';
                }
            }
        },

        '[' : {
            args: function(){
                var ccdb = this.state.catcodeDB;
                
                //set to default
                this.state.resetCatcodes();
                //then make everything a letter
                this.state.setCatcode(['\\', '{', '}', '$', '\n', '#', '^', '_', ' ', '\t', '~', '%'], DT.CATCODE.LETTER);

                var endFlag = 0;
                var leader = '';
                var arg = '';
                while(endFlag < 2){
                    var next = this.getNormalArgument();
                    var isLeader = (ccdb[next] === DT.CATCODE.ESC || (typeof(ccdb[next]) === 'undefined' && next === '\\')); //FIXME magic leader (\\ is the default leader)
                    if(endFlag === 0 && isLeader){
                        leader = next;
                        ++endFlag;
                        continue;
                    }

                    if(endFlag === 1 && next === ']'){
                        ++endFlag;
                        continue;
                    }

                    if(endFlag === 1){
                        arg += leader;
                    }
                    endFlag = 0;
                    arg += next;
                }

                this.state.catcodeDB = ccdb;

                return [arg];
            },

            fn: function(args){
                return '\\[' + args[0] + '\\]';
            }
        },

        /* These commands are not TeX or LaTeX standards
         * They are provided by the DiscoTeX package.
         */

        'dtcollapse' : { args: '',
            fn: function(){
                this.state.setEnvironmentData(this.state.getEnvironmentID(), 'collapsible');
                return '';
            }
        },
        'dtnocollapse' : '',
        'dtstartcollapsed' : { args: '',
            fn: function(){
                this.state.setEnvironmentData(this.state.getEnvironmentID(), 'start-collapsed');
                return '';
            }
        },
        'BibTeX' : '\\(\\mathrm{Bib\\TeX}\\)',
        'DiscoTeX' : '\\(\\mathrm{Disco\\TeX}\\)',
        'ifdisco' : { args: 'NN',
            fn: function(args){
                //FIXME make it so the second parameter's errors are ignored
                //Maybe do this with a coroutine and suspending warning logs between the second parameter?
                return args[0];
            }

        }
    };

        DT.Env = {
            'abstract' : {
                begin: function(){
                    return '<dt-abstract>';
                },

                end: function(){
                    return '</dt-abstract>';
                }
            },

            'description' : {
                internalParagraphs: false,
                begin: function(){
                    return '<dl class="dl-horizontal">';
                },
                end: function(e){
                    var output = '</dl>';
                    if(e.itemCount !== 0){
                        output = '</dd>\n' + output;
                    }
                    return output;
                },
                item: function(count){
                    var opt = this.getOptionalArgument();
                    if(typeof(opt) === 'undefined'){
                        opt = '';
                    }

                    if(count === 1){
                        return '<dt>' + opt + '</dt>\n<dd>';
                    }
                    else{
                        return '</dd>\n<dt>' + opt + '</dt>\n<dd>';
                    }
                }
            },

            'center' : {
                internalParagraphs: false,
                begin: function(){
                    return '<div style="text-align:center;">';
                },
                end: function(){
                    return '</div>';
                }
            },

           'document' : {
                begin: function(eid){
                    return this.setDisplay(true) + '<!--TOC-->\n<div class="col-md-6" role="main">';
                },
                end: function(){
                    return '</div>' + this.setDisplay(false);
                }
            },

            'enumerate' : {
                internalParagraphs: false,
                begin: function(){
                    return '<ol>';
                },
                end: function(e){
                    var output = '</ol>';
                    if(e.itemCount > 0){
                        output = '</li>\n' + output;
                    }
                    return output;
                },
                item: function(count){
                    if(count === 1){
                        return '<li>';
                    }
                    else{
                        return '</li>\n<li>';
                    }
                }
            },

            'equation' : {
                parse: function(eid, args, content){
                    var labelRegExp = new RegExp('\\\\label{(.+)}');
                    var labelMatch = content.match(labelRegExp);
                    var tagRegExp = new RegExp('\\\\tag{(.+)}');
                    var tagMatch = content.match(tagRegExp);
                    /* Because we can look at the internals of the entire equation environment,
                     * we can actually get the label here. This means that we don't need to
                     * register the label with the parser state, or put in a back-reference, or
                     * anything else fancy. We can just insert it now as is.
                     *
                     * This is maybe a little dangerous, because we're working with a special
                     * case. If this turns out to be ugly, we'll go back and do it in the
                     * consistent way: with back-references.
                     */
                    var output = '<dt-equation'
                    if(labelMatch !== null){
                        output += ' label="' + labelMatch[1] + '"';
                    }
                    if(tagMatch !== null){
                        output += ' tag="' + tagMatch[1] + '"';
                    }
                    output += '>' + content.replace(labelRegExp, '').replace(tagRegExp, '');
                    return output + '</dt-equation>';
                }
            },

            'eqnarray' : {
                parse: function(eid, args, content){
                    this.logWarning('According to the LaTeX2e standard, you should not be using the eqnarray environment');
                    return 'MATHJAX'; //FIXME
                }
            },

            'eqnarray*' : {
                parse: function(eid, args, content){
                    this.logWarning('According to the LaTeX2e standard, you should not be using the eqnarray* environment');
                    return 'MATHJAX'; //FIXME
                }
            },

            'flushleft' : {
                begin: function(){
                    return '<div style="text-align:left;">';
                },
                end: function(){
                    return '</div>';
                }
            },

            'flushright' : {
                //FIXME for whatever reason this doesn't right align things the way it's supposed to
                begin: function(){
                    return '<div class="text-align:right;">';
                },
                end: function(){
                    return '</div>';
                }
            },


            'itemize' : {
                internalParagraphs: false,
                begin: function(){
                    return '<ul>';
                },
                end: function(e){
                    var output = '</ul>';
                    if(e.itemCount > 0){
                        output = '</li>\n' + output;
                    }
                    return output;
                },
                item: function(count){
                    if(count === 1){
                        return '<li>';
                    }
                    else{
                        return '</li>\n<li>';
                    }
                }
            },

            'quote' : {
                begin: function(eid){
                    return '<blockquote>';
                },
                end: function(eid){
                    return '</blockquote>';
                }
            },

            'quotation' : {
                begin: function(eid){
                    return '<blockquote class="indent">';
                },
                end: function(eid){
                    return '</blockquote>';
                }
            },

            'tabular' : {
                args: 'ON',
                internalParagraphs: false,
                begin: function(eid){
                    this.state.setEnvironmentData(eid, 'cmd', {'\\' : DT.getCmd('\\'), 'hline' : DT.getCmd('hline') });

                    //FIXME this should be a call to DT.setCmd
                    DT.Cmd['\\'] = '</td></tr>\n<tr><td>';
                    DT.Cmd['hline'] = ''; //FIXME should i really ignore this?

                    return '<table class="table table-hover">\n<tr>\n<td>';
                },
                end: function(eid){
                    //FIXME this should be a call to DT.setCmd
                    DT.Cmd['\\'] = this.state.getEnvironmentData(eid, 'cmd')['\\'];
                    DT.Cmd['hline'] = this.state.getEnvironmentData(eid, 'cmd')['hline'];

                    return '</td></tr></table>';
                },
                align: function(colNumber){
                    return '</td><td>';
                }

            },

            'thebibliography' : {
                /* This argument is the width of the widest label, which TeX
                 * uses to deal with spacing. HTML makes spacing easier, so
                 * we simply read this argument and completely ignore it.
                 */
                args: 'N',
                internalParagraphs: false,
                begin: function(eid, args){
                    return '<dt-bibliography>';
                },

                end: function(){
                    return '</dt-bibliography>';
                }
            },

            'titlepage' : {
                args: '',
                begin: function(eid){
                    return '<dt-titlepage>';
                },
                end: function(){
                    return '</dt-titlepage>';
                }
            },

            'verse' : {
                args: '',
                begin: function(eid){
                    return '<dt-verse>';
                },
                end: function(){
                    return '</dt-verse>';
                }
            },

            'verbatim' : {
                internalParagraphs: false,
                parse: function(eid, args, content){
                    return '<pre>' + content.replace(/&(?!(?:g|lt))/g, '&amp;').trim() + '</pre>';
                }
            }
    };
})(window.DiscoTeX = window.DiscoTeX || {});
