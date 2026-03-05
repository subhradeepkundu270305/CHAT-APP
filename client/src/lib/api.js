import axios from 'axios';

// A configured axios instance shared across the entire app.
// The response interceptor catches 401 errors globally:
// if the backend says the token is invalid/expired, we clear
// localStorage and redirect the user to /login automatically.
const api = axios.create({
    baseURL: '/',
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is stale or invalid — force logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
