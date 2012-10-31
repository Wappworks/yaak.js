var YAAK = YAAK || {};

(function() {
    "use strict";

    // Constants
    // ---------------------------------------

    // Private
    // ---------------------------------------
    function loopCb( audioEvent ) {
        var audioInst = audioEvent.target;

        audioInst.currentTime = 0;
        audioInst.play();
    }

    // Child classes
    // ---------------------------------------
    /**
     * Audio instance extension prototype
     * @extends HTMLMediaElement
     * @constructor
     */
    function AudioExt()         {}
    AudioExt.prototype = {
        /** @private */
        volPrimary:     1,
        /** @private */
        volSecondary:   1,
        /** @private */
        loopedManually: false,

        /**
         * Set all the volumes
         *
         * @param {Number}  volPrimary
         * @param {Number}  volSecondary
         *
         * @returns this
         */
        setGlobalVolume: function( volPrimary, volSecondary ) {
            this.volPrimary     = volPrimary;
            this.volSecondary   = volSecondary;
            this.volume         = this.volPrimary * this.volSecondary;

            return this;
        },

        /**
         * Set the primary volume
         *
         * @param {Number}  vol
         *
         * @returns this
         */
        setPrimaryVolume: function( vol ) {
            if( this.volPrimary === vol )
                return this;

            this.volPrimary = vol;
            this.volume = this.volPrimary * this.volSecondary;

            return this;
        },

        /**
         * Set the secondary volume
         *
         * @param {Number}  vol
         *
         * @returns this
         */
        setSecondaryVolume: function( vol ) {
            if( this.volSecondary === vol )
                return this;

            this.volSecondary = vol;
            this.volume = this.volPrimary * this.volSecondary;

            return this;
        },

        /**
         * Sets the instance to loop
         * @param {Boolean} looped
         *
         * @returns this
         */
        setLooped: function (looped ) {
            if( YAAK.PLATFORM.hasNativeAudioLoop() ) {
                this.loop = looped;
                return this;
            }

            if( looped ) {
                if( !this.loopedManually )
                    this.addEventListener( "ended", loopCb, false );

            } else {
                if( this.loopedManually )
                    this.removeEventListener( "ended", loopCb, false );
            }

            this.loopedManually = looped;
            return this;
        }
    };

    // Export
    // ---------------------------------------
    YAAK.AUDIOEXT = {
        /**
         * Instantiates an extended HTML5AudioElement
         *
         * @returns {AudioExt}
         */
        instantiate: function() {
            var inst = document.createElement('audio');
            YAAK.Object.mix( inst, AudioExt.prototype );

            return inst;
        }
    };
})();
