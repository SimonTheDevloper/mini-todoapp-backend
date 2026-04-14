const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { registerValidation, handleValidationErrors } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/auth');


router.post('/register',
    authLimiter,                    // damit man nicht zu viele request innerhalb einer Zeit machen kann und bruteforce verhindert wird
    registerValidation,            //  Prüft Regeln
    handleValidationErrors,       //  Checkt ob Fehler da sind
    userController.createUser);  //  Wird nur ausgeführt wenn 1+2 OKuserController.createUser
router.post('/login',
    authLimiter,
    userController.authenticateUser);
router.post('/refresh',
    authLimiter,
    userController.refreshAccessToken);
router.post('/logout',
    authLimiter,
    userController.logoutUser
);
router.post('/',
    authLimiter,
    authMiddleware,
    userController.deleteAccount);
module.exports = router;