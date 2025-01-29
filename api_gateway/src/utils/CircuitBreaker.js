const AppError = require('./AppError');


class CircuitBreaker {
    constructor(loaBalancer, failureThreshold = 5, resetTimeout = 30000) {
        this.loaBalancer = loaBalancer;
        this.failureThreshold = failureThreshold;
        this.resetTimeout = resetTimeout;
        this.failures = 0;
        this.status = 'CLOSED';  // "CLOSED", "OPEN", "HALF-OPEN"
        this.lastFailureTime = null;
    }

    
}