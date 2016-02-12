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
