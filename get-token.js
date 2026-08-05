import https from 'https';

const req = https.request({
  hostname: 'keyvalue.xyz',
  path: '/new',
  method: 'POST'
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('TOKEN_URL:', data.trim());
  });
});

req.on('error', (err) => {
  console.error(err);
});

req.end();
