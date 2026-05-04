import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response && err.response.data && err.response.data.error || err.message || '网络错误';
    console.error('[API Error]', msg);
    return Promise.reject(new Error(msg));
  }
);

export default client;
