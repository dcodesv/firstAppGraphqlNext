const {gql} = require("apollo-server")

//Schema
const typeDefs = gql`

    # Types
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
    type Product{
        id: ID
        name: String
        stock: Int
        price: Float
        created: String
    }

    # Inputs
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
    input productInput{
        name: String!
        stock: Int!
        price: Float!
    }

    type Query {
        # Users
        getUser(token: String!): User

        # Products
        getProducts: [Product]
        getProductById(id: ID!): Product 
    }

    type Mutation{
        # Usuarios
        newUser(input: userInput) : User
        authUser(input: authUserInput) : Token

        # Productos
        newProduct(input: productInput) : Product
        editProduct(id: ID!, input: productInput): Product
        deleteProduct(id: ID!): Product
    }
`;

module.exports = typeDefs