var YAAK = YAAK || {};

(function () {
    "use strict";

    var kChannelsMaxDefault;

    // Constants
    // ---------------------------------------
    kChannelsMaxDefault = 4;

    // Private
    // ---------------------------------------

    // Child classes
    // ---------------------------------------
    /**
     * Handle for a playing Channel
     * @constructor
     */
    function Handle()    {}
    Handle.prototype = {
        soundId: undefined,

        /** @private */
        channel: null,
        /** @private */
        audioInst: null,
        /** @private */
        playId: 0,

        /**
         * Initialize the instance
         *
         * @param {Number|String}           soundId
         * @param {AudioChannel}            channel
         * @param {HTMLMediaElement}        audioInst
         *
         * @returns this
         */
        init: function( soundId, channel, audioInst ) {
            this.soundId    = soundId;
            this.channel    = channel;
            this.audioInst  = audioInst;
            this.playId     = audioInst.playId;
            return this;
        },

        /**
         * Set the instance volume
         *
         * @param   {Number}    vol
         *
         * @returns this
         */
        setVolume: function( vol ) {
            var audioInst = this.audioInst;
            if( audioInst == null )
                return this;

            if( audioInst.playId != this.playId ) {
                this.audioInst = null;
                return this;
            }

            audioInst.setSecondaryVolume( Math.max(0, Math.min( 1, vol )) );

            return this;
        },

        /**
         * Stops the instance playback
         *
         * @returns this
         */
        stop: function() {
            var audioInst = this.audioInst;

            if( audioInst == null )
                return this;

            if( audioInst.playId == this.playId )
                this.channel.endSound( audioInst );

            this.audioInst = null;

            return this;
        },

        /**
         * Returns true if the instance playback has ended
         *
         * @returns {Boolean}
         */
        isEnded: function() {
            var audioInst = this.audioInst;

            if( audioInst == null )
                return true;

            return audioInst.playId != this.playId;
        }
    };

    // Export
    // ---------------------------------------
    /**
     * Audio channel
     * @constructor
     *
     * @return {*}
     */
    function AudioChannel() {
        return this;
    }

    AudioChannel.Handle = Handle;

    AudioChannel.prototype = {
        active:             false,
        cache:              null,

        mute:               false,
        volume:             1,

        /** @private */
        playId:             1,

        /** @private */
        cbEndOneShot:       null,

        /** @private */
        soundInactive:      null,
        /** @private */
        soundActive:        null,

        /**
         * Initialize the instance
         *
         * @param {Number}          [channelsMax]
         * @param {YAAK.AudioCache}  [audioCache]
         *
         * @returns this
         */
        init: function( channelsMax, audioCache ) {
            var channelIndex,
                soundInst;

            this.active = YAAK.PLATFORM.canPlayAudio();

            // Not active? We're done...
            if( !this.active )
                return this;

            if( typeof channelsMax  !== "number" )
                channelsMax = kChannelsMaxDefault;

            if( audioCache == null )
                audioCache = new YAAK.AudioCache();

            this.cache          = audioCache;
            this.soundInactive  = [];
            this.soundActive    = [];

            // Create the end one shot audio callback...
            this.cbEndOneShot = (function( inst ){
                return function(audioEvent) {
                    inst.endSound( audioEvent.target );
                };
            })(this);

            for( channelIndex = 0; channelIndex < channelsMax; channelIndex++ ) {
                soundInst = YAAK.AUDIOEXT.instantiate();

                // Code to handle stalls
                soundInst.addEventListener( "stalled", function(event) {
                    event.target.load();
                } );

                this.soundInactive.push( soundInst );
            }

            return this;
        },

        /**
         * Set the audio cache
         *
         * @param   {YAAK.AudioCache}        cache
         *
         * @returns  this
         */
        setAudioCache: function( cache ) {
            if( cache == null )
                cache = new YAAK.AudioCache();

            this.cache = cache;

            return this;
        },

        /**
         * Set the layer volume
         *
         * @param {Number}  volume
         *
         * @return this
         */
        setVolume: function( volume ) {
            var actives = this.soundActive,
                activeNum, activeIndex;

            // Not active? We're done...
            if( !this.active )
                return this;

            volume = Math.max( 0, Math.min(1, volume) );
            if( this.volume === volume )
                return this;

            this.volume = volume;

            if( this.mute || actives == null )
                return this;

            for( activeNum = actives.length, activeIndex = 0; activeIndex < activeNum; activeIndex++ )
                actives[ activeIndex ].setPrimaryVolume( volume );

            return this;
        },

        /**
         * Stops all sounds
         *
         * @return this
         */
        stop: function() {
            var actives = this.soundActive,
                inActives = this.soundInactive,
                activeNum, activeIndex,
                activeCurr;

            // Not active? We're done...
            if( !this.active )
                return this;

            for( activeNum = actives.length, activeIndex = 0; activeIndex < activeNum; activeIndex++ ) {
                activeCurr = actives[ activeIndex ];
                this.resetChannel( activeCurr );
                inActives.push( activeCurr );
            }

            this.soundActive = [];

            return this;
        },

        /**
         * Enabled/disables mute
         *
         * @param {Boolean}  mute
         *
         * @return this
         */
        setMute: function( mute ) {
            var appliedVolume = this.volume,
                actives = this.soundActive,
                activeNum, activeIndex;

            // Not active? We're done...
            if( !this.active )
                return this;

            if( this.mute == mute )
                return this;

            this.mute = mute;

            if( mute )
                appliedVolume = 0;

            for( activeNum = actives.length, activeIndex = 0; activeIndex < activeNum; activeIndex++ )
                actives[ activeIndex ].setPrimaryVolume( appliedVolume );

            return this;
        },

        /**
         * Plays a one shot sound
         *
         * @param {Number|String}       id
         * @param {Number}              [vol]
         * @param {Boolean}             [alwaysPlay]
         *
         * @returns {AudioChannel.Handle}
         */
        playOneShot : function( id, vol, alwaysPlay ) {
            var handle = new AudioChannel.Handle(),
                soundInactive = this.soundInactive,
                targetAudio,
                soundCurr;

        
            // Not active? We're done...
            if( !this.active ) {
                 YAAK.Debugger.log("Did not playOneShot: "  + id + " due to the channel being inactive");
                return handle;
            }
            
            if( this.mute ) {
            	YAAK.Debugger.log("Did not playOneShot: " + id + " due to the channel being on mute");
                return handle;
            }
            
            targetAudio = this.cache.getAudioElement( id );
            if( targetAudio == null ) {
            	YAAK.Debugger.log("Could not find the audio element for: " + id)
                return handle;
            }

            if( soundInactive.length <= 0 ) {
                // If we allow for always play, end the oldest channel..
                if( alwaysPlay )
                    this.endSound( this.soundActive[0] );
                else
                    return handle;
            }

            soundCurr = soundInactive.shift();
            soundCurr.playId = this.playId++;
            soundCurr.setGlobalVolume( this.volume, vol == null ? 1 : vol );
            soundCurr.addEventListener( "ended", this.cbEndOneShot, false );

            soundCurr.src = targetAudio.src;
            soundCurr.play();
            this.soundActive.push( soundCurr );
            YAAK.Debugger.log("Currenting playing (one shot): " + id);
            handle.init( id, this, soundCurr );
            return handle;
        },

        /**
         * Plays a looped sound
         *
         * @param {Number|String}       id
         * @param {Number}              [vol]
         * @param {Boolean}             [alwaysPlay]
         *
         * @returns {AudioChannel.Handle}
         */
        playLooped : function( id, vol, alwaysPlay ) {
            var handle = new AudioChannel.Handle(),
                soundInactive = this.soundInactive,
                targetAudio,
                soundCurr;
             // Not active? We're done...
            if( !this.active ) {
                 YAAK.Debugger.log("Did not playLooped "  + id + " due to the channel being inactive");
                return handle;
            }

             targetAudio = this.cache.getAudioElement( id );
            if( targetAudio == null ) {
                YAAK.Debugger.log("Could not find the audio element for: " + id)
                return handle;
            }

            if( soundInactive.length <= 0 ) {
                // If we allow for always play, end the oldest channel..
                if( alwaysPlay )
                    this.endSound( this.soundActive[0] );
                else
                    return handle;
            }

            soundCurr = soundInactive.shift();
            soundCurr.playId = this.playId++;
            soundCurr.setGlobalVolume( this.mute ? 0 : this.volume, vol == null ? 1 : vol );
            soundCurr.setLooped( true );

            soundCurr.src = targetAudio.src;
            soundCurr.play();
            this.soundActive.push( soundCurr );
             YAAK.Debugger.log("Currenting playing (looped): " + id);
            handle.init( id, this, soundCurr );

            return handle;
        },

        /**
         * Ends an active sound
         *
         * @param {HTMLMediaElement}    sound
         *
         * @returns this
         */
        endSound: function( sound ) {
            var activeChannelIndex;

            // Not active? We're done...
            if( !this.active )
                return this;

            activeChannelIndex = this.soundActive.indexOf( sound );
            if( activeChannelIndex < 0 )
                return this;

            // Clean up the sound...
            this.resetChannel( sound );

            // Recycle the sound...
            this.soundActive.splice( activeChannelIndex, 1 );
            this.soundInactive.push( sound );

            return this;
        },

        /**
         * Reset a sound instance
         * @private
         *
         * @param {HTMLMediaElement}    sound
         *
         * @returns this
         */
        resetChannel: function( sound ) {
            sound.pause();
            sound.playId = undefined;

            sound.removeEventListener( "ended", this.cbEndOneShot );
            sound.setLooped( false );

            return this;
        }
    };


    YAAK.AudioChannel = AudioChannel;
})();
