import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameStateSchema, type GameState, type InsertGameState } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Game state routes
  app.get("/api/game/:id", async (req, res) => {
    try {
      const gameState = await storage.getGameState(req.params.id);
      if (!gameState) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: "Failed to get game state" });
    }
  });

  app.get("/api/game/user/:userId", async (req, res) => {
    try {
      const gameState = await storage.getGameStateByUserId(req.params.userId);
      res.json(gameState || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to get game state" });
    }
  });

  app.post("/api/game", async (req, res) => {
    try {
      const validatedData = insertGameStateSchema.parse(req.body);
      const gameState = await storage.createGameState(validatedData);
      res.status(201).json(gameState);
    } catch (error) {
      res.status(400).json({ message: "Invalid game state data" });
    }
  });

  app.patch("/api/game/:id", async (req, res) => {
    try {
      const updateData = insertGameStateSchema.partial().parse(req.body);
      const gameState = await storage.updateGameState(req.params.id, updateData);
      res.json(gameState);
    } catch (error) {
      res.status(400).json({ message: "Failed to update game state" });
    }
  });

  app.delete("/api/game/:id", async (req, res) => {
    try {
      await storage.deleteGameState(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete game state" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
