import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from "supertest";
import { app } from "../../src/app";
import mongoose from "mongoose";

describe("Auth Integration Tests", () => {
    beforeAll(async () => {
        // Wait for Mongoose to connect
        let retries = 5;
        while (mongoose.connection.readyState !== 1 && retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            retries--;
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it("should return 200 OK for health check", async () => {
        const res = await request(app).get("/api/v1/health");
        expect(res.status).toBe(200);
        // Adjust expectation based on actual response
    });

    it("should return 401 for protected route without token", async () => {
        const res = await request(app).get("/api/v1/me");
        expect(res.status).toBe(401);
    });
});
