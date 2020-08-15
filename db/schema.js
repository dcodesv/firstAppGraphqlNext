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
    type Client{
        id: ID
        firstName: String
        lastName: String
        company: String
        email: String
        phone: String
        created: String
        seller: ID
    }
    type Order{
        id: ID
        order: [listProductsOrder]
        total: Float
        client: ID
        seller: ID
        created: String
        state: orderState
    }
    type listProductsOrder{
        id: ID
        quantity: Int
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
    input clientInput{
        firstName: String!
        lastName: String!
        company: String!
        email: String!
        phone: String
    }
    input orderProductInput{
        id: ID
        quantity: Int
    }
    input orderInput{
        order: [orderProductInput]
        total: Float    
        client: ID
        state: orderState
    }
    enum orderState{
        PENDING
        COMPLETED
        CANCELLED
    }

    type Query {
        # Users
        getUser(token: String!): User

        # Products
        getProducts: [Product]
        getProductById(id: ID!): Product 

        #Clients
        getClients: [Client]
        getClientsBySeller: [Client]
        getClientById(id: ID!): Client
        getClientByIdBySeller(id: ID!): Client

        #Order
        getOrder: [Order]
        getOrderBySeller: [Order]
        getOrderById(id: ID!): Order
    }

    type Mutation{
        # Usuarios
        newUser(input: userInput) : User
        authUser(input: authUserInput) : Token

        # Productos
        newProduct(input: productInput) : Product
        editProduct(id: ID!, input: productInput): Product
        deleteProduct(id: ID!): Product

        # Clientes
        newClient(input: clientInput): Client
        editClient(id: ID!, input: clientInput): Client
        deleteClient(id: ID!): Client
        editClientBySeller(id: ID!, input: clientInput): Client
        deleteClientBySeller(id: ID!): Client

        # Order
        newOrder(input: orderInput) : Order
        editOrder(id: ID!, input: orderInput): Order
        deleteOrder(id: ID!): Order
    }
`;

module.exports = typeDefs