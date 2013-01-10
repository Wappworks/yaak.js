/**
 * User: ckhoo
 * Date: 22/10/12
 * Time: 3:30 PM
 *
 * Licensed under the FreeBSD license
 * Copyright (c) 2012, Wappworks Studio
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those
 * of the authors and should not be interpreted as representing official policies,
 * either expressed or implied, of the FreeBSD Project.
 */

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

(function() {
    "use strict";

    var kAudioFileTypes,
        audioInst;

    // Constants
    // ---------------------------------------
    kAudioFileTypes = {
        'mp3': 'audio/mpeg;',
        'ogg': 'audio/ogg; codecs="vorbis"',
        'wav': 'audio/wav; codecs="1"',
        'mp4': 'audio/mp4; codecs="mp4a.40.2"'
    };

    // Private
    // ---------------------------------------
    audioInst           = undefined;

    /**
     * Returns the static audio instance
     *
     * @return {HTMLMediaElement?}
     */
    function getAudioInst() {
        if( audioInst === undefined ) {
            audioInst = document.createElement( "audio" );
            if( audioInst == null || !(audioInst.canPlayType instanceof Function) )
                audioInst = null;
        }

        return audioInst;
    }

    // Classes
    // ---------------------------------------

    // Export
    // ---------------------------------------
    YAAK.PLATFORM = {
        /**
         * Determines if the platform supports audio
         *
         * @returns {Boolean}
         */
        canPlayAudio: function() {
            return getAudioInst() != null;
        },

        /**
         * Determines if the platform supports the specified audio file
         *
         * @param   {String}        url
         *
         * @returns {Boolean}
         */
        canPlayAudioFile: function( url ) {
            if( typeof url !== "string" )
                return false;

            return YAAK.PLATFORM.canPlayAudioType(url.substr( url.lastIndexOf('.') + 1 ));
        },

        /**
         * Determines if the platform supports a particular audio file extension
         *
         * @param   {String}        fileExt
         *
         * @returns {Boolean}
         */
        canPlayAudioType: function( fileExt ) {
            var audioInst = getAudioInst(),
                audioTestResult;

            if( audioInst == null )
                return false;

            audioTestResult = audioInst.canPlayType( kAudioFileTypes[fileExt] );
            return ( audioTestResult !== "no" && audioTestResult !== "" );
        },

        /**
         * Determines if the platform supports audio looping
         *
         * @returns {Boolean}
         */
        hasNativeAudioLoop: function() {
            var audioInst = getAudioInst();

            if( audioInst == null )
                return false;

            return (typeof audioInst.loop !== "undefined");
        }
    };
})();

(function() {
    "use strict";
	
	function Debugger() {
        return this;
    }
	
	Debugger.prototype = {
		debugMode: false,
		
		log: function(message) {
			if(this.debugMode === true) {
				console.log("YAAK: " + message);
			} 
		},
		
		setDebugMode: function(bol) {
			this.debugMode = bol;
		}
	};
	
	YAAK.Debugger = new Debugger();
	
})();

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

(function() {
    "use strict";

    // Constants
    // ---------------------------------------

    // Private
    // ---------------------------------------

    // Export
    // ---------------------------------------
    function AudioCache() {
        this.cacheMap = {};
    }

    AudioCache.prototype = {
        cacheMap: null,
        audioErrCb: null,

        /**
         * Add an audio element to the cache
         *
         * @param   {String|Number}                                             id
         * @param   {String|HTMLMediaElement|String[]|HTMLMediaElement[]}       audioIdentifier
         *
         * @returns  {Boolean}          true if successful. false otherwise
         */
        addAudio: function( id, audioIdentifier ) {
            var identifierSize, identifierIndex;

            if( !YAAK.PLATFORM.canPlayAudio() )
                return false;

            if( audioIdentifier instanceof Array ) {
                for( identifierSize = audioIdentifier.length, identifierIndex = 0; identifierIndex < identifierSize; identifierIndex++ ) {
                    if( this.tryAddAudio( id, audioIdentifier[identifierIndex] ) )
                        return true;
                }

                return false;
            }

            return this.tryAddAudio( id, audioIdentifier );
        },

        /**
         * Remove an audio sample from the cache
         *
         * @param {String|Number}   id
         *
         * @return this
         */
        removeAudio: function( id ) {
            if( this.cacheMap.hasOwnProperty(id) )
                delete this.cacheMap[ id ];

            return this;
        },

        /**
         * Returns an element by Id
         *
         * @param   {String|Number} id
         *
         * @returns  {HTMLMediaElement?}
         */
        getAudioElement: function( id ) {
            if( this.cacheMap.hasOwnProperty(id) )
                return this.cacheMap[ id ];

            return null;
        },

        /**
         * Add an audio element to the cache
         * @private
         *
         * @param   {String|Number}                         id
         * @param   {String||HTMLMediaElement}              audioIdentifier
         *
         * @returns  {Boolean}                              true if successful. false otherwise
         */
        tryAddAudio : function( id, audioIdentifier ) {
            if( typeof audioIdentifier === "string" )
                return this.tryAddAudioByUrl( id, audioIdentifier );

            if( audioIdentifier instanceof HTMLMediaElement )
                return this.tryAddAudioByElement( id, audioIdentifier );

            return false;
        },

        /**
         * Add an audio element to the cache by URL
         * @private
         *
         * @param   {String|Number}                         id
         * @param   {String}                                url
         *
         * @returns  {Boolean}                              true if successful. false otherwise
         */
        tryAddAudioByUrl : function( id, url ) {
            var me = this,
                audioInst;

            if( !YAAK.PLATFORM.canPlayAudioType(url.substr( url.lastIndexOf('.') + 1 )) )
                return false;

            audioInst = document.createElement('audio');
            audioInst.src= url;
            audioInst.preload = "auto";
            audioInst.addEventListener( "error", function() {
                me.removeAudio( id );
            } );
            audioInst.load();

            this.cacheMap[ id ] = audioInst;
            return true;
        },

        /**
         * Add an audio element to the cache based on an existing HTMLMediaElement
         * @private
         *
         * @param   {String|Number}                         id
         * @param   {HTMLMediaElement}                      mediaElement
         *
         * @returns  {Boolean}                              true if successful. false otherwise
         */
        tryAddAudioByElement : function( id, mediaElement ) {
            var url = mediaElement.src,
                me = this,
                audioInst;

            if( !YAAK.PLATFORM.canPlayAudioType(url.substr( url.lastIndexOf('.') + 1 )) )
                return false;

            audioInst = document.createElement('audio');
            audioInst.src= url;
            audioInst.preload = "auto";
            audioInst.addEventListener( "error", function() {
                me.removeAudio( id );
            } );

            this.cacheMap[ id ] = audioInst;
            return true;
        }
    };


    YAAK.AudioCache = AudioCache;
})();

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
            soundCurr.play()
            YAAK.Debugger.log("Currenting playing (one shot): " + id);
            this.soundActive.push( soundCurr );
            
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
            	 YAAK.Debugger.log("Did not playLooped: "  + id + " due to the channel being inactive");
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
