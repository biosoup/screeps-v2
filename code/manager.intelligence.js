class Intelligence {
    /**
     * Init the class
     * @return {tasks}
     */
    static init() {
        if (Intelligence._init !== true) {
            Intelligence._init = true;
        }
    }
    /**
     * Creates an instance.
     *
     * @constructor
     * @this {tasks}
     */
    constructor(empire) {
        Intelligence.init();
        this.name = Game.shard.name
        this.empire = empire
    }

    get name() {
        return this._name;
    }
    set name(v) {
        this._name = v;
    }

    get empire() {
        return this._empire;
    }
    set empire(v) {
        this._empire = v;
    }

    /**
     * Get memory
     * @return {Object}
     */
    get memory() {
        if (Memory.intelligence === undefined) Memory.intelligence = {};
        return Memory.intelligence;
    }

    run() {

    }

    collectRoom() {

    }

    statistics() {
        //send stats about collection to grafana
    }
}

module.exports = Intelligence;

Room.prototype.prepareIntell = function(roomName) {
    //gather all needed information
    let room = Game.rooms[roomName]

	//get room type
	
	//get enemy status

	//

	//return true, when finished and creep can move on to another room
	return true
}

/**
 * Creep method optimizations "getActiveBodyparts"
 */
Creep.prototype.getActiveBodyparts = function(type) {
    var count = 0;
    for (var i = this.body.length; i-- > 0;) {
        if (this.body[i].hits > 0) {
            if (this.body[i].type === type) {
                count++;
            }
        } else break;
    }
    return count;
};​

/**
 * Fast check if bodypart exists
 */
Creep.prototype.hasActiveBodyparts = function(type) {
    for (var i = this.body.length; i-- > 0;) {
        if (this.body[i].hits > 0) {
            if (this.body[i].type === type) {
                return true;
            }
        } else break;
    }
    return false;
};

Creep.prototype.getActiveBodypartsBoostEquivalent = function(type, action) {
	var total = 0;
	for (var i = this.body.length; i-- > 0; ) {
	  var x = this.body[i];
	  if (x.hits <= 0) {
		break;
	  }
	  if (x.type == type) {
		if (x.boost !== undefined) {
		  total += BOOSTS[type][x.boost][action];
		} else {
		  total += 1;
		}
	  }
	}
	return total;
  };
  
  Creep.prototype.getBodypartsBoostEquivalent = function(type, action) {
	var total = 0;
	for (var i = this.body.length; i-- > 0; ) {
	  var x = this.body[i];
	  if (x.type == type) {
		if (x.boost !== undefined) {
		  total += BOOSTS[type][x.boost][action];
		} else {
		  total += 1;
		}
	  }
	}
	return total;
  };