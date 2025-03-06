
class Sailors extends Workers {
    constructor(data) {
        super(data);
        this.shipID = null; // ID du navire auquel il est assigné
        this.busy = false;
    }
}