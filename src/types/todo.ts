export type TodoStatus = 'Pending' | 'Completed' | 'Failed';

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  deadline: string; // ISO 8601 timestamp
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  deadline: string; // ISO 8601
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  deadline?: string;
  status?: TodoStatus;
}
