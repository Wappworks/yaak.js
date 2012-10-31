var YAAK = YAAK || {};

(function() {
    "use strict";

    // Private
    // ----------------------------------------------

    // Exports
    // ----------------------------------------------
    //noinspection JSValidateJSDoc
    YAAK.Object = {

        /**
         *  Mix the source object into the target object
         *
         *  @param  {Object}    target
         *  @param  {Object}    source
         *
         *  @returns {Object}  The target object
         */
        mix: function( target, source ) {
            var key;

            for( key in source ) {
                if( !source.hasOwnProperty(key) )
                    continue;

                // Don't overwrite existing fields in the target
                if( target.hasOwnProperty(key) )
                    continue;

                target[ key ] = source[ key ];
            }

            return target;
        },

        /**
         *  Extend a class with a super class
         *
         *  @param  {Function}  subclass
         *  @param  {Function}  superclass
         *
         *  @returns    {Function}  The extended class
         */
        extend: function( subclass, superclass ) {
            var subClassProto,
                protoDef,
                protoInst,
                key;


            // Instantiate the prototype...
            subClassProto = subclass.prototype;
            protoDef = function(){};
            protoDef.prototype = superclass.prototype;

            if( superclass.prototype.constructor != superclass )
                superclass.prototype.constructor = superclass;

            subclass.prototype = protoInst = new protoDef();
            subclass.prototype.constructor = subclass;
            subclass.superclass = superclass.prototype;

            for( key in subClassProto ) {
                if( subClassProto.hasOwnProperty(key) )
                    protoInst[key] = subClassProto[key];
            }

            return subclass;
        }
    };
})();