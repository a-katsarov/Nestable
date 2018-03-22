/*!
 * Nestable 0.0.6
 * mobius1[at]gmx[dot]com
 *
 * Sortable hierarchical list using HTML5 Drag & Drop API.
 *
 * Released under the MIT license
 */
(function(root) {

	"use strict";

	/**
	 * Default configuration properties
	 * @type {Object}
	 */
	var defaultConfig = {
		listName: "ol",
		itemName: "li",
		draggable: "li",

		rootClass: "nst-root",
		listClass: "nst-list",
		itemClass: "nst-item",
		parentClass: "nst-parent",


		handleClass: "nst-handle",
		buttonClass: "nst-button",
		contentClass: "nst-content",
		dragClass: "nst-dragging",
		placeClass: "nst-placeholder",
		cloneClass: "nst-clone",
		draggableClass: "nst-draggable",
		dropzoneClass: "nst-dropzone",
		collapsedClass: "nst-collapsed",

		threshold: 25,
		animation: 150,
	};

	/**
	 * Attach removable event listener
	 * @param  {Object}   el       HTMLElement
	 * @param  {String}   type     Event type
	 * @param  {Function} callback Event callback
	 * @param  {Object}   scope    Function scope
	 * @return {Void}
	 */
	function on(el, type, callback, scope) {
		el.addEventListener(type, callback, false);
	}

	/**
	 * Remove event listener
	 * @param  {Object}   el       HTMLElement
	 * @param  {String}   type     Event type
	 * @param  {Function} callback Event callback
	 * @return {Void}
	 */
	function off(el, type, callback) {
		el.removeEventListener(type, callback);
	}

	/**
	 * Iterator helper
	 * @param  {(Array|Object)}   collection Any object, array or array-like collection.
	 * @param  {Function} callback   The callback function
	 * @param  {Object}   scope      Change the value of this
	 * @return {Void}
	 */
	function each(collection, callback, scope) {
		if ("[object Object]" === Object.prototype.toString.call(collection)) {
			for (var d in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, d)) {
					callback.call(scope, d, collection[d]);
				}
			}
		} else {
			for (var e = 0, f = collection.length; e < f; e++) {
				callback.call(scope, e, collection[e]);
			}
		}
	}

	/**
	 * Merge objects together into the first.
	 * @param  {Object} src   Source object
	 * @param  {Object} obj 	Object to merge into source object
	 * @return {Object}
	 */
	function extend(src, props) {
		props = props || {};
		var p;
		for (p in src) {
			if (src.hasOwnProperty(p)) {
				if (!props.hasOwnProperty(p)) {
					props[p] = src[p];
				}
			}
		}
		return props;
	}

	/**
	 * Create new element and apply propertiess and attributes
	 * @param  {String} name   The new element's nodeName
	 * @param  {Object} prop CSS properties and values
	 * @return {Object} The newly create HTMLElement
	 */
	function createElement(name, props) {
		var c = document,
			d = c.createElement(name);
		if (props && "[object Object]" === Object.prototype.toString.call(props)) {
			var e;
			for (e in props)
				if ("html" === e) d.innerHTML = props[e];
				else if ("text" === e) {
				var f = c.createTextNode(props[e]);
				d.appendChild(f);
			} else d.setAttribute(e, props[e]);
		}
		return d;
	}

	/**
	 * Emulate jQuery's css method
	 * @param  {Object} el   HTMLElement
	 * @param  {Object} prop CSS properties and values
	 * @return {Object|Void}
	 */
	function style(el, obj) {
		if ( !obj ) {
			return window.getComputedStyle(el);
		}
		if ("[object Object]" === Object.prototype.toString.call(obj)) {
			var s = "";
			each(obj, function(prop, val) {

				if ( typeof val !== "string" && val !== "opacity" ) {
					val += "px";
				}

				s += prop + ": " + val + ";";
			});
			el.style.cssText += s;
		}
	}

	/**
	 * Apply 3d transform to an element
	 * @param  {Object} el         	HTMLElement
	 * @param  {Number} x          Abscissa
	 * @param  {Number} y          Ordinate
	 * @param  {Number} transition transition-duration value
	 * @return {Void}
	 */
	function transform(el, x, y, transition) {
		if (x !== undefined && y !== undefined) {
			transition = transition || 0;
			el.style.cssText +=
				"transform: translate3d(" + x + "px, " + y + "px,0); transition: transform " + transition + "ms";
		}
	}

	/**
	 * querySelectorAll alternative for live collections.
	 * @param  {String} selector | Valid CSS3 selector string
	 * @return {Boolean}         | HTMLElement, HTMLCollection or false
	 */
	function queryAll(selector, node) {
		node = node || document;
		var el = false;
		if (typeof selector === "string") {
			var first = selector.charAt(0);

			switch (first) {
				case ".":
					el = node.getElementsByClassName(selector.substring(1));
					break;
				case "#":
					el = node.getElementById(selector.substring(1));
					break;
				default:
					el = node.getElementsByTagName(selector);
					break;
			}
		}

		return el;
	}

	function query(selector, node) {
		node = node || document;
		var el = false;
		if (typeof selector === "string") {
			var first = selector.charAt(0);

			if ( first === "#" ) {
				el = node.getElementById(selector.substring(1));
			} else {
				el = queryAll(selector, node)[0];
			}
		}

		return el;
	}

	/**
	 * Find the closest matching ancestor to a given element
	 * @param  {Object} el 	HTMLElement
	 * @param  {Function} fn 	Callback
	 * @return {Boolean|Object} The matching HTMLElement or false
	 */
	function closest(el, fn) {
		return el && el !== document.body && el.nodeType === Node.ELEMENT_NODE && (fn(el) ? el : closest(el.parentNode, fn));
	}

	/**
	 * Find the first matching previous element sibling
	 * @param  {Object} el 	HTMLElement
	 * @param  {Function} fn 	Callback
	 * @return {Boolean|Object} The matching HTMLElement or false
	 */
	function prev(el, fn) {
		while (el = el.previousElementSibling) { if (!fn || fn(el)) return el; }
	}

	/**
	 * Insert element before node
	 * @param  {Object} el 	HTMLElement to insert
	 * @param  {Object} item 	HTMLElement to insert before
	 * @return {Void}
	 */
	function prepend(el, item) {
		item.parentNode.insertBefore( el, item );
	}

	/**
	 * Insert element after node
	 * @param  {Object} el 	HTMLElement to insert
	 * @param  {Object} item 	HTMLElement to insert after
	 * @return {Void}
	 */
	function append(el, item) {
		var n = item.nextElementSibling;
		if ( n ) {
			item.parentNode.insertBefore( el, n );
		} else {
			item.parentNode.appendChild( el );
		}
	}

	function animate(target) {
		var that = this, tx, ty,
			o = that.config, canTarget = target !== that.placeNode;

		var placeRect = rect(that.placeNode);

		if ( canTarget ) {
			var targetRect = rect(target);

			// Get the change in coords for the target
			tx = that.targetRect.x1 - targetRect.x1;
			ty = that.targetRect.y1 - targetRect.y1;
		}


		// Get the chnage in coords for the placeholder
		var px = that.placeRect.x1 - placeRect.x1;
		var py = that.placeRect.y1 - placeRect.y1;

		if ( !canTarget ) {
			px = that.oldRect.x1 - placeRect.x1;
			py = that.oldRect.y1 - placeRect.y1;
		}

		// Visibly move elements via 3d transforms back to where they were before
		// they were physically moved to a new position in the DOM
		transform(that.placeNode, px, py);

		if ( canTarget ) {
			transform(target, tx, ty);
		}

		// 3d transforms won't trigger repaints which is good in some cases
		// however, in this case, no repaint = no animation
		console.log(target.offsetHeight);

		// Reset the 3d transform, but add a transition so they animate to the proper position
		transform(that.placeNode, 0, 0, o.animation);

		if ( canTarget ) {
			transform(target, 0, 0, o.animation);
		}

		// Clear the timer
		clearTimeout(target.timer);

		target.timer = setTimeout(function() {
			target.style.transform = "";
			target.style.transition = "";

			target.timer = false;
		}, o.animation);
	}

	/**
	 * Get an element's DOMRect relative to the document instead of the viewport.
	 * @param  {Object} t 	HTMLElement
	 * @param  {Boolean} e 	Include margins
	 * @return {Object}   	Formatted DOMRect copy
	 */
	function rect(t, e) {
		var o = window,
			r = t.getBoundingClientRect(),
			x = o.pageXOffset,
			y = o.pageYOffset,
			m = {},
			f = "none";

		if (e) {
			var s = style(t);
			m = {
				top: parseInt(s["margin-top"], 10),
				left: parseInt(s["margin-left"], 10),
				right: parseInt(s["margin-right"], 10),
				bottom: parseInt(s["margin-bottom"], 10)
			};

			f = s.float;
		}

		return {
			w: r.width,
			h: r.height,
			x1: r.left + x,
			x2: r.right + x,
			y1: r.top + y,
			y2: r.bottom + y,
			margin: m,
			float: f
		};
	}

	/**
	 * Custom events
	 */
	var Events = function() {};

	/**
	 * Event Prototype
	 * @type {Object}
	 */
	Events.prototype = {
		/**
		 * Add custom event listener
		 * @param  {String} event Event type
		 * @param  {Function} func   Callback
		 * @return {Void}
		 */
		on: function(event, func) {
			this._events = this._events || {};
			this._events[event] = this._events[event] || [];
			this._events[event].push(func);
		},

		/**
		 * Remove custom event listener
		 * @param  {String} event Event type
		 * @param  {Function} func   Callback
		 * @return {Void}
		 */
		off: function(event, func) {
			this._events = this._events || {};
			if (event in this._events === false) return;
			this._events[event].splice(this._events[event].indexOf(func), 1);
		},

		/**
		 * Fire a custom event
		 * @param  {String} event Event type
		 * @return {Void}
		 */
		emit: function(event /* , args... */ ) {
			this._events = this._events || {};
			if (event in this._events === false) return;
			for (var i = 0; i < this._events[event].length; i++) {
				this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
	};

	/**
	 * Event mixin
	 * @param  {Object} obj
	 * @return {Object}
	 */
	Events.mixin = function(obj) {
		var props = ['on', 'off', 'emit'];
		for (var i = 0; i < props.length; i++) {
			if (typeof obj === 'function') {
				obj.prototype[props[i]] = Events.prototype[props[i]];
			} else {
				obj[props[i]] = Events.prototype[props[i]];
			}
		}
		return obj;
	};

	/**
	 * Nestable Object
	 * @param nodes The html nodes to initialize
	 * @param {Object} config User config
	 * @constructor
	 */
	function Nestable(config) {

		this.config = extend(defaultConfig, config);

		this.dragging = false;

		this.coords = {
			last: { x: 0, y: 0 },
			origin: { x: 0, y: 0 },
			position: { x: 0, y: 0 },
			transform: { x: 0, y: 0 }
		};

		this.init();
	}

	/**
	 * Initialise the instance
	 * @return {Void}
	 */
	Nestable.prototype.init = function() {
		if (!this.initialised) {

			var o = this.config;

			this.rootNode = typeof o.list === "string" ? query(o.list) : o.list;
			this.rootCSS = style(this.rootNode);

			// Position root node if not already relative or absolute
			if ( this.rootCSS.position === "static" ) {
				style(this.rootNode, {
					position: "relative"
				});
			}

			// IE10 doesn't support multiple arguments for add() & remove()
			this.rootNode.classList.add(o.rootClass);
			this.rootNode.classList.add(o.listClass);

			var items = queryAll(o.itemName, this.rootNode)

			if ( o.items ) {
				if ( typeof o.items === "string" ) {
					items = queryAll(o.items);
				} else if ( o.items instanceof HTMLCollection || o.list instanceof NodeList ) {
					items = o.items;
				}
			}

			if (items.length) {
				this.items = [];
				this.draggable = [];
				each(items, function(i, item) {
					item.classList.add(o.itemClass);

					var handle, content, hasHandle = o.handle;

					if ( !hasHandle ) {
						handle = createElement("div", { class: o.handleClass + " " + o.contentClass });
					} else {
						handle = query(o.handle, item);
						handle.classList.add(o.handleClass);
						content = createElement("div", { class: o.contentClass });
					}

					var nodes = [];

					var listItem = query(o.listName, item);

					if ( listItem ) {

						each(item.childNodes, function(i, node) {
							if ( node !== listItem ) {
								nodes.push(node);
							}
						});

						item.classList.add(o.parentClass);
						listItem.classList.add(o.listClass);
						if ( !hasHandle ) {
							item.insertBefore(handle, listItem);
						} else {
							item.insertBefore(content, listItem);
						}
					} else {

						nodes = [].slice.call(item.childNodes);

						listItem = createElement(o.listName, { class: o.listClass });

						if ( !hasHandle ) {
							item.appendChild(handle);
						} else {
							item.appendChild(content);
						}

						item.appendChild(createElement(o.listName, { class: o.listClass }));
					}

					each(nodes, function(i, node) {
						if ( !hasHandle ) {
							handle.appendChild(node);
						} else {
							content.appendChild(node);
						}
					});

					item.setAttribute("collapsed", "0");

					this.items.push(item);
					if ( item.matches(o.draggable) ) {
						item.draggable = true;
						item.classList.add(o.draggableClass);
						this.draggable.push(item);
					}

					var btn = createElement("button", { class: o.buttonClass, type: "button" });
					item.insertBefore(btn, item.firstElementChild);

				}, this);

				// Enable custom events
				Events.mixin(this);

				this.enable();
			}
		}
	};

	/**
	 * Destroy the instance
	 * @return {Void}
	 */
	Nestable.prototype.destroy = function() {
		if (!this.initialised) {
			var that = this, o = that.config;

			that.disable();

			that.rootNode.classList.remove(o.rootClass);
			that.rootNode.classList.remove(o.listClass);

			each(that.items, function(i, item) {
				item.classList.remove(o.itemClass);
				item.classList.remove(o.parentClass);
				item.classList.remove(o.draggableClass);
				item.removeAttribute("collapsed");
				item.removeAttribute("draggable");

				var button = query("." + o.buttonClass, item);
				var content = query("." + o.contentClass, item);
				var list = query("." + o.listClass, item);

				// Remove the collapse button
				if ( button ) {
					item.removeChild(button);
				}

				// Remove the content element
				if ( content ) {
					each(content.children, function(i, n) {
						item.insertBefore(n, content);
					});
					item.removeChild(content);
				}

				// Remove any empty list elements
				if ( list ) {
					if ( list.childElementCount ) {
						list.classList.remove(o.listClass);
					} else {
						item.removeChild(list);
					}
				}

			}, that);

			that.items = [];

			that.dragging = false;

			that.coords = {
				last: { x: 0, y: 0 },
				origin: { x: 0, y: 0 },
				position: { x: 0, y: 0 },
				transform: { x: 0, y: 0 }
			};

			that.initialised = false;
		}
	};

	/**
	 * Enable the drag and drop functionality
	 * @return {Void}
	 */
	Nestable.prototype.enable = function() {
		if (!this.enabled) {
			var w = this.rootNode, that = this;

			that.eventData = {
				mousedown: that.rootNode,
				mouseup: w,
				dragstart: w,
				dragover: w,
				dragenter: w,
				drop: w,
				dragend: w
			};

			that.events = {};

			each(that.eventData, function(event, target) {
				that.events[event] = that[event].bind(that);
				on(target, event, that.events[event]);
			});

			on(that.rootNode, "click", function(e) {
				var t = e.target;
				if ( t.classList.contains("nst-button") ) {
					if ( t.parentNode.getAttribute("collapsed") === "0" ) {
						t.parentNode.classList.add(that.config.collapsedClass);
						t.parentNode.setAttribute("collapsed", "1");
					} else {
						t.parentNode.classList.remove(that.config.collapsedClass);
						t.parentNode.setAttribute("collapsed", "0");
					}
				}
			})

			that.enabled = true;
		}
	};

	/**
	 * Disable the drag and drop functionality
	 * @return {Void}
	 */
	Nestable.prototype.disable = function() {
		if (this.enabled) {
			each(this.eventData, function(event, target) {
				off(target, this.events[event]);
			}, this);

			this.enabled = false;
		}
	};

	Nestable.prototype.resize = function(event) {
		var that = this;
		if (that.hasContainer) {
			clearTimeout(that.timer);
			that.timer = setTimeout(that.setBoundaries(), 100);
		}
	};

	Nestable.prototype.mousedown = function(e) {
		var target = e.target, o = this.config;

		// Get the closest handle
		var handle = closest(target, function(el) {
			return el && el.classList.contains(o.handleClass);
		});

		// The target is contained within a valid handle
		if ( handle ) {

			// Get the closest draggable item
			var dragNode = closest(handle, function(el) {
				return el && el.classList.contains(o.itemClass) && el.draggable;
			});

			// The handle is contained within a draggable item
			if ( dragNode ) {

				this.dragNode = dragNode;

				this.coords.origin.x = e.type === "touchstart" ? e.touches[0].pageX : e.pageX;
				this.coords.origin.y = e.type === "touchstart" ? e.touches[0].pageY : e.pageY;

				this.coords.change = {
					x: this.coords.origin.x,
					y: this.coords.origin.y
				};

				this.dragging = true;

				this.dragNode.classList.add(o.dragClass);

				// Create the ghost element that will replace the
				// native HTML5 drag and drop ghost
				this.ghostNode = this.dragNode.cloneNode(true);
				this.ghostNode.classList.add(o.cloneClass);

				// Position the ghost at the exact postion of the element
				this.dragRect = rect(this.dragNode, true);

				style(this.ghostNode, {
					width: this.dragRect.w,
					height: this.dragRect.h,
					top: this.dragRect.y1,
					left: this.dragRect.x1
				});

				document.body.appendChild(this.ghostNode);

				this.setPosition(e);
			}
		}
	};

	Nestable.prototype.mouseup = function() {
		if (this.dragging) {
			this.dragging = false;

			this.coords.transform.x = this.coords.position.x;
			this.coords.transform.y = this.coords.position.y;

			this.stop();
		}
	};

	Nestable.prototype.dragstart = function(e) {

		e.dataTransfer.effectAllowed = 'copy';

		e.dataTransfer.setData('text/html', '');

		// Create blank image to hide the ghost
		e.dataTransfer.setDragImage(createElement('img'), -10, -10);

		this.setPlaceholder();
	};

	Nestable.prototype.dragover = function(e) {
		if (e.preventDefault) {
			e.preventDefault();
		}

		var that = this, c = that.coords, horizontal = false;

		e.dataTransfer.dropEffect = "copy";

		if ( !that.rootNode.contains(e.target) ) {
			e.dataTransfer.dropEffect = "none";
		}

		if (that.dragging) {
			that.setPosition(e);

			// Only allow nesting of moving horizontally
			var horizontal = Math.abs(c.mouse.x - c.origin.x) > Math.abs(c.mouse.y - c.origin.y);

			if ( horizontal ) {
				if ( c.mouse.x - c.change.x > that.config.threshold ) {
					that.setParent();
				} else if ( c.mouse.x - c.change.x < -that.config.threshold ) {
					that.unsetParent();
				}
			}

			transform(that.ghostNode, c.position.x, c.position.y);
		}

		c.last.x = e.pageX;
		c.last.y = e.pageY;
	};

	Nestable.prototype.dragenter = function(e) {

		var that = this, target = e.target, o = that.config, c = that.coords;

		var content = closest(target, function(el) {
			return el && el.classList.contains(o.contentClass);
		});

		if ( content ) {

			var item = closest(content, function(el) {
				return el && el.classList.contains(o.itemClass);
			});

			e.preventDefault();

			var after = c.direction.y > 0;
			var before = c.direction.y < 0;
			var parentNode = that.placeNode.parentNode;

			if (!o.animation || o.animation && !item.timer) {

				if (o.animation) {
					that.targetRect = rect(item);
					that.placeRect = rect(that.placeNode);
				}

				if ( item.classList.contains(o.parentClass) ) {

					var list = false;
					if ( after ) {
						list = item.lastElementChild;
						list.insertBefore(that.placeNode, list.firstElementChild);
					} else {
						list = item.parentNode;
						list.insertBefore(that.placeNode, item);
					}
				} else {

					// Rearrange the nodes
					if (after) {
						append(that.placeNode, item);
					} else if (before) {
						prepend(that.placeNode, item);
					}
				}

				if ( parentNode.classList.contains(o.listClass) ) {
					if ( !parentNode.childElementCount ||
							(parentNode.childElementCount < 2 && parentNode.firstElementChild === that.dragNode) )
					{
						parentNode.parentNode.classList.remove(that.config.parentClass);
					}
				}

				if (o.animation) {
					animate.call(that, item);
				}
			}
		}
	};

	Nestable.prototype.drop = function(e) {
		e.preventDefault();
	};

	Nestable.prototype.dragend = function(e) {
		this.dragging = false;

		this.stop();
	};

	Nestable.prototype.stop = function() {

		this.currentParent = false;
		this.nesting = false;

		if (this.ghostNode) {
			var that = this;

			if (that.config.animation && that.placeNode) {
				that.placeRect = rect(that.placeNode);
				that.ghostRect = rect(that.ghostNode);

				var x = that.coords.position.x - (that.ghostRect.x1 - that.placeRect.x1);
				var y = that.coords.position.y - (that.ghostRect.y1 - that.placeRect.y1);

				style(that.ghostNode, {
					transform: "translate3d(" + x + "px," + y + "px,0)",
					transition: "transform " + that.config.animation + "ms ease 0ms"
				});

				setTimeout(function() {
					that.resetDragNode();
					that.reset();
				}, that.config.animation);
			} else {
				that.resetDragNode();
				that.reset();
			}
		}
	};

	Nestable.prototype.resetDragNode = function() {
		this.dragNode.classList.remove(this.config.dragClass);
		style(this.dragNode, {
			display: "block"
		});
	};

	Nestable.prototype.reset = function() {
		// Remove the ghost
		document.body.removeChild(this.ghostNode);
		this.ghostNode = null;

		if (this.placeNode) {
			this.removePlaceholder();
		}
	};

	Nestable.prototype.setParent = function() {
		var that = this;

		var listItem, prevSibling = prev(that.placeNode, function(el) { return el && el.classList.contains(that.config.itemClass); });

		if ( prevSibling ) {
			listItem = prevSibling.getElementsByTagName(that.config.listName);

			if ( listItem.length ) {
				listItem[0].appendChild(that.placeNode);

				prevSibling.classList.add(that.config.parentClass);

				// Reset
				that.coords.change.x += that.config.threshold;
			}
		}
	};

	Nestable.prototype.unsetParent = function() {
		var that = this,
				parentNode = that.placeNode.parentNode;

		var lastVisibleChild = that.placeNode === parentNode.lastElementChild || that.placeNode === parentNode.lastElementChild.previousElementSibling;

		if ( lastVisibleChild && parentNode.classList.contains(that.config.listClass) ) {

			var item = closest(that.placeNode, function(el) {
				return el && el.classList.contains(that.config.itemClass);
			});

			if ( item ) {
				if ( item.parentNode.classList.contains(that.config.listClass) ) {

					append(that.placeNode, item);

					// Reset
					that.coords.change.x -= that.config.threshold;

					if ( !parentNode.childElementCount || parentNode.childElementCount < 2 && parentNode.firstElementChild === that.dragNode ) {
						item.classList.remove(that.config.parentClass);
					}

					that.currentParent = false;
				}
			}
		}
	};

	/**
	 * Set the placeholder element
	 * @return {Void}
	 */
	Nestable.prototype.setPlaceholder = function() {
		this.placeNode = createElement(this.config.itemName, { class: this.config.placeClass });
		this.dragNode.parentNode.insertBefore(this.placeNode, this.dragNode);
		this.dragRect = rect(this.dragNode, true);
		this.placeRect = this.dragRect;

		// The placeholder must have the same dimensions as the
		// original element, includeing margins and float
		style(this.placeNode, {
			height: this.dragRect.h,
			float: this.dragRect.float,
			margin: [
				this.dragRect.margin.top,
				this.dragRect.margin.right,
				this.dragRect.margin.bottom,
				this.dragRect.margin.left
			].join("px ") + "px"
		});

		style(this.dragNode, { display: "none" });
	};

	/**
	 * Remove the placeholder element
	 * @return {Void}
	 */
	Nestable.prototype.removePlaceholder = function() {
		this.placeNode.parentNode.replaceChild(this.dragNode, this.placeNode);
		this.placeNode = null;
		this.dragNode = null;
	};

	Nestable.prototype.setPosition = function(e) {
		var c = this.coords, transX, transY;
		var axisX = !this.config.axis || this.config.axis === "x";
		var axisY = !this.config.axis || this.config.axis === "y";

		var pageX = e.type === "touchmove" ? e.changedTouches[0].pageX : e.pageX;
		var pageY = e.type === "touchmove" ? e.changedTouches[0].pageY : e.pageY;

		if (axisX) {
			transX = c.transform.x + (pageX - c.origin.x);
		}

		if (axisY) {
			transY = c.transform.y + (pageY - c.origin.y);
		}

		c.direction = { x: 0, y: 0 };

		if (axisX) {
			if (transX < c.position.x) {
				c.direction.x = -1;
			} else if (transX > c.position.x) {
				c.direction.x = 1;
			}
		}

		if (axisY) {
			if (transY < c.position.y) {
				c.direction.y = -1;
			} else if (transY > c.position.y) {
				c.direction.y = 1;
			}
		}

		c.position.x = axisX ? transX : 0;
		c.position.y = axisY ? transY : 0;

		c.mouse = {
			x: e.pageX,
			y: e.pageY
		};
	};

	root.Nestable = Nestable;
}(this));