const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3001;


app.use(bodyParser.json());


app.post('/preveri-geslo', (req, res) => {
    const vnesenoGeslo = req.body.geslo;
    const readStream = fs.createReadStream('./crackstation-human-only.txt', { encoding: 'utf8' });

    let gesloNajdeno = false;

    readStream.on('data', chunk => {

      const gesla = chunk.split('\n'); 

      if (gesla.includes(vnesenoGeslo)) {

        gesloNajdeno = true;
        readStream.close();
      }
    });

    readStream.on('close', () => {
      if (gesloNajdeno) {
        res.json({ message: 'Geslo je na seznamu pogostih gesel. Prosim izberite varnejše geslo.' });
      } else {
        res.json({ message: 'Geslo ni na seznamu pogostih gesel. Nadaljujte.' });
      }
    });

    readStream.on('error', err => {
      console.error(err);
      res.status(500).json({ error: 'Prišlo je do napake pri branju datoteke s gesli.' });
    });
  });


app.listen(port, () => {
  console.log(`Strežnik deluje na http://localhost:${port}`);
});
