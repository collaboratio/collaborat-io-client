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
	this.getOrCreateEvent(eventName).subscribe(fn);
};


/**
 * Register the event in a Socket
 * @param  {RoomsManager} manager Manager
 * @param  {CollaboratioEvent} event   Event
 */
function registerEvent(manager, event) {
	manager.socket.on(manager.prefix + ':' +  event.name, function (data) {
		this.getOrCreateEvent(event.name).call(data);
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

	var joinRoom = function (roomName) {
		if(!roomName) return false;
		this.socket.emit('room:join', roomName);
		return true;
	}.bind(this);

	var listRooms = function () {
		this.socket.emit('room:list');
	}.bind(this);

	return {
		rooms : {
			create : createRoom,
			join : joinRoom,
			list : listRooms,
			subscribe: this.subscribe.bind(this)
			/*
			remove: removeRoom,
			get: getRoom,
			exists: existsRoom*/
		}
	}
}
