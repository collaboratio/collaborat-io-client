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
