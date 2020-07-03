const User = require('../models/User')
const Product = require('../models/Product')
const Client = require('../models/Client')
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
        //Users
        getUser: async (_,{token}) => {
            const userId = await jwt.verify(token, process.env.SECRETWORD)
            return userId
        },

        //Products
        getProducts: async () => {
            try{
                const products = await Product.find({})
                return products
            }catch (error){
                console.log(error)
            }
        },
        getProductById: async (_,{id}) => {
            //Revisar si el producto Existe
            const existProduct = await Product.findById(id)
            if(!existProduct){
                throw new Error('Producto no encontrado')
            }
            return existProduct
        },

        getClients: async () => {
            try{
                const clients = await Client.find({});
                return clients;
            }catch(error){
                console.log(error)
            }
        }
    },
    Mutation:{

        //Users
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
        },

        //Products
        newProduct: async (_,{input}) => {
            //Destructuring
//            const { name,price,stock } = input

            try{
                //Guardar en la base de datos
                const product = new Product(input)
                const resultado = await product.save() // Guardado
                return resultado

            }catch (error){
                console.log(error)
            }            
        },
        editProduct: async (_,{id,input}) => {
            //Revisar si el producto Existe
            let existProduct = await Product.findById(id)
            if(!existProduct){
                throw new Error('Producto no encontrado')
            }
            //guardar en la base de datos
            existProduct = await Product.findOneAndUpdate({_id: id}, input, {new:true})
            return existProduct
        },
        deleteProduct: async (_,{id}) => {
            //Revisar si el producto Existe
            let existProduct = await Product.findById(id)
            if(!existProduct){
                throw new Error('Producto no encontrado')
            }
            //Eliminar
            existProduct = await Product.findByIdAndDelete({_id : id})
            return existProduct
        },

        //Clientes
        newClient: async (_, {input}, ctx) => {
            console.log(ctx);
            const {email} = input;
            //Verificar que el cliente ya esta registrado
            const client = await Client.findOne({ email });
            if(client){
                throw new Error('El cliente ya esta asignado');
            }
            const saveClient = new Client(input);
            //Asign user id 
            saveClient.seller = ctx.user.id;

            try{
                
                const result =  await saveClient.save();
                return result;   
            }catch(error){
                console.log(error);
            }

        }
    }
}

module.exports = resolvers