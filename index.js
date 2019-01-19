const express = require('express');
const app     = express();
const helmet  = require('helmet');

app.use(helmet());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('./view/public/'));

require('ejs').delimiter = '?';
app.set('view engine', 'ejs');
app.set('views', './view/template/');

app.use(require('./controller/'));

let server = app.listen(process.env.PORT || '9001')
.on('listening', () => console.info(server.address()));