const {ApolloServer} = require("apollo-server")
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')
const conectarDB = require('./config/db')
const jwt = require("jsonwebtoken")
require('dotenv').config({path: 'variables.env'})
//Conectar a la base de datos
conectarDB()

//Servidor
const Server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) =>{
        //console.log(req.headers['authorization'])
        const token = req.headers["authorization"] || '';
        if(token){
            try {
                const user = jwt.verify(token, process.env.SECRETWORD);
                //console.log(user);
                return {
                    user
                }
            }catch(error){
                console.log(error);
            }
        }
    }
});


//Arrancar el servidor
Server.listen().then(({url})=>{
    console.log(`Servidor listo en la URL ${url}`)
})