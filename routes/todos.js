const express = require('express');
const router = express.Router(); // Router statt app
const taskController = require('../controllers/taskController'); // Controllers importieren
// middleware import 
const authMiddleware = require('../middleware/auth');
const app = express();

app.use(express.json());


router.get('/', authMiddleware, taskController.getTasks);
router.get('/search', authMiddleware, taskController.getTaskBySearch);
router.get('/:id', authMiddleware, taskController.getTasksById);


router.post('/', authMiddleware, taskController.createTask);

router.delete("/deleteAll", authMiddleware, taskController.deleteAllTasks);
router.delete('/:id', authMiddleware, taskController.deleteTask); // wichtig das erst die spezifische route in dem Fall deleteAll und danach eine mit einem Platzhalter wie :id


router.put('/:id', authMiddleware, taskController.updateTask);

router.patch('/:id', authMiddleware, taskController.patchTask);


module.exports = router;