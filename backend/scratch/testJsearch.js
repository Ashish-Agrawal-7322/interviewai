import https from 'https';

const options = {
  hostname: 'jsearch.p.rapidapi.com',
  path: '/search?query=frontend%20developer&num_pages=1',
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '6562a99147msh2330516ec87e3f6p13309ejsn9b06c351d8ed',
    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    if (res.statusCode === 200) {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json.data.slice(0, 2), null, 2));
    } else {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
