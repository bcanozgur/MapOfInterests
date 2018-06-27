function PoiObj() {
    this._lat = null;
    this._lng = null;
    this._name = null;
    this._icon = null;
    this._distance = null;
    this._time = null;
}

PoiObj.prototype.constructor = PoiObj;

Object.defineProperties(PoiObj.prototype, {
    "lat": {
        get: function () {
            return this._lat;
        },
        set: function (value) {
            this._lat = value;
        }
    },
    "lng": {
        get: function () {
            return this._lng;
        },
        set: function (value) {
            this._lng = value;
        }
    },
    "name": {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        }
    },
    "icon": {
        get: function () {
            return this._icon;
        },
        set: function (value) {
            this._icon = value;
        }
    },
    "distance": {
        get: function () {
            return this._distance;
        },
        set: function (value) {
            this._distance = value;
        }
    },"time": {
        get: function () {
            return this.time;
        },
        set: function (value) {
            this.time = value;
        }
    }
});