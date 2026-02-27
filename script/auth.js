const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'keyclouds2025'
};

//Nombre de la clave en el localstorage
const SESSION_KEY = 'keyclouds_admin_session';

//Duracion de la sesion
const SESSION_DURATION = 24 * 60 * 60 * 1000;

/**
 * Intenta iniciar sesión con las credenciales proporcionadas
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {boolean} - True si el login fue exitoso
 */

function login(username, password) {
    if(username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const session = {
            username: username,
            loginTime: Date.now(),
            expiresAt: Date.now() + SESSION_DURATION
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return true;
    }
    return false;
}

//Cierre sesion actual
function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
}

//verifica si el usuario esta autentificado
function isAuthenticated() {
    try {
        const sessionData = localStorage.getItem(SESSION_KEY);
        
        if(!sessionData){
            return false;
        }
        
        const session = JSON.parse(sessionData);
        const now = Date.now();

        //veridica si la sesion ha expirado
        if (now > session.expiresAt) {
            //Sesion expirada
            localStorage.removeItem(SESSION_KEY);
            return false;
        }

        return true;
    }catch (e){
        console.error('Error verificando la autenticacion:', e);
        return false;
    }
}

/**
 * Obtiene informacion de la sesion actual
 * @returns {Object|null} - Datos de la sesion o null
 */

function getSessionData() {
    try {
        const sessionData = localStorage.getItem(SESSION_KEY);
        if(!sessionData) return null;

        const session = JSON.parse(sessionData);
        
        if(Date.now() > session.expiresAt) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        
        return session;
    } catch (e) {
        console.error('Error obteniendo datos de sesion:', e);
        return null;
    }
}

/**
 * Renueva la sesion actual
 */
function renewSession(){
    const session = getSessionData();

    if(session){
        session.expiresAt = Date.now() + SESSION_DURATION;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
}

/**
 * protegue la pagina requeriendo autenticacion
 * refirigue al login en caso de no estar autenticado
 */
function requireAuth() {
    if(!isAuthenticated()) {
        sessionStorage.setItem('redirect_after_login', window.location.pathname);
        window.location.href = 'login.html';
        return false;
    }
    renewSession();
    return true;
}

/**
 * Obtiene el tiempo restante de la sesion en milisegundos
 * @returns {number|null} - Tiempo restante o null si no hay sesion
 */
function getSessionTimeRemaining() {
    const session = getSessionData();
    if(!session) return 0;

    const remaining = session.expiresAt - Date.now();
    return Math.floor(remaining / (100 * 60));
}
//Utilidades

/**
 * Cambiar la contrasela del administrador
 */
function changeAdminPassword(newPassword) {
    if(oldPassword !== ADMIN_CREDENTIALS.password) {
        return {
            success: false,
            message: 'la contraseña actual es incorrecta'
        };
    }

    if(newPassword.length < 8) {
        return {
            success: false,
            message: 'la nueva contraseña debe tener al menos 8 caracteres'
        };
    }
}