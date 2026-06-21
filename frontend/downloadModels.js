import fs from 'fs';
import https from 'https';
import path from 'path';

const dir = './public/models';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

const baseUrl = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';

files.forEach(file => {
  const dest = path.join(dir, file);
  const fileStream = fs.createWriteStream(dest);
  https.get(baseUrl + file, response => {
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log('Downloaded', file);
    });
  }).on('error', err => {
    console.error('Error downloading', file, err);
  });
});
