import { apiService } from './api.service';

export interface BooleanExample {
  id: string;
  title: string;
  expression: string;
  description: string;
  learningFocus: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'simplification' | 'distribution' | 'logic' | 'advanced';
  variableCount: number;
  lawsUsed: string[];
  tags: string[];
  actualVariables: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExampleFilters {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: 'simplification' | 'distribution' | 'logic' | 'advanced';
  variableCount?: number;
  tags?: string[];
}

export interface CreateExampleDto {
  title: string;
  expression: string;
  description: string;
  learningFocus: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'simplification' | 'distribution' | 'logic' | 'advanced';
  lawsUsed: string[];
  tags: string[];
  sortOrder?: number;
}

class ExamplesService {
  /**
   * Get all examples with optional filters
   */
  async getAll(filters?: ExampleFilters): Promise<BooleanExample[]> {
    const params = new URLSearchParams();
    
    if (filters?.difficulty) {
      params.append('difficulty', filters.difficulty);
    }
    if (filters?.category) {
      params.append('category', filters.category);
    }
    if (filters?.variableCount !== undefined) {
      params.append('variableCount', String(filters.variableCount));
    }
    if (filters?.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    const queryString = params.toString();
    const url = queryString ? `/examples?${queryString}` : '/examples';
    
    return apiService.get<BooleanExample[]>(url);
  }

  /**
   * Get a single example by ID
   */
  async getById(id: string): Promise<BooleanExample> {
    return apiService.get<BooleanExample>(`/examples/${id}`);
  }

  /**
   * Get a random example with optional filters
   */
  async getRandom(filters?: Partial<ExampleFilters>): Promise<BooleanExample> {
    const params = new URLSearchParams();
    
    if (filters?.difficulty) {
      params.append('difficulty', filters.difficulty);
    }
    if (filters?.variableCount !== undefined) {
      params.append('variableCount', String(filters.variableCount));
    }

    const queryString = params.toString();
    const url = queryString ? `/examples/random?${queryString}` : '/examples/random';
    
    return apiService.get<BooleanExample>(url);
  }

  /**
   * Create a new example (for manual population)
   */
  async create(data: CreateExampleDto): Promise<BooleanExample> {
    return apiService.post<BooleanExample>('/examples', data);
  }

  /**
   * Verify an example
   */
  async verify(id: string): Promise<any> {
    return apiService.post(`/examples/${id}/verify`, {});
  }

  /**
   * Verify all examples
   */
  async verifyAll(): Promise<any> {
    return apiService.post('/examples/verify-all', {});
  }
}

export const examplesService = new ExamplesService();
