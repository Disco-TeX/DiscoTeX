(function(DT){
    DT.Parser = function(tex, modDate){
        /* As we read through the source, we will need to access certain data.
         * For instance, what the category code for each character is, or a
         * stack of the environments we are currently in. This data is
         * encapsulated in a State object.
         */
        this.state = new DT.State();
        this.state.lastModified = modDate;

        /* We of course also need a stream of TeX. That stream which we can
         * request tokens from. That stream will need to know about the parser
         * state, because how it parses depends on the category codes, among
         * other things. We'll pass in the string containing the TeX, as well
         * as a reference to the parsers state.
         */
        this.stream = new DT.TeXStream(tex, this.state);

        /* Rather than logging compilation warnings and errors to the console,
         * we will keep track of them ourselves, so we can display them
         * wherever we choose. This may end up being the console, but it could
         * also be in an in-browser compiler.
         */
        this.errs = [];
        this.warnings = [];
    }

    DT.Parser.prototype = {
        logError: function(err){ this.errs.push(err); },
        logWarning: function(w){ this.warnings.push(w); },

        pushScope: function(){
            this.state.pushScope();
        },

        popScope: function(){
            var output = '';
            var defers = this.state.getScope().defer;
            while(defers.length > 0){
                output += defers.pop();
            }

            this.state.popScope();
            return output;
        },

        getOptionalArgument: function(){
            var nextTk = this.stream.peek();
            if(nextTk.token === '['){
                //option provided but we didn't consume
                //the '[', consume it now.

                var opt = '';
                while(nextTk.token !== ']'){
                    nextTk = this.stream.next();
                    opt += this.parseOne(nextTk, false);
                }

                //opt will always end with a ]
                //slice off the last character
                return opt.slice(1, -1);
            }
            else{
                return undefined;
            }
        },

        getNormalArgument: function(){
            var nextTk = this.stream.next();
            if(typeof(nextTk) === 'undefined'){
                this.logError('Not enough arguments provided');
                return null;
            }

            //false takes the place of doParagraphCheck.
            //FIXME is this always correct? I'm far from convinced.
            return this.parseOne(nextTk, false)
        },

        getAllArguments: function(cmdName, args){
            var argList = [];

            for(var i = 0; i < args.length; ++i){
                argType = args[i];
                if(argType === 'N' || argType === 'n'){
                    var normalArg = this.getNormalArgument();
                    if(normalArg === null){
                        break;
                    }

                   argList.push(normalArg);
                }
                else if(argType === 'O' || argType === 'o'){
                    argList.push(this.getOptionalArgument());
                }
                else{
                    /* If you're code gets to this section, the user did not provide an 'N' or an 'O'
                     * for this argument option. We log the error in the console, because it's not a
                     * problem with TeX, but with the provided package. As for error  recovery, we
                     * supply this argument as the empty string.
                     */
                    console.error('Invalid argument type "' + argType + '" found in command named "' + cmdName + '".');
                    argList.push('');
                    return;
                }
            }
            return argList;
        },


        parseCommand: function(tk, doParagraphCheck){
            /* Get the command with the same name as the token. If the command
             * doesn't exist, then this function will assign the default command
             * to the variable cmd, so we can still do something sensible.
             */
            var cmd = DT.getCmd(tk.token);

            /* If the command is just a string, this means we have there is
             * some string replacement we need to make in the HTML. For
             * example, '\copyright' needs to be replaced with '&copy;'.
             * Just returning the string is almost correct. We actually need
             * to check if we need to start a new paragraph. By default, if
             * just a string is given, it should be in a paragraph, so we
             * only need to check if we need to start a new paragraph.
             */
            if(typeof(cmd) === 'string'){
                return (doParagraphCheck ? this.checkParagraph() : '') + cmd;
            }

            /* Take a look at the provided arguments. These can come in one
             * of two flavors. Either, it is a string of characters ('N' or
             * 'O'), or it is a function.
             */
            var args = cmd.args;
            var argList = [];

            if(typeof(args) === 'string'){
                /* In the first case, the character 'N' dictates that an argument
                 * should be read normally. The 'O' dictates that the argument is
                 * optional. If it exists, it must be surrounded by square brackets
                 * These arguments are read in and supplied to the argList variable
                 * for later use by the command.
                 */
                argList = this.getAllArguments(tk.token, args);
            }
            else if(typeof(args) === 'function'){
                /* If the command arguments is a function, we delegate the
                 * responsibility of filling argList to it.
                 */
                argList = args.call(this);
            }
            else{
                /* If you're code gets to this section, the user did not provide a
                 * valid argument option (either a string , or a function). We log
                 * the error on the console, because it's not a problem with the
                 * provided TeX, but with the provided package. As for error recovery,
                 * we supply an empty argument list.
                 */
                console.error('The provided argument parameter for the command "' + tk.token + '" is not allowed.');
                argList = [];
            }

            /* Now that all of the arguments have been read and assigned to the argList
             * variable we are ready to send them to the command. The command must be a
             * function. Some constructions are simple, and essentially boil down to
             * building a string from some formatting of the arguments. These are typically
             * defined with functions. Others do complicated things with the state of the
             * parser. Some need to send data and then afterwards make changes to the state.
             * We use function generators for these.
             */

            var output = '';
            if(typeof(cmd.fn) === 'function'){
                output = cmd.fn.call(this, argList);
            }
            else{
                /* If you're code gets to this section, the user provided not a funciton.
                 * This should be an error logged in the console. As for error recovery,
                 * the command and its parameters are ignored.
                 */
                console.error('The provided function parameter for the command "' + tk.token + '" is not a function.');
                output = '';
            }

            /* Lastly, rather than just returning the output, we need to know if we should
             * be inside a paragraph tag or not.
             */
            if(!this.state.ignoreParagraphs){
                var cmdInPar = cmd.inParagraph;
                if(typeof(cmdInPar) === 'undefined'){
                    cmdInPar = true;
                }
                if(this.state.paragraph.inside && !cmdInPar){
                    return this.endParagraph() + output;
                }
            }

            return output;
        },

        readUntil: function(endCondition){
            if(typeof(endCondition) === 'undefined'){
                //FIXME should I add a warning here?
                return '';
            }

            var output = '';
            var streamOutput = this.stream.next();

            var tk = streamOutput;

            while((streamOutput !== null) && (output.match(new RegExp(endCondition + '$')) === null)){
                if(tk.catcode === DT.CATCODE.ESC){
                    output += tk.leader + tk.token;
                }
                else{
                    output += tk.token;
                }

                tk = this.stream.next();

                if(streamOutput.done){
                    this.logError('Read until end of stream without finding the end condition');
                    break;
                }
            }

            return output;

        },

        parseMathShift: function(){
            //delegate to mathjax
            var math = '';

            var streamOutput = this.stream.next();

            var tk = streamOutput;

            while((streamOutput !== null) && tk.catcode !== DT.CATCODE.MATH_SHIFT){
                if(tk.catcode === DT.CATCODE.ESC){
                    math += tk.leader + tk.token;
                }
                else{
                    math += tk.token;
                }

                tk = this.stream.next();

                if(streamOutput.done){
                    this.logError('Read until end of stream without finding a matching math-shift token');
                    break;
                }
            }

            return '\\(' + math + '\\)';
        },

        endParagraph: function(){
            /* This function unilateraly ends the paragraph if you are
             * inside of one. It sets all the necessary state flags to
             * what they need to be.
             */
            if(this.state.paragraph.ignore|| !this.state.paragraph.inside){
                return '';
            }

            this.state.paragraph.inside = false;
            this.state.paragraph.lastWasEOL = false;
            this.state.paragraph.seenNonEOL = false;
            return '</p>\n\n';
        },

        checkParagraph: function(){
            /* We need to check if we should place <p> at the beginning
             * of this parse-item. This depends on the values of the
             * state flags "inside" and "seenNonEOL".
             *
             * Regardless of what we end up returning, we know that we're
             * about to include some honest-to-goodness content, so we
             * definitely want to set "seenNonEOL" to true just before
             * we return. Moreove, we want to set "lastWasEOL" to false
             * for the same reason.
             */
            this.state.paragraph.lastWasEOL = false;

            /* If we're in a paragraph (paragraph.inside == true) but haven't
             * seen any non-EOL characters yet (seenNonEOL == false), then we
             * need to start a new <p> tag, because we're about to see some
             * real content.
             *
             * Another possibility is that we are not in a paragraph, but are
             * about to start one. These two cases are taken care of in the
             * following conditional:
             */
            if(this.state.paragraph.ignore){
                return '';
            }
            if(!this.state.paragraph.inside || !this.state.paragraph.seenNonEOL){
                this.state.paragraph.inside = true;
                this.state.paragraph.seenNonEOL = true;
                return '<p>';
            }
            else{
                this.state.paragraph.seenNonEOL = true;
                return '';
            }
        },

        parseOne: function(tk, doParagraphCheck){
            /* The very first thing we need to check is whether or not the
             * paragraph has been actually started. Of course, we don't
             * need to check it if we're looking at an EOL or a comment
             *
             * However, if we some commands should be dealt with outside
             * of a paragraph. Commands have flags telling us about that.
             * We deal with those inside the parseCommand function.
             */

            if(typeof(doParagraphCheck) === 'undefined'){
                doParagraphCheck = false;
            }

            var pcheck = '';
            if(!this.state.paragraph.ignore
               && doParagraphCheck
           && tk.catcode !== DT.CATCODE.EOL
           && tk.catcode !== DT.CATCODE.COMMENT
           && tk.catcode !== DT.CATCODE.ESC
           && tk.catcode !== DT.CATCODE.SPACE){
                pcheck = this.checkParagraph();
            }

            if(tk.catcode === DT.CATCODE.ESC){
                return this.parseCommand(tk, doParagraphCheck);
            }
            else if(tk.catcode === DT.CATCODE.BEGIN_GROUP){
                this.pushScope();
                return pcheck + this.parseAll(doParagraphCheck);
            }
            else if(tk.catcode === DT.CATCODE.END_GROUP){
                return {ending: pcheck + this.popScope(), scopeFinished: true};
            }
            else if(tk.catcode === DT.CATCODE.MATH_SHIFT){
                return pcheck + this.parseMathShift();
            }
            else if(tk.catcode === DT.CATCODE.ALIGN_TAB){
                return DT.getEnv( this.state.getEnvironment().name ).align();
            }
            else if(tk.catcode === DT.CATCODE.EOL){
                /* We need to check if starting a new paragraph is appropriate.
                 * This is denoted in TeX by the presence of \n\n. First of all,
                 * if we are not currently in a paragraph, or have been directed
                 * to ignore a paragarph, there is no need to do anything.
                 */
                if(this.state.paragraph.ignore || !this.state.paragraph.inside){
                    return '\n';
                }

                /* Otherwise, we need to add a new paragraph if the last
                 * character was an EOL character. We take care of this by also
                 * remembering in the state a flag "lastWasEOL", and setting
                 * it to true or false, depending on the circumstance.
                 * If it was false, then we set it to true, because we are
                 * currently looking at an EOL character. Because we
                 * don't want to start a new paragraph in this situation, we
                 * simply return
                 */
                if(!this.state.paragraph.lastWasEOL){
                    this.state.paragraph.lastWasEOL = true;
                    return '\n';
                }
                /* If the last character was an EOL character, and we
                 * are in a paragraph, we still need to know if we have seen
                 * any non-EOL characters since the last paragraph ended. We
                 * have a state variable for this as well: "seenNonEOL"
                 */
                if(!this.state.paragraph.seenNonEOL){
                    return '\n';
                }
                /* If you get past all of the above checks, then you've seen
                 * real content (i.e., the paragraph that you want to end has
                 * actually started). Thus, we can really end the paragraph,
                 * and update the flags.
                 */

                this.state.paragraph.seenNonEOL = false;
                this.state.paragraph.lastWasEOL = true;
                this.state.paragraph.inside = false;
                return '</p>\n\n';
            }
            else if(tk.catcode === DT.CATCODE.SPACE){
                return ' ';
            }
            else if(tk.catcode === DT.CATCODE.COMMENT){
                var madeReplacement = false;
                var newComment = tk.token.replace(/-->/g, '==>');
                if(newComment !== tk.token){
                    this.logWarning('Comment contained "-->". It was replaced by "==>" to avoid ending the html comment.');
                }

                /* This may be bad form, but it is important that comments are
                 * generated with spaces following them. Aside from the fact that
                 * it makes them easier to read, it guarantees that the user
                 * cannot possibly write TeX that generates "<!--STUFF-->", where
                 * STUFF starts and ends without spaces. Therefore, we can use
                 * these strings to leave spaces in our document so that back
                 * references and other such things can be inserted.
                 */
                return '<!-- ' + newComment + ' -->';
            }
            else{
                return pcheck + tk.token;
            }

            return;
        },

        parseAll: function(doParagraphCheck){
            var outputHTML = '';
            //run through all tokens in the stream
            var tk = this.stream.next();
            while(!this.stream.eof()){
                var tokenOutput = this.parseOne(tk, doParagraphCheck);
                if(typeof(tokenOutput.scopeFinished) === 'undefined'){
                    outputHTML += tokenOutput;
                }
                else if(tokenOutput.scopeFinished){
                    return outputHTML + tokenOutput.ending;
                }
                else{
                    console.error('Sanity check: This should never happen');
                }
                tk = this.stream.next();
            }

            return outputHTML;
        },

        parse: function(){
            /* First, parse the whole document */
            var parsedString = this.parseAll(true);

            if(typeof(this.state.documentClass) === 'undefined'){
                this.logError('No document class provided. Continuing with class "article".');
                /* To recover from this error, we assume the user meant
                 * to make the document class "article."
                 */
                this.state.documentClass= DT.classes['article'];
            }

            var intermediateHTML = this.state.documentClass.replace('<!--DOCUMENT-->', parsedString);

            var arr = intermediateHTML.split(/<!--([^ ][^>]*[^ ])-->/g);
            var outputHTML = '';

            var display = false;
            for(var i = 0; i < arr.length; ++i){
                if(i % 2 === 0){
                    if(display){
                        outputHTML += arr[i];
                    }
                    continue;
                }

                if(arr[i] === 'display=false'){
                    display = false;
                }
                else if(arr[i] === 'display=true'){
                    display = true;
                }
                else if(display){
                    if(arr[i] === 'TOC' && this.state.hasTOC){
                        outputHTML += '<dt-sidebar></dt-sidebar>';
                    }
                    else if(arr[i].substr(0, 4) === 'lbl:'){
                        var lbl = this.state.labels[ arr[i].substr(4) ];
                        if(typeof(lbl) !== 'undefined'){
                            outputHTML += ' label="' + lbl + '"';
                        }
                    }
                    else if(arr[i].substr(0, 6) === 'envid:'){
                        //FIXME this substring maybe should be scrubbed?
                        var data = this.state.environmentData[parseInt(arr[i].substr(6))];

                        outputHTML += data.attr.join(' ');
                        //FIXME we also need to deal with the pairs
                    }
                }
            }

            return this.tabify(outputHTML);
        },

        tabify: function(doc){
            var tabCounter = 0;
            var tabs = '   '; //FIXME move this to a Parser variable
            var avoidVerbatim = doc.split(/(<pre>(?:.|\n)*<\/pre>)/g);
            for(var i = 0; i < avoidVerbatim.length; i ++){
                if(i % 2 === 1) continue; //skip over <pre>...</pre> tags

                var piece = avoidVerbatim[i];
                piece = piece.replace(/\n\s*<\/(p|li)>/g,'</$1>'); //put </p> and </li> on the same line
                piece = piece.replace(/\n\s*/g,'\n'); //remove all starting whitespace
                var arr = piece.split(/((?:-->)|(?:<\/?)|\n)|\n/g); //FIXME figure out what this regex is
                piece = [];
                arr.forEach(function(el){
                    if(el === '\n'){
                        piece.push('\n');
                        for(var i = 0; i < tabCounter; ++i){
                            piece.push(tabs);
                        }
                        return;
                    }
                    else if(el === '<'){
                        ++tabCounter;
                    }
                    else if (el === '</' || el === '-->'){
                        --tabCounter;
                        var x = piece.pop();
                        if(x !== tabs){
                            piece.push(x);
                        }
                    }
                    piece.push(el);
                });
                avoidVerbatim[i] = piece.join('');
            }

            return avoidVerbatim.join('');
        },
//           //do some cleanup
//            outputHTML = outputHTML.replace(/\n\s*<\/(p|li)>/g,'</$1>').replace(/\n\s*/g,'\n');
//
//                //tabify
//                var tabCounter = 0;
//                arr = outputHTML.split(/((?:-->)|(?:<\/?)|\n)|\n/g);
//                outputHTML = [];
//                var tabs = '    ';
//                arr.forEach(function(el){
//                    if(el === '\n'){
//                        outputHTML.push('\n');
//                        for(var i = 0; i < tabCounter; ++i){
//                            outputHTML.push(tabs);
//                        }
//                        return;
//                    }
//                    if(el === '<'){
//                        ++tabCounter;
//                    }
//                    else if(el === '</' || el === '-->'){
//                        --tabCounter;
//                        var x = outputHTML.pop();
//                        if(x !== tabs){
//                            outputHTML.push(x);
//                        }
//                    }
//                    outputHTML.push(el);
//                });
//
//                return outputHTML.join('');
//
//        },

        setDisplay: function(b){
            //safety first
            if(b === true){
                return '<!--display=true-->';
            }
            if(b === false){
                return '<!--display=false-->';
            }
        }
    };

})(window.DiscoTeX = window.DiscoTeX || {});
