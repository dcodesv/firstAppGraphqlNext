const User = require('../models/User')
//Resolvers
const resolvers = {
    Query: {
        obtenerCursos: () => "Algo"
    },
    Mutation:{
        newUser: (_,{input}) => {

            //Revisar que el usuario este registrado

            //Hashear password

            //Guardar en la base de datos
        }
    }
}

module.exports = resolvers