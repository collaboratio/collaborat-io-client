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
