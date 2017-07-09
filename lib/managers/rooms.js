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
	* Register a event
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
