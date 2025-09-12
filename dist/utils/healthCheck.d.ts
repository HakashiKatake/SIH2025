export interface HealthStatus {
    status: 'healthy' | 'unhealthy';
    services: {
        mongodb: {
            status: 'connected' | 'disconnected' | 'error';
            message?: string;
        };
        redis: {
            status: 'connected' | 'disconnected' | 'error';
            message?: string;
        };
    };
    timestamp: string;
}
export declare const checkDatabaseHealth: () => Promise<HealthStatus>;
//# sourceMappingURL=healthCheck.d.ts.map