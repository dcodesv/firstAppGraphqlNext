const User = require('../models/User')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({path: 'variables.env'})

const createToken = (user, secretword, expiresIn) => {
    console.log(user)
    const {id, email, firstName, lastName } = user

    return jwt.sign({ id, email, firstName, lastName }, secretword, { expiresIn })
    
}
//Resolvers
const resolvers = {
    Query: {
        getUser: async (_,{token}) => {
            const userId = await jwt.verify(token, process.env.SECRETWORD)
            return userId
        }
    },
    Mutation:{
        newUser: async (_,{input}) => {

            //Destructuring
            const { email, password } = input

            //Revisar que el usuario este registrado
            const existUser = await User.findOne({email})
            console.log(existUser)
            if(existUser){
                throw new Error("El usuario ya esta registrado")
            }
            //Hashear password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt)

            try{
                //Guardar en la base de datos
                const user = new User(input)
                user.save() // guardado
                return user

            }catch (error){
                console.log(error)
            }
        },

        authUser: async (_,{input}) => {

            //Destructuring
            const {email, password} = input

            //Si el usuario existe
            const existUser = await User.findOne({email})
            if(!existUser){
                throw new Error("El usuario no existe");
            }

            //revisar si el password es correcto
            const correctPass = await bcryptjs.compare(password, existUser.password)
            if(!correctPass){
                throw new Error("El password es incorrecto");
            }

            //Crear el token

            return{
                token: createToken(existUser, process.env.SECRETWORD, '24h')
            }
        }
    }
}

module.exports = resolvers