(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = Collaboratio;

class Collaboratio {

	/**
	 * Collaboratio constructor
	 * @param {SocketIo} socket Socket.io socket
	 */
	constructor(socket) {
		this.socket = socket;
		this.managers = [];

		this.loadEventManagers();
		this.exposeChildren();
	}

	/**
	* Load the events managers from /lib/managers folder
	*/
	loadEventManagers () {
		let requires = require('./lib/managers-loader');
		for (let manager of requires) {
				this.managers.push(manager(this.socket));
		}
	}

	/**
	* Expose the manager functionalities to outer
	*/
	exposeChildren () {
		let extend = (obj, extension) => {
			for (var i in extension) {
			  if (extension.hasOwnProperty(i)) {
			     obj[i] = extension[i];
			  }
			}
		}

		for (let manager of managers) {
			extend(this, manager.expose());
		}
	};
}

},{"./lib/managers-loader":3}],2:[function(require,module,exports){
'use strict';

module.exports = CollaboratioEvent;

class CollaboratioEvent {

	constructor(eventName) {
		this.subscriptions = [];
		this.loaded = false;
		this.name = eventName;
	}

	subscribe (fn) {
		if(typeof fn == 'function')
			this.subscriptions.push(fn);

		return this;
	}

	call (data) {
		for (let subscription of subscriptions) {
			subscription(data);
		}
	}
}

},{}],3:[function(require,module,exports){
'use strict';

module.exports.rooms = require('./managers/rooms');

},{"./managers/rooms":4}],4:[function(require,module,exports){
'use strict';

let CollaboratioEvent = require('../collaboratioEvent');

module.exports = RoomsManager;

class RoomsManager {

	/**
	 * RoomsManager constructor
	 * @param  socket SocketIO
	 */
	constructor(socket) {
		this.socket = socket;
		this.prefix = 'room';
		this.events = {};
	}

	/**
	* Given a name, get the event with this name or create one
	*
	* USAGE:
	* 	collaboratio.on('create')
	* 		.subscribe((data) => bar(data))
	* 		.subscribe((data) => foo(data))
	*
	* @param  {String} eventName 	Event's name
	* @return {CollaboratioEvent}	Event
	*/
	on (eventName) {

		/**
		* Register the event in a Socket
		* @param  {RoomsManager} manager Manager
		* @param  {CollaboratioEvent} event   Event
		*/
		let registerEvent = (manager, event) => {
			manager.socket.on(`${manager.prefix}:${event.name}`, (data) => {
				this.getOrCreateEvent(event.name).call(data);
			});
		}

		if (!this.events.hasOwnProperty(eventName)) {
			this.events[eventName] = new CollaboratioEvent(eventName);
			registerEvent(this, this.events[eventName]);
			this.events[eventName].loaded = true;
		}
		return this.events[eventName];
	}

	createRoom (roomName) {
		if(!roomName) return false;
		this.socket.emit('room:create', roomName);
		return true;
	}

	joinRoom (roomName) {
		if(!roomName) return false;
		this.socket.emit('room:join', roomName);
		return true;
	}

	listRooms () {
		this.socket.emit('room:list');
	}

	/**
	* Expose functionality
	* @return {object} Object, which has an attribute labeled as rooms. Rooms contains as attributes each of RoomsManager's functionalities.
	*/
	expose () {
		return {
			rooms : {
				create : this.createRoom,
				join : this.joinRoom,
				list : this.listRooms,
				on : this.on
				/*
				remove: removeRoom,
				get: getRoom,
				exists: existsRoom*/
			}
		}
	}
}

},{"../collaboratioEvent":2}]},{},[1]);
