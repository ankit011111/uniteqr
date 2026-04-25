const http = require('http');

const post = (path, data, token = null) => {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': dataStr.length,
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
};

async function main() {
  try {
    // 1. Login as employee
    const loginRes = await post('/api/auth/login', { username: 'employee', password: 'employee123' });
    if (loginRes.status !== 200) {
      console.error('Login failed:', loginRes);
      return;
    }
    const token = loginRes.data.token;

    // 2. Create Cafe
    const cafeRes = await post('/api/employee/create-cafe', {
      cafeName: 'The Great Indian Cafe',
      phone: '9876543210',
      tables: 5
    }, token);

    console.log(JSON.stringify(cafeRes.data, null, 2));

  } catch (err) {
    console.error(err);
  }
}
main();
