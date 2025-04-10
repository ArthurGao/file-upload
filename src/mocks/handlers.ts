import {http, HttpResponse} from 'msw'

interface Task {
	progress: number;
	maxTries: number;
	cancelled: boolean;
}

const tasks: Record<string, Task> = {};

export const handlers = [

	http.post('/submit', (req) => {
		const taskId = Date.now().toString();
		tasks[taskId] = {
			progress: 0,
			maxTries: Math.floor(Math.random() * 5) + 5,
			cancelled: false,
		};
		return HttpResponse.json({taskId});
	}),

	http.get('/status/:taskId', (req) => {
		const {taskId} = req.params as { taskId: string };
		const task = tasks[taskId];

		if (!task) {
			return HttpResponse.json({error: 'Task not found'}, {status: 404});
		}

		if (Math.random() < 0.2) {
			return HttpResponse.json(
				{error: 'Network error simulated'},
				{status: 500}
			);
		}

		if (task.cancelled) {
			return HttpResponse.json({status: 'cancelled'});
		}

		task.progress++;

		if (task.progress >= task.maxTries) {
			const status = Math.random() < 0.8 ? 'success' : 'error';
			return HttpResponse.json({status});
		}

		return HttpResponse.json({status: 'pending'});
	}),

	http.post('/cancel/:taskId', (req) => {
		const {taskId} = req.params as { taskId: string };
		const task = tasks[taskId];

		if (task) {
			task.cancelled = true;
			return HttpResponse.json({status: 'cancelled'});
		}
		return HttpResponse.json({error: 'Task not found'}, {status: 404});
	}),
];
