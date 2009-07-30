/**
 *
 * @module progressbar
 * @requires yahoo, dom, event, element
 * @optional animation
 * @title ProgressBar Widget
 */

(function () {
	var Dom = YAHOO.util.Dom,
		Lang = YAHOO.lang,
		
		DIRECTION_LTR = 'ltr',
		DIRECTION_RTL = 'rtl',
		DIRECTION_TTB = 'ttb',
		DIRECTION_BTT = 'btt',
		
		CLASS_PROGBAR = 'yui-pb',
		CLASS_MASK = CLASS_PROGBAR + '-mask',
		CLASS_BAR = CLASS_PROGBAR + '-bar',
		CLASS_BAR_TABLE = CLASS_BAR + '-table',
		CLASS_BAR_CONTAINER = CLASS_BAR + '-container',
		CLASS_CAPTION = CLASS_PROGBAR + '-caption',
		CLASS_CAPTION_CONTAINER = CLASS_CAPTION + '-container',
		CLASS_ANIM = CLASS_PROGBAR + '-anim',
		CLASS_TL = CLASS_PROGBAR + '-tl',
		CLASS_TR = CLASS_PROGBAR + '-tr',
		CLASS_BL = CLASS_PROGBAR + '-bl',
		CLASS_BR = CLASS_PROGBAR + '-br';
	
	/**
	 * The ProgressBar widget provides an easy way to draw a bar depicting progress of an operation,
	 * a level meter, ranking or any such simple linear measure.
	 * It allows for highly customized styles including animation, vertical or horizontal and forward or reverse.
	 * @namespace YAHOO.widget
	 * @class ProgressBar
	 * @extends YAHOO.util.Element
	 * @param oConfigs {object} An object containing any configuration attributes to be set 
	 * @constructor
	 */        
	var Prog = function(oConfigs) {
		YAHOO.log('Creating ProgressBar instance','info','ProgressBar');
        
		Prog.superclass.constructor.call(this, document.createElement('div') , oConfigs);
		this._init(oConfigs);
		
	};
	
	YAHOO.widget.ProgressBar = Prog;

    /**
     * String containing the HTML string which is the basis for the Progress Bar.
     *
     * @property ProgressBar.MARKUP
     * @type String
     * @static
     * @final
     * @default (too long)
     */
	Prog.MARKUP = [
		'<div class="',
		CLASS_BAR_TABLE,
		'"><div class="',
		CLASS_BAR_CONTAINER,
		'"><div class="',
		CLASS_BAR,
		'"></div></div></div><div class="',
		CLASS_CAPTION_CONTAINER,
		'"><div class="',
		CLASS_CAPTION,
		'"></div></div><div class="',
		CLASS_MASK,
		'"><div class="',
		CLASS_TL,
		'"></div><div class="',
		CLASS_TR,
		'"></div><div class="',
		CLASS_BL,
		'"></div><div class="',
		CLASS_BR,
		'"></div></div>'
	].join('');

	
	Lang.extend(Prog, YAHOO.util.Element, {
		/**
		 * Initialization code for the widget, separate from the constructor to allow for overriding/patching.
		 * It is called after <a href="#method_initAttributes">initAttributes</a>
		 *
		 * @method _init
		 * @param oConfigs {Object} (Optional) Object literal definition of configuration values.  
		 * @protected
		 */	
		 _init: function (oConfigs) {
			/**
			 * Fires when the value is about to change.  It reports the starting value
			 * @event start
			 * @type CustomEvent
			 * @param value {Number} the current (initial) value
			 */
			// No actual creation required, event will be created when subscribed to
			//this.createEvent('start');
			/**
			 * If animation is loaded, it will trigger for each frame of the animation providing partial values
			 * @event progress
			 * @type CustomEvent
			 * @param  value{Number} the current (progress) value
			 */
			// No actual creation required, event will be created when subscribed to
			//this.createEvent('progress');
			/**
			 * It will fire at the end of the animation or immediately upon progress values if animation is not loaded
			 * @event complete
			 * @type CustomEvent
			 * @param value {Number} the current (final)  value
			 */
			// No actual creation required, event will be created when listened to
			//this.createEvent('complete');
			

		},
		/**
		 * Implementation of Element's abstract method. Sets up config values.
		 *
		 * @method initAttributes
		 * @param oConfigs {Object} (Optional) Object literal definition of configuration values.
		 * @private
		 */	
		initAttributes: function (oConfigs) {
			YAHOO.log('Initializing configuration attributes','info','ProgressBar');

		    Prog.superclass.initAttributes.call(this, oConfigs);
			this.set('innerHTML',Prog.MARKUP);
			this.addClass(CLASS_PROGBAR);
			
			// I need to apply at least the following styles, if present in oConfigs, 
			// to the ProgressBar so when it later reads the width and height, 
			// they are already set to the correct values.
			// id is important because it can be used as a CSS selector.
			var key, presets = ['id','width','height','class','style'];
			while((key = presets.pop())) {
				if (key in oConfigs) {
					this.set(key,oConfigs[key]);
				}
			}
			

			/**
			 * @attribute barEl
			 * @description Reference to the HTML object that makes the moving bar (read-only)
			 * @type HTMLElement (div)
			 * @readonly
			 */			
		    this.setAttributeConfig('barEl', {
		        readOnly: true,
		        value: this.getElementsByClassName(CLASS_BAR)[0]
		    });
			/**
			 * @attribute maskEl
			 * @description Reference to the HTML object that overlays the bar providing the mask. (read-only)
			 * @type HTMLElement (table)
			 * @readonly
			 */			
		    this.setAttributeConfig('maskEl', {
		        readOnly: true,
		        value: this.getElementsByClassName(CLASS_MASK)[0]
		    });
			
			/**
			 * @attribute captionEl
			 * @description Reference to the HTML object that contains the caption.
			 * @type HTMLElement or String
			 * @default a container placed centered over the progress bar.
			 */			
		    this.setAttributeConfig('captionEl', {
		        value: this.getElementsByClassName(CLASS_CAPTION)[0],
				validator: function (value) {
					return (Lang.isString(value) && Dom.get(value)) || (Lang.isObject(value) && value.ownerDocument == document);
				},
				setter: function (value) {
					return Dom.get(value);
				}
		    });
			
			/**
			 * @attribute direction
			 * @description Direction of movement of the bar.  
			 *    It can be any of 'ltr' (left to right), 'rtl' (the reverse) , 'ttb' (top to bottom) or 'btt'.
			 *    Can only be set once and only before rendering.
			 * @default 'ltr'
			 * @type String (any of "ltr", "rtl", "ttb" or "btt")
			 */			
			this.setAttributeConfig('direction', {
				value:DIRECTION_LTR,
				validator:function(value) {
					if (this._rendered) { return false; }
					switch (value) {
						case DIRECTION_LTR:
						case DIRECTION_RTL:
						case DIRECTION_TTB:
						case DIRECTION_BTT:
							return true;
						default:
							return false;
					}
				},
				method: function(value) {
					this._barSizeFunction = this._barSizeFunctions[this.get('anim')?1:0][value];
				}
			});
			
			/**
			 * @attribute maxValue
			 * @description Represents the top value for the bar. 
			 *   The bar will be fully extended when reaching this value.  
			 *   Values higher than this will be ignored. 
			 * @default 100
			 * @type Number
			 */				    
		    this.setAttributeConfig('maxValue', {
		        value: 100,
				validator: Lang.isNumber,
				method: function (value) {
					this.get('element').setAttribute('aria-valuemax',value);
					if (this.get('value') > value) { this.set('value',value); }
				}
		    });
			
			/**
			 * @attribute minValue
			 * @description Represents the lowest value for the bar. 
			 *   The bar will be totally collapsed when reaching this value.  
			 *    Values lower than this will be ignored. 
			 * @default 0
			 * @type Number
			 */				

		    this.setAttributeConfig('minValue', {
		        value: 0,
				validator: Lang.isNumber,
				method: function (value) {
					this.get('element').setAttribute('aria-valuemin',value);
					if (this.get('value') < value) { this.set('value',value); }
				}
		    });
			/**
			 * @attribute width
			 * @description Width of the ProgressBar.
			 *     If a number, it will be assumed to be in pixels.  
			 *     If a string it should be a valid setting for the CSS width attribute.  
			 *     It will always be returned as a string including units.
			 * @default "200px"
			 * @type Number or String
			 */				

		    this.setAttributeConfig('width', {
				getter: function() {
					return this.getStyle('width');
				},
				method: this._widthChange
		    });
		

			/**
			 * @attribute height
			 * @description Height of the ProgressBar.
			 *     If a number, it will be assumed to be in pixels.  
			 *     If a string it should be a valid setting for the CSS height attribute.  
			 *     It will always be returned as a string including units.
			 * @default "20px"
			 * @type Number or String
			 */				
		    this.setAttributeConfig('height', {
				getter:function() {
					return this.getStyle('height');
				},
				method: this._heightChange
		    });
			
			
	
			/**
			 * @attribute textTemplate
			 * @description Text to be shown usually overlapping the bar and to be voiced by screen readers.
			 *     The text is processed by <a href="YAHOO.lang.html#method_substitute">YAHOO.lang.substitute</a>.  
			 *     It can use the placeholders {value}, {minValue} and {maxValue}
			 * @default ""
			 * @type String
			 */				
			this.setAttributeConfig('textTemplate', {
				value:'{value}'
			});
			
			/**
			 * @attribute value
			 * @description The value for the bar.  
			 *     Valid values are in between the minValue and maxValue attributes.
			 * @default 0
			 * @type Number
			 */			
			this.setAttributeConfig('value', {
				value: 0,
				validator: function(value) {
					return Lang.isNumber(value) && value >= this.get('minValue') && value <= this.get('maxValue');
				},
				method: this._valueChange
		    });
			
			/**
			 * @attribute anim
			 * @description it accepts either a boolean (recommended) or an instance of <a href="YAHOO.util.Anim.html">YAHOO.util.Anim</a>.
			 *   If a boolean, it will enable/disable animation creating its own instance of the animation utility.  
			 *   If given an instance of <a href="YAHOO.util.Anim.html">YAHOO.util.Anim</a> it will use that instance.
			 *   The <a href="YAHOO.util.Anim.html">animation</a> utility needs to be loaded.
			 *   When read, it returns the instance of the animation utility in use or null if none.  
			 *   It can be used to set the animation parameters such as easing methods or duration.
			 * @default null
			 * @type {boolean} or {instance of YAHOO.util.Anim}
			 */						
			this.setAttributeConfig('anim', {
				validator: function(value) {
					return !!YAHOO.util.Anim;
				},
				setter: this._animSetter
			});
			
			
		},
		/** 
		 *  Renders the ProgressBar into the given container.  
		 *  If the container has other content, the ProgressBar will be appended to it.
		 *  If the second argument is provided, the ProgressBar will be inserted before the given child.
		 * The method is chainable since it returns a reference to this instance.
		 * @method render
		 * @param el {HTML Element}  HTML element that will contain the ProgressBar
		 * @param before {HTML Element}  (optional) If present, the ProgressBar will be inserted before this element.
		 * @return {YAHOO.widget.ProgressBar}
		 * @chainable
		 */
		render: function(parent,before) {

			YAHOO.log('start render','info','ProgressBar');
			if (this._rendered) { return; }
			this._rendered = true;
			
			var direction = this.get('direction');

			// If the developer set a className attribute on initialization, 
			// Element would have wiped out my own classNames
			// So I need to insist on them, plus add the one for direction.
			this.addClass(CLASS_PROGBAR);
			this.addClass(CLASS_PROGBAR + '-' + direction);

			var container = this.get('element');
			container.tabIndex = 0;
			container.setAttribute('role','progressbar');
			container.setAttribute('aria-valuemin',this.get('minValue'));
			container.setAttribute('aria-valuemax',this.get('maxValue'));

			this.appendTo(parent,before);
			
					
			// I need to use the non-animated bar resizing function for initial redraw
			this._barSizeFunction = this._barSizeFunctions[0][direction];
			this.redraw();
			this._fixEdges();
			// I can now set the correct bar resizer
			if (this.get('anim')) {
				this._barSizeFunction = this._barSizeFunctions[1][direction];
			}

			this.on('minValueChange',this.redraw);
			this.on('maxValueChange',this.redraw);

			return this;
		},

		/** 
		 * Recalculate the bar size and position and redraws it
		 * @method redraw
		 * @return  void
		 */
		redraw: function () {
			YAHOO.log('Redraw','info','ProgressBar');
			this._recalculateConstants();
			this._valueChange(this.get('value'));
		},
			
		/** 
		 * Destroys the ProgressBar, related objects and unsubscribes from all events
		 * @method destroy
		 * @return  void
		 */
		destroy: function() {
			YAHOO.log('destroy','info','ProgressBar');
			this.set('anim',false);
			this.unsubscribeAll();
			this.get('captionEl').innerHTML = '';
			var el = this.get('element');
			el.parentNode.removeChild(el);
		},
		/**
		 * The previous value setting for the bar.  Used mostly as information to event listeners
		 * @property _previousValue
		 * @type Number
		 * @private
		 * @default  0
		 */
		_previousValue:0,
		/**
		 * The actual space (in pixels) available for the bar within the mask (excludes margins)
		 * @property _barSpace
		 * @type Number
		 * @private
		 * @default  100
		 */
		_barSpace:100,
		/**
		 * The factor to convert the actual value of the bar into pixels
		 * @property _barSpace
		 * @type Number
		 * @private
		 * @default  1
		 */
		_barFactor:1,
		
		/**
		 * A flag to signal that rendering has already happened
		 * @property _rendered
		 * @type boolean
		 * @private
		 * @default  false
		 */
		_rendered:false,
		
		
		/**
		 * Function to be used to calculate bar size.  
		 * It is picked from <a href="#property_barSizeFunctions">_barSizeFunctions</a>
		 * depending on direction and whether animation is active.
		 * @property _barSizeFunction
		 * @type {function}
		 * @default null
		 * @private
		 */		
		_barSizeFunction: null,
		
		/** 
		 * Method called when the height attribute is changed
		 * @method _heightChange
		 * @param {int or string} value New height, in pixels if int or string including units
		 * @return void
		 * @private
		 */
		_heightChange: function(value) {
			if (Lang.isNumber(value)) {
				value += 'px';
			}
			this.setStyle('height',value);
			this._fixEdges();
			this.redraw();
		},

		/** 
		 * Method called when the height attribute is changed
		 * @method _widthChange
		 * @param {int or string} value New width, in pixels if int or string including units
		 * @return void
		 * @private
		 */
		_widthChange: function(value) {
			if (Lang.isNumber(value)) {
				value += 'px';
			}
			this.setStyle('width',value);
			this._fixEdges();
			this.redraw();
		},
		
		/** 
		 * Due to rounding differences, some browsers fail to cover the whole area 
		 * with the mask quadrants when the width or height is odd.  This method
		 * stretches the lower and/or right quadrants to make the difference.
		 * @method _fixEdges
		 * @return void
		 * @private
		 */
		_fixEdges:function() {
			if (!this._rendered || YAHOO.env.ua.ie || YAHOO.env.ua.gecko ) { return; }
			var maskEl = this.get('maskEl'),
				tlEl = Dom.getElementsByClassName(CLASS_TL,undefined,maskEl)[0],
				trEl = Dom.getElementsByClassName(CLASS_TR,undefined,maskEl)[0],
				blEl = Dom.getElementsByClassName(CLASS_BL,undefined,maskEl)[0],
				brEl = Dom.getElementsByClassName(CLASS_BR,undefined,maskEl)[0],
				newSize = (parseInt(Dom.getStyle(maskEl,'height'),10) -
				parseInt(Dom.getStyle(tlEl,'height'),10)) + 'px';
				
			Dom.setStyle(blEl,'height',newSize);
			Dom.setStyle(brEl,'height',newSize);
			newSize = (parseInt(Dom.getStyle(maskEl,'width'),10) -
				parseInt(Dom.getStyle(tlEl,'width'),10)) + 'px';
			Dom.setStyle(trEl,'width',newSize);
			Dom.setStyle(brEl,'width',newSize);
		},
					
				
		
		/** 
		 * Calculates some auxiliary values to make the rendering faster
		 * @method _recalculateConstants
		 * @return  void
		 * @private
		 */		
		_recalculateConstants: function() {
			YAHOO.log('Recalculating auxiliary factors','info','ProgressBar');
			
			//var cont = this.getElementsByClassName(CLASS_BAR_TABLE)[0];
			var barEl = this.get('barEl');

			switch (this.get('direction')) {
				case DIRECTION_LTR:
				case DIRECTION_RTL:
					this._barSpace = (parseInt(this.get('width'),10) || 200) - 
						(parseInt(Dom.getStyle(barEl,'marginLeft'),10) || 0) -
						(parseInt(Dom.getStyle(barEl,'marginRight'),10) || 0);
						// this._barSpace = parseInt(Dom.getStyle(cont,'width'),10);
					break;
				case DIRECTION_TTB:
				case DIRECTION_BTT:
					this._barSpace = (parseInt(this.get('height'),10) || 20) -
						(parseInt(Dom.getStyle(barEl,'marginTop'),10) || 0) -
						(parseInt(Dom.getStyle(barEl,'marginBottom'),10) || 0); 
						// this._barSpace = parseInt(Dom.getStyle(cont,'height'),10);
					break;
			}
			this._barFactor = this._barSpace / (this.get('maxValue') - (this.get('minValue') || 0))  || 1;
		},
		
		
		/** 
		 * Called in response to a change in the <a href="#config_anim">anim</a> attribute.
		 * It creates and sets up or destroys the instance of the animation utility that will move the bar
		 * @method _animSetter
		 * @return  void
		 * @private
		 */		
		_animSetter: function (value) {
			var anim, barEl = this.get('barEl');
			if (value) {
				YAHOO.log('Turning animation on','info','ProgressBar');
				if (value instanceof YAHOO.util.Anim) {
					anim = value;
				} else {
					anim = new YAHOO.util.Anim(barEl);
				}
				anim.onTween.subscribe(this._animOnTween,this,true);
				anim.onComplete.subscribe(this._animComplete,this,true);
			} else {
				YAHOO.log('Turning animation off','info','ProgressBar');
				anim = this.get('anim');
				if (anim) {
					anim.onTween.unsubscribeAll();
					anim.onComplete.unsubscribeAll();
				}
				anim = null;
			}
			this._barSizeFunction = this._barSizeFunctions[anim?1:0][this.get('direction')];
			return anim;
		},
		
		_animComplete: function(ev) {
			YAHOO.log('Animation completed','info','ProgressBar');
			var value = this.get('value');
			this._previousValue = value;
			this.fireEvent('complete', value);
			Dom.removeClass(this.get('barEl'),CLASS_ANIM);
			this._showTemplates(value,true);
		},
		_animOnTween:function (ev) {
			var value = Math.floor(this._tweenFactor * this.get('anim').currentFrame + this._previousValue);
			// The following fills the logger window too fast
			//YAHOO.log('Animation onTween at: ' + value,'info','ProgressBar');
			this.fireEvent('progress',value);
			this._showTemplates(value,false);
		},
		
		/** 
		 * Called in response to a change in the <a href="#config_value">value</a> attribute.
		 * Moves the bar to reflect the new value
		 * @method _valueChange
		 * @return  void
		 * @private
		 */		
		_valueChange: function (value) {
			YAHOO.log('set value: ' + value,'info','ProgressBar');
			var pixelValue = Math.floor((value - this.get('minValue')) * this._barFactor),
				barEl = this.get('barEl'),
				dim = 'width';
			switch(this.get('direction')) {
				case DIRECTION_TTB:
				case DIRECTION_BTT:
					dim = 'height';
			}
				
			this._showTemplates(value,true);
			if (this._rendered) {
				this.fireEvent('start',this._previousValue);
				this._barSizeFunction(value, pixelValue, barEl, dim);
			}
		},

		/** 
		 * Utility method to set the ARIA value attributes
		 * @method _showTemplates
		 * @return  void
		 * @private
		 */
		 _showTemplates: function(value, aria) {
			// When animated, this fills the logger window too fast
 			//YAHOO.log('Show template','info','ProgressBar');

			var captionEl = this.get('captionEl'),
				container = this.get('element'),
				text = Lang.substitute(this.get('textTemplate'),{
					value:value,
					minValue:this.get('minValue'),
					maxValue:this.get('maxValue')
				});
			if (captionEl) {
				captionEl.innerHTML = text;
			}
			if (aria) {
				container.setAttribute('aria-valuenow',value);
				container.setAttribute('aria-valuetext',captionEl.textContent);
			}
		}
	});
	/**
	 * Collection of functions used by to calculate the size of the bar.
	 * One of this will be used depending on direction and whether animation is active.
	 * @property _barSizeFunctions
	 * @type {collection of functions}
	 * @private
	 */
	var b = [{},{}];
	Prog.prototype._barSizeFunctions = b;
	b[0][DIRECTION_LTR] = b[0][DIRECTION_RTL] = 
	b[0][DIRECTION_TTB] = b[0][DIRECTION_BTT] = function(value, pixelValue, barEl, dim) {
		Dom.setStyle(barEl,dim,  pixelValue + 'px');
		this.fireEvent('progress',value);
		this.fireEvent('complete',value);
		this._previousValue = value;
	};
	b[1][DIRECTION_LTR] = b[1][DIRECTION_RTL] = 
	b[1][DIRECTION_TTB] = b[1][DIRECTION_BTT] = function(value, pixelValue, barEl, dim) {
		var anim = this.get('anim');
		if (anim.isAnimated()) { anim.stop(); }
		Dom.addClass(barEl,CLASS_ANIM);
		this._tweenFactor = (value - this._previousValue) / anim.totalFrames;
		anim.attributes = {}; 
		anim.attributes[dim] = { to: pixelValue }; 
		anim.animate();
	};
})();

YAHOO.register("progressbar", YAHOO.widget.ProgressBar, {version: "@VERSION@", build: "@BUILD@"});
