import express, { type Request, Response } from 'express';
import { storage } from './storage';
import Anthropic from '@anthropic-ai/sdk';
import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const app = express();
const server = new Server(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

export function registerRoutes(app: express.Application): Server {
  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // User routes
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Project routes
  app.get('/api/projects/user/:userId', async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjectsByUserId(req.params.userId);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/projects/:id', async (req: Request, res: Response) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/projects', async (req: Request, res: Response) => {
    try {
      const project = await storage.createProject(req.body);
      res.status(201).json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  // File routes
  app.get('/api/projects/:id/files', async (req: Request, res: Response) => {
    try {
      const files = await storage.getProjectFiles(parseInt(req.params.id));
      res.json(files);
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/projects/:id/files', async (req: Request, res: Response) => {
    try {
      const file = await storage.createOrUpdateProjectFile({
        project_id: parseInt(req.params.id),
        path: req.body.path,
        content: req.body.content,
      });
      res.status(201).json(file);
    } catch (error) {
      console.error('Error creating/updating file:', error);
      res.status(500).json({ error: 'Failed to save file' });
    }
  });

  // AI Chat route with streaming
  app.post('/api/claude-stream', async (req: Request, res: Response) => {
    try {
      const { message, mode = 'chat' } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Set up Server-Sent Events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      // Get system prompt based on mode
      const getSystemPrompt = (mode: string): string => {
        switch (mode) {
          case 'code':
            return `You are an expert coding assistant specializing in web development. Focus on:
            - Writing clean, efficient, and well-documented code
            - Following modern best practices and design patterns
            - Providing complete, runnable implementations
            - Explaining your code choices and architecture decisions
            - Suggesting optimizations and improvements`;
          case 'debug':
            return `You are a debugging specialist focused on:
            - Identifying root causes of errors and issues
            - Providing step-by-step debugging strategies
            - Explaining why problems occur and how to prevent them
            - Offering multiple solution approaches
            - Teaching debugging methodologies`;
          default: // chat
            return `You are a helpful and knowledgeable development mentor. Focus on:
            - Providing clear explanations and guidance
            - Being conversational and supportive
            - Sharing best practices and industry insights
            - Helping with architecture and design decisions
            - Encouraging learning and growth`;
        }
      };

      // Create streaming response
      const stream = anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: getSystemPrompt(mode),
        messages: [{
          role: 'user',
          content: message
        }]
      });

      stream.on('text', (text) => {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      });

      stream.on('end', () => {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      });

      stream.on('error', (error) => {
        console.error('Streaming error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`);
        res.end();
      });

      // Handle client disconnect
      req.on('close', () => {
        stream.abort();
      });

    } catch (error) {
      console.error('Claude API error:', error);
      res.status(500).json({ error: 'Failed to process AI request' });
    }
  });

  // Deployment routes
  app.get('/api/projects/:id/deployments', async (req: Request, res: Response) => {
    try {
      const deployments = await storage.getProjectDeployments(parseInt(req.params.id));
      res.json(deployments);
    } catch (error) {
      console.error('Error fetching deployments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/projects/:id/deploy', async (req: Request, res: Response) => {
    try {
      // Placeholder for deployment logic
      // This would integrate with Netlify or other deployment services
      const deployment = await storage.createProjectDeployment({
        project_id: parseInt(req.params.id),
        deployment_url: 'https://placeholder-deploy-url.netlify.app',
        status: 'pending',
      });
      
      res.status(201).json(deployment);
    } catch (error) {
      console.error('Error creating deployment:', error);
      res.status(500).json({ error: 'Failed to create deployment' });
    }
  });

  return server;
}