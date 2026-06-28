const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
      studentCode: 'ADMIN001',
      password: 'password123',
    });
    const token = loginRes.data.data.accessToken;
    console.log('Logged in successfully');

    const filePath = path.join(__dirname, '..', 'mau_import_diem.xlsx');
    const fileStream = fs.createReadStream(filePath);

    const form = new FormData();
    form.append('semesterId', '3'); // Active semester ID
    form.append('file', fileStream);

    console.log('Sending import request with actual excel file...');
    const res = await axios.post('http://localhost:3001/api/v1/scores/import', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('ERROR status:', err.response?.status);
    console.error('ERROR data:', JSON.stringify(err.response?.data, null, 2));
  }
}

test();
