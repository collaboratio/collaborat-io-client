(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Collaboratio = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = Collaboratio;

/**
 * Collaboratio constructor
 * @param {SocketIo} socket Socket.io socket
 */
function Collaboratio(socket) {
	this.socket = socket;
	this.managers = [];

	this.loadEventManagers();
	this.exposeChildren();
}

/**
 * Load the events managers from /lib/managers folder
 */
Collaboratio.prototype.loadEventManagers = function () {
	var requires = require('./lib/managers-loader');
	for (var managerName in requires) {
		if (requires.hasOwnProperty(managerName)) {
			this.managers.push(requires[managerName](this.socket));
		}
	}
};

/**
 * Expose the manager functionalities to outer
 */
Collaboratio.prototype.exposeChildren = function () {
	this.managers.forEach(function (manager) {
		extend(this, manager.expose());
	}.bind(this));
};

function extend(obj, extension) {
	for (var i in extension) {
	  if (extension.hasOwnProperty(i)) {
	     obj[i] = extension[i];
	  }
	}
}

},{"./lib/managers-loader":3}],2:[function(require,module,exports){
'use strict';

module.exports = CollaboratioEvent;

function CollaboratioEvent(eventName) {
	if(!(this instanceof CollaboratioEvent)) return new CollaboratioEvent(eventName);

	this.subscriptions = [];
	this.loaded = false;
	this.name = eventName;
}

CollaboratioEvent.prototype.suscribe = function (fn) {
	if(typeof fn == 'function') this.subscriptions.push(fn);
	return this;
};

CollaboratioEvent.prototype.call = function () {
	this.subscriptions.forEach(function (subscription) { subscription(); });
};

},{}],3:[function(require,module,exports){
'use strict';

module.exports.rooms = require('./managers/rooms');

},{"./managers/rooms":4}],4:[function(require,module,exports){
'use strict';

var CollaboratioEvent = require('../collaboratioEvent');

module.exports = RoomsManager;

/**
 * RoomsManager constructor
 */
function RoomsManager (socket){
	if(!(this instanceof RoomsManager)) return new RoomsManager(socket);

	this.socket = socket;
	this.prefix = 'room';
	this.events = {};

}

/**
 * Given a name, get the event with this name or create one
 * @param  {String} eventName 	Event's name
 * @return {CollaboratioEvent}	Event
 */
RoomsManager.prototype.getOrCreateEvent = function (eventName) {
	if (!this.events.hasOwnProperty(eventName)) {
		this.events[eventName] = new CollaboratioEvent(eventName);
		registerEvent(this, this.events[eventName]);
		this.events[eventName].loaded = true;
	}
	return this.events[eventName];
};

/**
 * Subscribe a function to an event
 * @param  {String}   eventName Event's name
 * @param  {Function} fn        Function
 */
RoomsManager.prototype.subscribe = function (eventName, fn) {
	this.getOrCreateEvent(eventName).suscribe(fn);
};


/**
 * Register the event in a Socket
 * @param  {RoomsManager} manager Manager
 * @param  {CollaboratioEvent} event   Event
 */
function registerEvent(manager, event) {
	manager.socket.on(manager.prefix + ':' +  event.name, function (data) {
		this.getOrCreateEvent(event.name).call();
	}.bind(manager));
}

/**
 * Expose functionality
 * @return {object} Object, which has an attribute labeled as rooms. Rooms contains as attributes each of RoomsManager's functionalities.
 */
RoomsManager.prototype.expose = function () {

	var createRoom = function (roomName) {
		if(!roomName) return false;
		this.socket.emit('room:create', roomName);
		return true;
	}.bind(this);

	return {
		rooms : {
			create : createRoom,
			subscribe: this.subscribe.bind(this)
			/*
			remove: removeRoom,
			join: joinRoom,
			leave: leaveRoom,
			get: getRoom,
			exists: existsRoom*/
		}
	}
}

},{"../collaboratioEvent":2}]},{},[1])(1)
});