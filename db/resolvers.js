const User = require('../models/User')
const Product = require('../models/Product')
const Client = require('../models/Client')
const Order = require('../models/Order')
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
        },
        getClientsBySeller: async (_, {}, ctx) => {
            try{
                const clients = await Client.find({seller: ctx.user.id.toString()});
                return clients;
            }catch(error){
                console.log(error)
            }
        },
        getClientById: async (_,{id}) => {
            //Revisar si el producto Existe
            const existClient = await Client.findById(id)
            if(!existClient){
                throw new Error('Cliente no encontrado')
            }
            return existClient
        },
        getClientByIdBySeller: async (_,{id}, ctx) => {
            //Revisar si el producto Existe
            const existClient = await Client.findById(id)
            if(!existClient){
                throw new Error('Cliente no encontrado')
            }
            if(existClient.seller.toString() !== ctx.user.id){
                throw new Error ('No estas autorizado para ver este cliente');
            }
            return existClient
        },

        getOrder: async () => {
            try{
                const order = await Order.find({});
                return order;
            }catch(error){
                console.log(error);
            }
        },
        getOrderBySeller: async (_, {}, ctx) => {
            try{
                const order = await Order.find({seller: ctx.user.id});
                return order;
            }catch(error){
                console.log(error);
            }
        },
        getOrderById: async (_,{id}, ctx) =>{
            try{    
                //Revisar si el pedido Existe
                const existOrder = await Order.findById(id)
                if(!existOrder){
                    throw new Error('Pedido no encontrado')
                }
                return existOrder;

                //Solo quien lo creo lo puede ver
                if(existOrder.seller.toString() !== ctx.user.id){
                    throw new Error('No tienes permisos para ver esta orden.')
                }
                
            }catch(error){
                console.log(error);            
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

        },
        editClient: async (_,{id,input}) => {
            //Revisar si el Cliente Existe
            let existClient = await Client.findById(id)
            if(!existClient){
                throw new Error('Cliente no encontrado')
            }
            //guardar en la base de datos
            existClient = await Client.findOneAndUpdate({_id: id}, input, {new:true})
            return existClient
        },
        deleteClient: async (_,{id}) => {
            //Revisar si el Cliente Existe
            let existClient = await Client.findById(id)
            if(!existClient){
                throw new Error('Cliente no encontrado')
            }
            //Eliminar
            existClient = await Client.findByIdAndDelete({_id : id})
            return existClient
        },

        //Edit and delete by Seller
        editClientBySeller: async (_,{id,input}, ctx) => {
            //Revisar si el Cliente Existe
            let existClient = await Client.findById(id)
            if(!existClient){
                throw new Error('Cliente no encontrado')
            }
            //Verificamos que el vendedor sea el que edita
            if(existClient.seller.toString() !== ctx.user.id){
                throw new Error ('No estas autorizado para editar este cliente');
            } 
            //guardar en la base de datos
            existClient = await Client.findOneAndUpdate({_id: id}, input, {new:true})
            return existClient
        },
        deleteClientBySeller: async (_,{id}, ctx) => {
            //Revisar si el Cliente Existe
            let existClient = await Client.findById(id)
            if(!existClient){
                throw new Error('Cliente no encontrado')
            }
            //Verificamos que el vendedor sea el que elimina
            if(existClient.seller.toString() !== ctx.user.id){
                throw new Error ('No estas autorizado para eliminar este cliente');
            } 
            //Eliminar
            existClient = await Client.findByIdAndDelete({_id : id})
            return existClient
        },

        newOrder: async (_, {input}, ctx) =>{
            const {client} = input
            //Verificar si el cliente existe
            let existClient = await Client.findById(client)
            if(!existClient){
                throw new Error('Cliente no encontrado')
            }

            //Verificar si el cliente es del vendedor
            if(existClient.seller.toString() !== ctx.user.id){
                throw new Error ('No estas autorizado para crear orden para este cliente');
            } 

            //Revisar que el stock este disponible
            for await (const art of input.order) {
                const {id} = art;

                const product = await Product.findById(id);

                if(art.quantity > product.stock){
                    throw new Error(`El articulo : ${product.name} excede la cantidad disponible`)
                }else{
                    product.stock = product.stock - art.quantity;
                    await product.save();
                }
            }

            //Crear pedido
            const newOrder = new Order(input);

            //Asignarle un vendedor
            newOrder.seller = ctx.user.id;

            const result = await newOrder.save();
            return result;

            //
        },
        editOrder: async (_,{id,input}, ctx) => {
            const {client} = input
            //Revisar si el Pedido Existe
            let existOrder = await Order.findById(id)
            if(!existOrder){
                throw new Error('Pedido no encontrado')
            }
            //Revisar si el Cliente Existe
            let existClient = await Client.findById(client)
            if(!existClient){
                throw new Error('Cliente no encontrado')
            }
            //Verificar si el cliente es del vendedor
            if(existClient.seller.toString() !== ctx.user.id){
                throw new Error ('No estas autorizado para crear orden para este cliente');
            } 
            //Revisar que el stock este disponible
            for await (const art of input.order) {
                const {id} = art;

                const product = await Product.findById(id);

                if(art.quantity > product.stock){
                    throw new Error(`El articulo : ${product.name} excede la cantidad disponible`)
                }else{
                    product.stock = product.stock - art.quantity;
                    await product.save();
                }
            }
            
            //Guardar pedido
            const result = await Order.findOneAndUpdate({_id: id}, input, {new:true})
            return result
        },
        deleteOrder: async (_,{id}) => {
            //Revisar si el Cliente Existe
            let existClient = await Client.findById(id)
            if(!existClient){
                throw new Error('Cliente no encontrado')
            }
            //Eliminar
            existClient = await Client.findByIdAndDelete({_id : id})
            return existClient
        },



    }
}

module.exports = resolvers