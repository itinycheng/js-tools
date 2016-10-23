/**
 * Created by 16072453 on 2016/10/22.
 */

var Event = {

    /**
     *
     * event delegation
     * @param {Element|Object} element
     * @param {String} selector
     * @param {String} type
     * @param {Json|Object|Function} data
     * @param {Function|Object=} callback
     */
    delegate: function (element, selector, type, data, callback) {
        var _this = this;
        if (!callback && typeof data === 'function'){
            callback = data;
            data = undefined;
        }
        function handler(event) {
            if (!event) return;
            // Stop event bubbling up
            // !!event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
            event.delegateTarget = _this.closest(element, event.target || event.srcElement, selector);
            event.currentTarget = element;
            event.data = data || null;
            if (event.delegateTarget && callback) {
                callback.call(element, event);
            }
        }
        _this.add(element, type, handler);
    },

    /**
     *
     * @param {Element|Object} context
     * @param {Element|Object} target
     * @param {String Exp} selector
     * @returns {Element|Object} Delegate target
     */
    closest: function (context, target, selector) {
        // TODO Search delegate target by expression
        // Search delegate target by nodeName
        while (target && target != context) {
            if (target.nodeName.toUpperCase() === selector.toUpperCase())
                return target;
            target = target.parentNode;
        }
    },

    /**
     * add event listener
     * @param {Element|Object} element
     * @param {String} [type] The type of the current event
     * @param {Function} callback
     * @returns {Event}
     */
    add: function (element, type, callback) {
        var _this = this;
        if (element.addEventListener) {
            // Supported for modern browsers and IE9+
            element.addEventListener(type, callback, false);
        } else if (element.attachEvent) {
            // Supported for IE5+
            if (type.indexOf('custom') != -1) {
                // Add user-defined event
                if (isNaN(element[type])) {
                    element[type] = 0;
                }
                var fun = function (event) {
                    event = event || window.event;
                    if (event.propertyName == type) {
                        callback.call(element, event);
                    }
                };
                element.attachEvent('onpropertychange', fun);
                // Bind callback function to the element
                if (!element['callback-' + type]) {
                    element['callback-' + type] = fun;
                }
            } else {
                // Add standard event
                element.attachEvent('on' + type, callback);
            }
        } else {
            // Supported for Others
            element['on' + type] = callback;
        }
        return _this;
    },

    /**
     * remove event listener
     * @param {Element|Object} element
     * @param {String} [type] The type of the current event
     * @param {Function} callback
     * @returns {Event}
     */
    remove: function (element, type, callback) {
        var _this = this;
        if (element.removeEventListener) {
            // Supported for modern browsers and IE9+
            element.removeEventListener(type, callback, false);
        } else if (element.detachEvent) {
            // Supported for IE5+
            if (type.indexOf('custom') != -1) {
                // remove user-defined event
                element.detachEvent('onpropertychange', element['callback-' + type]);
                element['callback-' + type] = null;
            } else {
                // remove standard event
                element.detachEvent('on' + type, callback);
            }
        } else {
            //Supported for Others
            element['on' + type] = null;
        }
        return _this;
    },

    /**
     * trigger event
     * @param {Element|Object} element
     * @param {String} [type] The type of the current event
     * @returns {Event}
     */
    trigger: function (element, type) {
        var _this = this;
        if (element.dispatchEvent) {
            var event = document.createEvent('Event');
            event.initEvent(type, true, true);
            element.dispatchEvent(event);
        } else if (element.fireEvent) {
            if (type.indexOf('custom') != -1) {
                element[type]++;
            } else {
                element.fireEvent('on' + type);
            }
        }
        return _this;
    },

    /**
     * bind callback function to the element
     * @param {Element|Object} element
     * @param {Function} handler
     * @returns {Function}
     */
    bind: function (element, handler) {
        element = element || window;
        var args = arguments[2] || null;
        return function (e) {
            e.data = args;
            e.currentTarget = element;
            handler.call(element, e);
        };
    }
};