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
