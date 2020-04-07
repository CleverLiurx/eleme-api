const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const xmlparser = require('express-xml-bodyparser');
const history = require('connect-history-api-fallback');

const login = require('./routes/api/login');
const city = require('./routes/api/city');
const profile = require('./routes/api/profile');
const users = require('./routes/api/user');
const order = require('./routes/api/order');

const keys = require('./config/keys');

const app = express();

app.use(history());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(xmlparser());
app.use(express.static('dist'));



//设置跨域访问
app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With');
	res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
	res.header('X-Powered-By', ' 3.2.1');
	res.header('Content-Type', 'application/json;charset=utf-8');
	next();
});

mongoose
	.connect(keys.MONGODB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => console.log('MongoDB connected successful~'))
	.catch(err => console.log(err));

app.use('/api/login', login);
app.use('/api/city', city);
app.use('/api/profile', profile);
app.use('/api/user', users);
app.use('/api/order', order);


app.listen(3000, () => console.log("Server is running..."));
