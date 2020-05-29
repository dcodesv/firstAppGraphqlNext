const {gql} = require("apollo-server")

//Schema
const typeDefs = gql`
    type User{
        id: ID
        firstName: String
        lastName: String
        email: String
        created: String
    }
    input userInput{
        firstName: String!
        lastName: String!
        email: String!
        password: String!
    }
    type Query {
        obtenerCursos: String
    }

    type Mutation{
        newUser(input: userInput): String
    }
`;

module.exports = typeDefs