import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import IconButton from '@mui/material/IconButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import styles from './Todo.module.scss';

interface ITask {
  id: number;
  description: string;
  done: boolean;
  dateAdded: Date;
  deadline: Date | null;
}

function createData(id: number, description: string, done: boolean, dateAdded: Date, deadline: Date | null): ITask {
  return { id, description, done, dateAdded, deadline };
}

const initialRows: ITask[] = [
  createData(1, 'Sample Task 1', false, new Date(), new Date('11-11-2111'))
];

export default function Todo() {
  const [rows, setRows] = useState<ITask[]>(initialRows);
  const [editing, setEditing] = useState<{ id: number, task: ITask } | null>(null);
  const [temp, setTemp] = useState<{ description: string, deadline: Date | null }>({ description: '', deadline: null });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteCandidate, setDeleteCandidate] = useState<number | null>(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setRows(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(rows));
  }, [rows]);

  const addTask = () => {
    if (temp.description && temp.deadline) {
      const newTask = createData(
        rows.length + 1,
        temp.description,
        false,
        new Date(),
        temp.deadline
      );
      setRows([...rows, newTask]);
      setEditing({ id: newTask.id, task: newTask });
    }
    setTemp({ description: '', deadline: null }); // reset temp state
  };

  const editTask = (id: number) => {
    const task = rows.find(row => row.id === id);
    if (task) {
      setEditing({ id, task: { ...task } });
    }
  };

  const updateTask = (id: number, prop: keyof ITask, value: any) => {
    setRows(
      rows.map((row) =>
        row.id !== id ? row : { ...row, [prop]: value }
      )
    );
  };

  const confirmDeleteTask = (id: number) => {
    setDeleteConfirmOpen(true);
    setDeleteCandidate(id);
  };

  const deleteTask = (id: number) => {
    setRows(rows.filter((row) => row.id !== id));
    setDeleteConfirmOpen(false);
  };

  const updateEditingTask = <K extends keyof ITask>(prop: K, value: ITask[K]) => {
    if (editing) {
      setEditing({ ...editing, task: { ...editing.task, [prop]: value } });
    }
  };

  const saveEditingTask = () => {
    if (editing) {
      setRows(
        rows.map((row) =>
          row.id !== editing.id ? row : editing.task
        )
      );
      setEditing(null);
    }
  };

  return (
    <>
      {rows.length > 0 ? (
        <Table sx={{ minWidth: 650 }} aria-label="simple table" className={styles.todo}>
          <TableHead>
            <TableRow>
              <TableCell>Done</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Date added</TableCell>
              <TableCell align="right">Deadline</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className={styles.row}>
                <TableCell>
                  <Checkbox
                    checked={row.done}
                    onChange={(e) => updateTask(row.id, 'done', e.target.checked)}
                  />
                </TableCell>
                <TableCell className={styles.description}>
                  {editing?.id === row.id ? (
                    <TextField
                      label="What needs to be done"
                      value={editing.task.description}
                      onChange={(e) => updateEditingTask('description', e.target.value)}
                    />
                  ) : (
                    row.description
                  )}
                </TableCell>
                <TableCell align="right">{format(new Date(row.dateAdded), 'PP')}</TableCell>
                <TableCell align="right">
                  {editing?.id === row.id ? (
                    <DatePicker
                      value={editing.task.deadline}
                      onChange={(newValue: Date | null) => updateEditingTask('deadline', newValue)}
                    />
                  ) : (
                    row.deadline ? format(new Date(row.deadline), 'PP') : null
                  )}
                </TableCell>
                <TableCell align="right">
                  {row.done ? null : (
                    editing?.id === row.id ? (
                      <IconButton onClick={saveEditingTask}>
                        <CheckIcon />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => editTask(row.id)}>
                        <EditIcon />
                      </IconButton>
                    )
                  )}
                  <IconButton onClick={() => confirmDeleteTask(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div>No tasks yet. Click the add button to create a new task.</div>
      )}
      <Fab
        color="primary"
        aria-label="add"
        onClick={addTask}
        className={styles.addTask}
        size="medium"
      >
        <AddIcon />
      </Fab>
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {"Are you sure you want to delete this task? This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => deleteTask(deleteCandidate as number)} color="primary" autoFocus>
            Yes, delete it
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
