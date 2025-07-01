import dotenv from 'dotenv';

// Load environment variables at the very top
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import type { User, Project, ProjectFile, ProjectDeployment, ProjectConfig } from '../shared/schema';

interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: string): Promise<Project[]>;
  createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // File methods
  getProjectFiles(projectId: number): Promise<ProjectFile[]>;
  getProjectFile(projectId: number, path: string): Promise<ProjectFile | undefined>;
  createOrUpdateProjectFile(file: Omit<ProjectFile, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectFile>;
  deleteProjectFile(projectId: number, path: string): Promise<boolean>;

  // Deployment methods
  getProjectDeployments(projectId: number): Promise<ProjectDeployment[]>;
  createProjectDeployment(deployment: Omit<ProjectDeployment, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectDeployment>;
  updateProjectDeployment(id: number, updates: Partial<ProjectDeployment>): Promise<ProjectDeployment | undefined>;

  // Config methods
  getProjectConfig(projectId: number): Promise<ProjectConfig | undefined>;
  createOrUpdateProjectConfig(config: Omit<ProjectConfig, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectConfig>;
}

class SupabaseStorage implements IStorage {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL and Service Key are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('🔄 SupabaseStorage initialized successfully');
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }

    return data;
  }

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert([user])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return data;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return undefined;
    }

    return data;
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return undefined;
    }

    return data;
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    return data || [];
  }

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert([project])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    return data;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const { data, error } = await this.supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return undefined;
    }

    return data;
  }

  async deleteProject(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }

    return true;
  }

  // File methods
  async getProjectFiles(projectId: number): Promise<ProjectFile[]> {
    const { data, error } = await this.supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('path', { ascending: true });

    if (error) {
      console.error('Error fetching project files:', error);
      return [];
    }

    return data || [];
  }

  async getProjectFile(projectId: number, path: string): Promise<ProjectFile | undefined> {
    const { data, error } = await this.supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .eq('path', path)
      .single();

    if (error) {
      console.error('Error fetching project file:', error);
      return undefined;
    }

    return data;
  }

  async createOrUpdateProjectFile(file: Omit<ProjectFile, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectFile> {
    const { data, error } = await this.supabase
      .from('project_files')
      .upsert([file], { onConflict: 'project_id,path' })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating project file:', error);
      throw error;
    }

    return data;
  }

  async deleteProjectFile(projectId: number, path: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('project_files')
      .delete()
      .eq('project_id', projectId)
      .eq('path', path);

    if (error) {
      console.error('Error deleting project file:', error);
      return false;
    }

    return true;
  }

  // Deployment methods
  async getProjectDeployments(projectId: number): Promise<ProjectDeployment[]> {
    const { data, error } = await this.supabase
      .from('project_deployments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project deployments:', error);
      return [];
    }

    return data || [];
  }

  async createProjectDeployment(deployment: Omit<ProjectDeployment, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectDeployment> {
    const { data, error } = await this.supabase
      .from('project_deployments')
      .insert([deployment])
      .select()
      .single();

    if (error) {
      console.error('Error creating project deployment:', error);
      throw error;
    }

    return data;
  }

  async updateProjectDeployment(id: number, updates: Partial<ProjectDeployment>): Promise<ProjectDeployment | undefined> {
    const { data, error } = await this.supabase
      .from('project_deployments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project deployment:', error);
      return undefined;
    }

    return data;
  }

  // Config methods
  async getProjectConfig(projectId: number): Promise<ProjectConfig | undefined> {
    const { data, error } = await this.supabase
      .from('project_configs')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project config:', error);
      return undefined;
    }

    return data;
  }

  async createOrUpdateProjectConfig(config: Omit<ProjectConfig, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectConfig> {
    const { data, error } = await this.supabase
      .from('project_configs')
      .upsert([config], { onConflict: 'project_id' })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating project config:', error);
      throw error;
    }

    return data;
  }
}

class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private projects: Map<number, Project> = new Map();
  private files: Map<string, ProjectFile> = new Map();
  private deployments: Map<number, ProjectDeployment> = new Map();
  private configs: Map<number, ProjectConfig> = new Map();
  private nextId = 1;

  constructor() {
    console.log('🧠 MemStorage initialized (in-memory storage)');
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: `user_${this.nextId++}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = {
      ...user,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Project methods (simplified - implement full versions as needed)
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.user_id === userId);
  }

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: this.nextId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.projects.set(newProject.id, newProject);
    return newProject;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = {
      ...project,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // File methods (simplified)
  async getProjectFiles(projectId: number): Promise<ProjectFile[]> {
    return Array.from(this.files.values()).filter(f => f.project_id === projectId);
  }

  async getProjectFile(projectId: number, path: string): Promise<ProjectFile | undefined> {
    const key = `${projectId}:${path}`;
    return this.files.get(key);
  }

  async createOrUpdateProjectFile(file: Omit<ProjectFile, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectFile> {
    const key = `${file.project_id}:${file.path}`;
    const existingFile = this.files.get(key);
    
    const newFile: ProjectFile = {
      ...file,
      id: existingFile?.id || this.nextId++,
      created_at: existingFile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.files.set(key, newFile);
    return newFile;
  }

  async deleteProjectFile(projectId: number, path: string): Promise<boolean> {
    const key = `${projectId}:${path}`;
    return this.files.delete(key);
  }

  // Deployment methods (simplified)
  async getProjectDeployments(projectId: number): Promise<ProjectDeployment[]> {
    return Array.from(this.deployments.values()).filter(d => d.project_id === projectId);
  }

  async createProjectDeployment(deployment: Omit<ProjectDeployment, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectDeployment> {
    const newDeployment: ProjectDeployment = {
      ...deployment,
      id: this.nextId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.deployments.set(newDeployment.id, newDeployment);
    return newDeployment;
  }

  async updateProjectDeployment(id: number, updates: Partial<ProjectDeployment>): Promise<ProjectDeployment | undefined> {
    const deployment = this.deployments.get(id);
    if (!deployment) return undefined;

    const updatedDeployment = {
      ...deployment,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.deployments.set(id, updatedDeployment);
    return updatedDeployment;
  }

  // Config methods (simplified)
  async getProjectConfig(projectId: number): Promise<ProjectConfig | undefined> {
    return this.configs.get(projectId);
  }

  async createOrUpdateProjectConfig(config: Omit<ProjectConfig, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectConfig> {
    const existingConfig = this.configs.get(config.project_id);
    
    const newConfig: ProjectConfig = {
      ...config,
      id: existingConfig?.id || this.nextId++,
      created_at: existingConfig?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.configs.set(config.project_id, newConfig);
    return newConfig;
  }
}

// Create and export storage instance
const useSupabase = process.env.USE_SUPABASE === 'true';
const storage: IStorage = useSupabase ? new SupabaseStorage() : new MemStorage();

export { storage, type IStorage };