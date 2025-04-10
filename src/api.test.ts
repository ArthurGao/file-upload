import axios from 'axios';
import { submitTask, pollTaskStatus, cancelTask, TaskStatus } from './api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API module', () => {
	describe('submitTask', () => {
		it('should submit a file and return a taskId', async () => {
			// Create a dummy file for testing
			const file = new File(['dummy content'], 'example.pdf', { type: 'application/pdf' });
			const taskId = '123456';
			// Mock axios.post to resolve with a taskId
			mockedAxios.post.mockResolvedValue({ data: { taskId } });

			const result = await submitTask(file);

			expect(mockedAxios.post).toHaveBeenCalledWith('/submit', { fileName: file.name });
			expect(result).toEqual({ taskId });
		});
	});

	describe('pollTaskStatus', () => {
		it('should return the task status', async () => {
			const taskId = '123456';
			const status: TaskStatus = 'pending';
			mockedAxios.get.mockResolvedValue({ data: { status } });

			const result = await pollTaskStatus(taskId);

			expect(mockedAxios.get).toHaveBeenCalledWith(`/status/${taskId}`);
			expect(result).toEqual({ status });
		});
	});

	describe('cancelTask', () => {
		it('should cancel the task and return cancelled status', async () => {
			const taskId = '123456';
			const status: TaskStatus = 'cancelled';
			mockedAxios.post.mockResolvedValue({ data: { status } });

			const result = await cancelTask(taskId);

			expect(mockedAxios.post).toHaveBeenCalledWith(`/cancel/${taskId}`);
			expect(result).toEqual({ status });
		});
	});
});
