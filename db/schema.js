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

    type Token{
        token: String
    }

    input userInput{
        firstName: String!
        lastName: String!
        email: String!
        password: String!
    }

    input authUserInput{
        email: String!
        password: String!
    }

    type Query {
        getUser(token: String!): User
    }

    type Mutation{
        newUser(input: userInput) : User
        authUser(input: authUserInput) : Token
    }
`;

module.exports = typeDefs