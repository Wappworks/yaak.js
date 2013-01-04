
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
