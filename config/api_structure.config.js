exports.structure = [{
        type: 'file',
        path: 'package.json',
        content: `
        {
            "name": "api",
            "version": "1.0.0",
            "description": "Node API",
            "main": "index.js",
            "scripts": {
              "start": "node server.js",
              "test": "echo \\"Error: no test specified\\" && exit 1"
            },
            "author": "",
            "license": "ISC",
            "dependencies": {
              "bcryptjs": "^2.4.3",
              "body-parser": "^1.19.0",
              "express": "^4.17.1",
              "express-validator": "^5.3.1",
              "jsonwebtoken": "^8.5.1",
              "mongoose": "^5.7.4"
            }
          }
        `
    },
    {
        type: 'file',
        path: '.gitignore',
        content: `
        .env
        node_modules
        **/env_config/
        `
    },
    {
        type: 'folder',
        path: 'server'
    },
    {
        type: 'file',
        path: 'server.js',
        content: `
        const server = require('./server/config/app')();
        const config = require('./server/config/config');
        const db = require('./server/config/db'); // uncomment after you have added your MongoDB credentials
        
        //create the basic server setup 
        // server.create(config, db); // To use MongoDB, pass the db creds to the create method
        server.create(config);
        
        //start the server
        server.start();`
    },
    {
        type: 'folder',
        path: 'server/config'
    },
    {
        type: 'file',
        path: 'server/config/app.js',
        content: `
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressValidator = require('express-validator')

module.exports = function () {
        let server = express(),
                create,
                start;

        create = (config, db) => {
                let routes = require('../routes');
                // set all the server things
                server.set('env', config.env);
                server.set('port', config.port);
                server.set('hostname', config.hostname);
                
                // add middleware to parse the json
                server.use(bodyParser.json());
                server.use(expressValidator())
                server.use(bodyParser.urlencoded({
                        extended: false
                }));

                if(db) {
                    //connect the database
                    mongoose.connect(
                            db.database,
                            { 
                                    useNewUrlParser: true,
                                    useCreateIndex: true
                            }
                    );
                }
                
                // Set up routes
                routes.init(server);
        };

        
        start = () => {
                let hostname = server.get('hostname'),
                        port = server.get('port');
                server.listen(port, function () {
                        console.log('Express server listening on - http://' + hostname + ':' + port);
                });
        };
        return {
                create: create,
                start: start
        };
};`
    },
    {
        type: 'file',
        path: 'server/config/db.js',
        content: `
        module.exports = {
            'database': 'mongodb://127.0.0.1:27017/restAPI'
          };
        `
    },
    {
        type: 'file',
        path: 'server/config/config.js',
        content: `
        // environment configs should be found in env_config folder (not included in git repo - local, staging, prod, etc.)
        const _ = require('lodash');
        const env = process.env.NODE_ENV || 'local';
        const envConfig = require('./env_config/' + env);
        let defaultConfig = {
            env: env,
            tokenExpiration: 86400,
            useUnifiedTopology: true
        };
        module.exports = _.merge(defaultConfig, envConfig);
        `
    },
    {
        type: 'folder',
        path: 'server/config/env_config'
    },
    {
        type: 'file',
        path: 'server/config/env_config/local.js',
        content: `
        const localConfig = {
            hostname: 'localhost',
            port: 3000,
            secret: 'restapisecret',
            db: {
                username: '{{db_user}}',
                pass: '{{db_pass}}'
            }
        };
        
        module.exports = localConfig;
        `
    },
    {
        type: 'folder',
        path: 'server/controllers'
    },
    {
        type: 'folder',
        path: 'server/controllers/apis'
    },
    {
        type: 'folder',
        path: 'server/controllers/apis/v1'
    },
    {
        type: 'file',
        path: 'server/controllers/apis/v1/auth.js',
        content: `
        const express = require('express');
        const authService = require('../../../services/auth');
        const validation = require('../../../middleware/validation');
        let router = express.Router();

        router.post('/register', validation.validateRegistrationBody(), authService.register);
        router.post('/login', validation.validateLoginBody(), authService.login);

        module.exports = router;
        `
    },
    {
        type: 'file',
        path: 'server/controllers/apis/v1/users.js',
        content: `
        const express = require('express');
        const userService = require('../../../services/user');
        const authClientRequest = require('../../../middleware/authGuard');
        let router = express.Router();

        router.get('/:userId', authClientRequest.authClientToken, userService.getUserDetails);

        module.exports = router;
        `
    },
    {
        type: 'folder',
        path: 'server/middleware'
    },
    {
        type: 'file',
        path: 'server/middleware/authGuard.js',
        content: `
        const express = require('express');
        const jwt = require('jsonwebtoken');
        const config = require('../config/config');

        const authClientToken = async (req,res,next) => {

            let token = req.headers['x-access-token'];
            
            if (!token){
                return res.status(401).json({
                    "errors" : [{
                        "msg" : " No token provided"
                    }]
                });
            } 
            
            jwt.verify(token,config.secret , (err,decoded) => {
                if(err){
                    return res.status(401).json({
                        "errors" : [{
                            "msg" : "Invalid Token"
                        }]
                    });
                }
                
                return next();
            });
        }

        module.exports = {
            authClientToken : authClientToken
        }
        `
    },
    {
        type: 'file',
        path: 'server/middleware/validation.js',
        content: `
        const { body } = require('express-validator/check')
        const validateRegistrationBody = () => {
            return [ 
                body('name')
                .exists()
                .withMessage('name field is required')
                .isLength({min:3})
                .withMessage('name must be greater than 3 letters'),
                body('email').exists()
                .withMessage('email field is required')
                .isEmail()
                .withMessage('Email is invalid'),
                body('password')
                .exists()
                .withMessage('password field is required')
                .isLength({min : 8,max: 12})
                .withMessage('password must be in between 8 to 12 characters long')
            ] 
        } 

        const validateLoginBody = () => {
            return [ 
                body('email').exists()
                .withMessage('email field is required')
                .isEmail()
                .withMessage('Email is invalid'),
                body('password')
                .exists()
                .withMessage('password field is required')
                .isLength({min : 8,max: 12})
                .withMessage('password must be in between 8 to 12 characters long')
            ] 
        } 

        module.exports = {
            validateRegistrationBody : validateRegistrationBody,
            validateLoginBody : validateLoginBody
        }
        `
    },
    {
        type: 'folder',
        path: 'server/models'
    },
    {
        type: 'file',
        path: 'server/models/user.js',
        content: `
        let mongoose = require('mongoose');
        let Schema = mongoose.Schema;

        var User = new Schema({
            name: {
                type: String,
                required: [true, 'name is required'],
                lowercase: true
            },
            email: {
                type: String,
                required: [true, 'email is required'],
                unique: true,
                lowercase: true
            },
            password: {
                type: String,
                required: [true, 'password is required']
            }
        }, {
            timestamps: true
        });

        module.exports = mongoose.model('User', User);
        `
    },
    {
        type: 'folder',
        path: 'server/routes'
    },
    {
        type: 'file',
        path: 'server/routes/index.js',
        content: `
        const apiRoute = require('./apis');

        const init = server => {
            server.get('*', (req, res, next) => {
                console.log('Request made to : ' + req.originalUrl);
                return next();
            });

            server.use('/api', apiRoute);
        }

        module.exports = {
            init: init
        }
        `
    },
    {
        type: 'folder',
        path: 'server/routes/apis'
    },
    {
        type: 'file',
        path: 'server/routes/apis/index.js',
        content: `
        const express = require('express');
        const v1ApiController = require('./v1');
        let router = express.Router();
        router.use('/v1', v1ApiController);
        module.exports = router;
        `
    },
    {
        type: 'file',
        path: 'server/routes/apis/v1.js',
        content: `
        const userController = require('../../controllers/apis/v1/users');
        const authController = require('../../controllers/apis/v1/auth');

        const express = require('express');
        let router = express.Router();
        router.use('/users', userController);
        router.use('/auth', authController);
        module.exports = router;
        `
    },
    {
        type: 'folder',
        path: 'server/services'
    },
    {
        type: 'file',
        path: 'server/services/auth.js',
        content: `
        const express = require('express');
        const bcrypt = require('bcryptjs');
        const jwt = require('jsonwebtoken')
        const { validationResult } = require('express-validator/check');

        const config = require('../config/config');
        const userModel = require('../models/user');

        const register = async (req,res,next) => {
            const errors = validationResult(req);

            if(!errors.isEmpty()){
                return res.status(422).json({ errors: errors.array() });
            }

            let { name, email , password } = req.body;

            let isEmailExists = await userModel.findOne({"email" : email});

            if(isEmailExists){
                return res.status(409).json({
                    "errors" : [{
                        "msg" : "email already exists"
                    }]
                })
            }

            let hashedPassword = await bcrypt.hash(password, 8);

            try{
                let user = await userModel.create({
                    name : name,
                    email: email,
                    password : hashedPassword
                });
            
                if(!user){
                    throw new error();
                }
            
                return res.status(201).json({
                    "success" : [{
                        "msg" : "user registered successfully"
                    }]
                });
            }catch(error){
                console.log(error);
                return res.status(500).json(
                    { 
                        "errors" : [{
                            "msg": "there was a problem registering a user."   
                        }]
                    }
                );
            }
            

        }

        const login = async (req,res,next) => {

            const errors = validationResult(req);

            if(!errors.isEmpty()){
                return res.status(422).json({ errors: errors.array() });
            }

            let { email, password } = req.body

            try{
                let isUserExists = await userModel.findOne({"email" : email});

                let isPasswordValid = await bcrypt.compare(password, isUserExists.password);

                if(!isUserExists || !isPasswordValid){
                    return res.status(401).json({
                        "errors" : [{
                            "msg" : "email/password is wrong"
                        }]
                    })
                }

                let token = jwt.sign({ id: isUserExists._id }, config.secret, { expiresIn: 86400 });

                res.status(200).json({
                    "success" : [{
                        "msg" : "user login successfully",
                        "email" : email,
                        "token" : token
                    }]
                })
            }catch(error){
                console.log(error);
                return res.status(500).json(
                    { 
                        "errors" : [{
                            "msg": "there was a problem login a user."   
                        }]
                    }
                );
            }
            
        }

        module.exports = {
            register : register,
            login : login
        }
        `
    },
    {
        type: 'file',
        path: 'server/services/user.js',
        content: `
        const express = require('express');
        const userModel = require('../models/user');

        const getUserDetails = async (req,res,next) => {

            let { userId } = req.params;

            let user = await userModel.findById(userId).select('name , email');

            if(!user){
                return res.status(404).json({
                    "errors":[{
                        "msg" : " no user found"
                    }]
                })
            }

            return res.status(200).json({
                "success" : [{
                    "msg" : " user fetched successfully",
                    "data" : user
                }]
            })
        }

        module.exports = {
            getUserDetails : getUserDetails
        }
        `
    }
];