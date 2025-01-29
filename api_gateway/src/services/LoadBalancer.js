const AppError = require('../utils/AppError');

class LoadBalancer {
    constructor(instances = []) {
        if (!Array.isArray(instances) || instances.length === 0) {
            throw new Error('At least one service instance is required.');
        }
        this.instances = instances; // List of instance URLs
        this.currentIndex = 0;      // Tracks the next instance to use
        this.instanceStats = {};    // Tracks the number of requests per instance
        instances.forEach(instance => {
            this.instanceStats[instance] = { requests: 0, failures: 0 };
        });
    }


    // get the available instances using Round-Robin strategy
    getNextInstance() {
        if (this.instances.length === 0) {
            throw new AppError(400, "No available service instances");
        }

        const instance = this.instances[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.instances.length;
        this.instanceStats[instance].request += 1;
        return instance;
    }

    markInstanceFailed(instance, remove = false) {
        if (this.instanceStats[instance]) {
            this.instanceStats[instance].failure += 1;
        }
        if (remove) {
            this.instances = this.instances.filter(inst => inst !== instance);
        }
    }

    // add new instance to the pool
    addInstance(instance) {
        if (!this.instances.includes(instance)) {
            this.instances.push(instance);
            this.instanceStats[instance] = { request: 0, failure: 0 };
        }
    }

    getInstanceStats() {
        return this.instanceStats;
    }
}

module.exports = LoadBalancer;