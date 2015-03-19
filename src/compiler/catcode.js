(function(DT){
    /* A list of category codes (catcodes) used it TeX
     * stored as an enum. In TeX, the values are 0-15.
     * Instead, we use 1-16 to avoid messy situations
     * where Javascript thinks 0 and null are the same
     * when compared with the == operator. Thus, in our
     * implementation, catcodes are all one higher than
     * in standard TeX. This shouldn't matter anyway,
     * because catcodes should always be accessed through
     * their enumearted names. I.e, DiscoTeX.CATCODE.ESC,
     * rather than the number 1.
     */
    DT.CATCODE = Object.freeze({
        ESC: 1,                 // Begins a command. '\' by default
        BEGIN_GROUP: 2,         // '{' by default
        END_GROUP: 3,           // '}' by default
        MATH_SHIFT: 4,          // Toggles inline mathmode. '$' by default
        ALIGN_TAB: 5,           // '&' by default
        EOL: 6,                 // End of line character. '\n' by default
        PARAM: 7,               // Parameter to function definitions. '#' by default
        SUPERSCRIPT: 8,         // '^' by default
        SUBSCRIPT: 9,           // '_' by default
        IGNORED: 10,            // Characters to ignore. None set by default
        SPACE: 11,              // '\t' and ' ' by default
        LETTER: 12,             // a-z and A-Z by default
        OTHER: 13,              // Everything not listed above or below
        ACTIVE: 14,             // '~' by default. FIXME I'm not sure what this is.
        COMMENT: 15,            // '%' by default
        INVALID: 16,            // No such characters in this implementation

        /* The defaults listed above are encoded here */
        default: function(ch){
            if(ch === '\\') return DT.CATCODE.ESC;
            else if(ch === '{') return DT.CATCODE.BEGIN_GROUP;
            else if(ch === '}') return DT.CATCODE.END_GROUP;
            else if(ch === '$') return DT.CATCODE.MATH_SHIFT;
            else if(ch === '&') return DT.CATCODE.ALIGN_TAB;
            else if(ch === '\n') return DT.CATCODE.EOL;
            else if(ch === '#') return DT.CATCODE.PARAM;
            else if(ch === '^') return DT.CATCODE.SUPERSCRIPT
            else if(ch === '_') return DT.CATCODE.SUBSCRIPT;
            else if(ch === '') return DT.CATCODE.IGNORED;
            else if(ch === ' ' || ch === '\t') return DT.CATCODE.SPACE;
            else if(ch.match(/[a-zA-Z]/) !== null) return DT.CATCODE.LETTER;

            else if(ch === '~') return DT.CATCODE.ACTIVE;
            else if(ch === '%') return DT.CATCODE.COMMENT;
            //The delete character is the only character with default catcode 15. Can this even appear in a JS string?

            else return DT.CATCODE.OTHER; //other character
        }
    });
})(window.DiscoTeX = window.DiscoTeX || {});
