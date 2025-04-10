import React, { useEffect, useRef, useState } from 'react';
import { cancelTask, pollTaskStatus, submitTask, TaskStatus } from './api';
import {
  Container,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

interface SubmittedTask {
  taskId: string;
  fileName: string;
  status: TaskStatus;
  pollingRetries: number;
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [tasks, setTasks] = useState<SubmittedTask[]>([]);
  // Record polling timers for each task
  const pollingIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Clear all timers when the component unmounts
  useEffect(() => {
    return () => {
      Object.values(pollingIntervals.current).forEach(clearInterval);
    };
  }, []);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF or image files are allowed';
    }
    if (file.size > maxSize) {
      return 'File size must be less than 2MB';
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const errorMsg = validateFile(selectedFile);
      if (errorMsg) {
        alert(errorMsg);
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    }
  };

  const startPolling = (taskId: string) => {
    pollingIntervals.current[taskId] = setInterval(async () => {
      try {
        const res = await pollTaskStatus(taskId);
        setTasks((prevTasks) =>
            prevTasks.map((t) =>
                t.taskId === taskId ? { ...t, status: res.status, pollingRetries: 0 } : t
            )
        );
        if (res.status !== 'pending') {
          clearInterval(pollingIntervals.current[taskId]);
          delete pollingIntervals.current[taskId];
        }
      } catch (err) {
        setTasks((prevTasks) =>
            prevTasks.map((t) => {
              if (t.taskId === taskId) {
                const newRetry = t.pollingRetries + 1;
                if (newRetry >= 3) {
                  clearInterval(pollingIntervals.current[taskId]);
                  delete pollingIntervals.current[taskId];
                  return { ...t, status: 'error', pollingRetries: newRetry };
                }
                return { ...t, pollingRetries: newRetry };
              }
              return t;
            })
        );
      }
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      const { taskId } = await submitTask(file);
      setTasks((prev) => [
        ...prev,
        { taskId, fileName: file.name, status: 'pending', pollingRetries: 0 }
      ]);
      startPolling(taskId);
    } catch (err) {
      alert('Task submission failed');
    } finally {
      setFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleCancelTask = async (taskId: string) => {
    try {
      await cancelTask(taskId);
      // Cancel polling timer
      if (pollingIntervals.current[taskId]) {
        clearInterval(pollingIntervals.current[taskId]);
        delete pollingIntervals.current[taskId];
      }
      setTasks((prevTasks) =>
          prevTasks.map((t) =>
              t.taskId === taskId ? { ...t, status: 'cancelled' } : t
          )
      );
    } catch (err) {
      alert('Cancel task failed');
    }
  };

  return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          File Uploader
        </Typography>
        <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}
        >
          {/* Hidden file input */}
          <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              accept=".pdf,image/*"
              style={{ display: 'none' }}
          />
          <label htmlFor="file-input">
            <Button variant="contained" component="span">
              Choose File
            </Button>
          </label>
          <Button
              type="submit"
              variant="contained"
              disabled={!file}
          >
            Submit File
          </Button>
        </Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Submitted Tasks
        </Typography>
        {tasks.length === 0 ? (
            <Typography>No tasks submitted</Typography>
        ) : (
            <List>
              {tasks.map((task) => (
                  <ListItem key={task.taskId}
                            sx={{
                              border: '1px solid #ccc',
                              borderRadius: 1,
                              mb: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              p: 1
                            }}
                  >
                    <ListItemText
                        primary={`${task.fileName} (Task ID: ${task.taskId})`}
                        secondary={`Status: ${task.status}`}
                    />
                    {task.status === 'pending' && (
                        <Button
                            variant="outlined"
                            onClick={() => handleCancelTask(task.taskId)}
                            sx={{ mt: 1 }}
                        >
                          Cancel Task
                        </Button>
                    )}
                  </ListItem>
              ))}
            </List>
        )}
      </Container>
  );
};

export default App;
