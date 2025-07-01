export interface User {
  id: string; // UUID
  username: string;
  email: string;
  plan: 'free' | 'pro' | 'team';
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  user_id: string; // UUID foreign key
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  deployed_url?: string;
  deployment_status?: 'pending' | 'building' | 'deployed' | 'failed';
}

export interface ProjectFile {
  id: number;
  project_id: number;
  path: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDeployment {
  id: number;
  project_id: number;
  deployment_url: string;
  status: 'pending' | 'building' | 'deployed' | 'failed';
  created_at: string;
  updated_at: string;
  build_logs?: string;
}

export interface ProjectConfig {
  id: number;
  project_id: number;
  framework: string;
  build_command?: string;
  output_directory?: string;
  environment_variables?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

// Zod schemas for validation
import { z } from 'zod';

export const insertUserSchema = z.object({
  username: z.string().min(1).max(50),
  email: z.string().email(),
  plan: z.enum(['free', 'pro', 'team']).default('free'),
  stripe_customer_id: z.string().optional(),
});

export const insertProjectSchema = z.object({
  user_id: z.string().uuid(), // UUID validation
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const insertProjectFileSchema = z.object({
  project_id: z.number().positive(),
  path: z.string().min(1),
  content: z.string(),
});

export const insertProjectDeploymentSchema = z.object({
  project_id: z.number().positive(),
  deployment_url: z.string().url(),
  status: z.enum(['pending', 'building', 'deployed', 'failed']),
  build_logs: z.string().optional(),
});

export const insertProjectConfigSchema = z.object({
  project_id: z.number().positive(),
  framework: z.string().min(1),
  build_command: z.string().optional(),
  output_directory: z.string().optional(),
  environment_variables: z.record(z.string()).optional(),
});

// Export types for the schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertProjectFile = z.infer<typeof insertProjectFileSchema>;
export type InsertProjectDeployment = z.infer<typeof insertProjectDeploymentSchema>;
export type InsertProjectConfig = z.infer<typeof insertProjectConfigSchema>;