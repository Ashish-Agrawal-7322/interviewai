import https from 'https';

https.get('https://remotive.com/api/remote-jobs?limit=5', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(JSON.parse(data));
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
