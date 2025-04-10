// src/api.ts
import axios from 'axios';

export type TaskStatus = 'pending' | 'success' | 'error' | 'cancelled';

export interface Task {
	id: string;
	status: TaskStatus;
}

export async function submitTask(file: File): Promise<{ taskId: string }> {
	const response = await axios.post('/submit', { fileName: file.name });
	return response.data;
}

export async function pollTaskStatus(taskId: string): Promise<{ status: TaskStatus }> {
	const response = await axios.get(`/status/${taskId}`);
	return response.data;
}

export async function cancelTask(taskId: string): Promise<{ status: TaskStatus }> {
	const response = await axios.post(`/cancel/${taskId}`);
	return response.data;
}
